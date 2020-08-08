let vehicleType = document.getElementById('vehicle-type')
let calculateButton = document.getElementById('calculate-button');

let exteriorService = document.getElementById('exterior-service');
let interiorService = document.getElementById('interior-service');

let dateInput = document.getElementById('app-date');
let timeInput = document.getElementById('app-time');
let display = document.getElementById('datetime-display');

let bookedDateTimes = undefined;

function servicesAreValid(appDate) {
    return !(exteriorService.value === 'none' && interiorService.value === 'none');
}

function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function setTimeInputState(disabledState, hiddenState) {
    for (var i = 1; i < timeInput.options.length; i++) {
        timeInput.options[i].disabled = disabledState;
        timeInput.options[i].hidden = hiddenState;
    }
}

function getSelectedTimeObj() {
    let timeArray = timeInput.value.split(':').map((obj) => { return Number(obj) });
    return new Date(dateInput.valueAsNumber + 1.44e+7 + timeArray[0] * 3.6e+6 + timeArray[1] * 6.0e+4); // Plus 4 hrs to UTC
}

function getTimeOfOption(option) {
    let timeArray = option.value.split(':').map((obj) => { return Number(obj) });
    new Date(dateInput.valueAsNumber + 1.44e+7 + timeArray[0] * 3.6e+6 + timeArray[1] * 6.0e+4)
}

function setDisabledBasedOnCurrentTime(minTime) {
    for (var i = 1; i < timeInput.options.length; i++) {
        let timeArray = timeInput.options[i].value.split(':').map((obj) => { return Number(obj) });
        if (minTime > new Date(dateInput.valueAsNumber + 1.44e+7 + timeArray[0] * 3.6e+6 + timeArray[1] * 6.0e+4)) {
            timeInput.options[i].disabled = true;
            timeInput.options[i].hidden = true;
        }
    }
}

function setDisabledBasedOnOtherBookings() {
    bookedDateTimes.forEach(app => {
        for (var i = 1; i < timeInput.options.length; i++) {
            let timeArray = timeInput.options[i].value.split(':').map((obj) => { return Number(obj) });
            let itemDate = new Date(dateInput.valueAsNumber + 1.44e+7 + timeArray[0] * 3.6e+6 + timeArray[1] * 6.0e+4);
            if (app.appStart <= itemDate && itemDate < app.appEnd) {
                timeInput.options[i].disabled = true;
            }
        }
    });
}

function setDisabledPreemptivelyPreventOverlaps() {
    for (var i = 1; i < timeInput.options.length; i++) {
        let timeArray = timeInput.options[i].value.split(':').map((obj) => { return Number(obj) });
        let projectedEnd = new Date(dateInput.valueAsNumber + 1.44e+7 + (timeArray[0] + calcServiceCost().hours) * 3.6e+6 + timeArray[1] * 6.0e+4);
        // console.log(timeInput.options[i].value);
        bookedDateTimes.forEach((app) => {
            if (app.appStart.toDateString() === projectedEnd.toDateString() && app.appStart < projectedEnd) {
                timeInput.options[i].disabled = true;
            }
        });
    }
}

function getBookedTimeSlots() {
    httpGetAsync('https://martocarwash.herokuapp.com/booked', (resText) => {
        bookedDateTimes = JSON.parse(resText).map((app) => { return { appStart: new Date(app.appStart), appEnd: new Date(app.appEnd) } });;
        setDisabledBasedOnCurrentTime(new Date());
        setDisabledBasedOnOtherBookings();
        setDisabledPreemptivelyPreventOverlaps();
    });
    // console.log("Slots Updated");
}

function calcServiceCost() {
    let serviceCost = { hours: 0, price: 0 };
    let appDate = getSelectedTimeObj();
    switch (vehicleType.value) {
        case 'Sedan':
        case 'Convertible':
        case 'Hatchback':
        case 'Station Wagon':
            if (exteriorService.value.includes("wash")) {
                serviceCost.hours += 1;
                serviceCost.price += 20;
            } else if (exteriorService.value.includes("detail")) {
                serviceCost.hours += 2;
                serviceCost.price += 40;
            }

            if (interiorService.value.includes("clean")) {
                serviceCost.hours += 1;
                serviceCost.price += 75;
            } else if (interiorService.value.includes("detail")) {
                serviceCost.hours += 2.5;
                serviceCost.price += 150;
            }
            break;

        case 'Minivan':
        case 'SUV':
            if (exteriorService.value.includes("wash")) {
                serviceCost.hours += 1.5;
                serviceCost.price += 30;
            } else if (exteriorService.value.includes("detail")) {
                serviceCost.hours += 2.5;
                serviceCost.price += 50;
            }

            if (interiorService.value.includes("clean")) {
                serviceCost.hours += 1.5;
                serviceCost.price += 100;
            } else if (interiorService.value.includes("detail")) {
                serviceCost.hours += 3;
                serviceCost.price += 150;
            }
            break;

        case 'Truck':
        case 'Van':
            if (exteriorService.value.includes("wash")) {
                serviceCost.hours += 1.5;
                serviceCost.price += 35;
            } else if (exteriorService.value.includes("detail")) {
                serviceCost.hours += 3;
                serviceCost.price += 55;
            }

            if (interiorService.value.includes("clean")) {
                serviceCost.hours += 1;
                serviceCost.price += 100;
            } else if (interiorService.value.includes("detail")) {
                serviceCost.hours += 2.5;
                serviceCost.price += 100;
            }
            break;

        default:
            break;
    }
    return serviceCost;
}

function serviceEventHandler(ev) {
    if (exteriorService.value !== 'none' && interiorService.value !== 'none' && vehicleType.value !== 'none') {
        $('#app-time').removeAttr('disabled');
        $('#app-date').removeAttr('disabled');
        setDisabledPreemptivelyPreventOverlaps();
        // var latestStartTime = new Date(dateInput.valueAsDate.valueOf() - calcServiceCost().hours * 3.6e+6);
        // console.log(latestStartTime.toLocaleString());

    }
}

vehicleType.addEventListener('change', serviceEventHandler);
dateInput.addEventListener('change', serviceEventHandler);
exteriorService.addEventListener('change', serviceEventHandler);
interiorService.addEventListener('change', serviceEventHandler);

calculateButton.addEventListener('click', (ev) => {
    e.preventDefault();
    let serviceCost = calcServiceCost();

    if (servicesAreValid(appDate)) {
        display.innerHTML = `Your appointment will be on ${appDate.toLocaleDateString()} from ${appDate.toLocaleTimeString()} to ${new Date(appDate.valueOf() + serviceCost.hours * 3.6e+6).toLocaleTimeString()}, and will cost $${serviceCost.price}.`
        $('#main-form-submit').removeAttr('disabled');
    }
});

window.onload = function () {
    let loadTime = new Date();
    dateInput.defaultValue = loadTime.toISOString().substring(0, 10);
    $('#app-date').prop('min', loadTime.toISOString().substring(0, 10));
    $('#main-form-submit').attr("disabled", true);
    setTimeInputState(false, false);
    getBookedTimeSlots();
    // console.log(loadTime);
};

dateInput.addEventListener('change', (ev) => {
    setTimeInputState(false, false);
    setDisabledBasedOnCurrentTime(new Date());
    setDisabledBasedOnOtherBookings();
    setDisabledPreemptivelyPreventOverlaps();
});

let refreshID = setInterval(getBookedTimeSlots, 1000 * 60 * 10);
