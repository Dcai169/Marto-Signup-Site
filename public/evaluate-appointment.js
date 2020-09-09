//#region variable delarations 
let vehicleType = document.getElementById('vehicle-type')
let calculateButton = document.getElementById('calculate-button');

let exteriorService = document.getElementById('exterior-service');
let interiorService = document.getElementById('interior-service');

let dateInput = document.getElementById('app-date');
let timeInput = document.getElementById('app-time');
let display = document.getElementById('datetime-display');

let bookedDateTimes = undefined;
//#endregion

// Blatently copied from Stack Overflow
function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function servicesAreValid(appDate) {
    return !(exteriorService.value === 'none' && interiorService.value === 'none');
}

// Make a get request to a given url
function httpGETAsync(url, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", url, true); // true for asynchronous 
    xmlHttp.send(null);
}

function httpPOSTAsync(url, obj, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("POST", url, true);
    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    xmlHttp.send(JSON.stringify(obj));
}

// Set every time option to a given state
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
    bookedDateTimes[0].forEach(app => {
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
        bookedDateTimes[0].forEach((app) => {
            if (app.appStart.toDateString() === projectedEnd.toDateString() && app.appStart < projectedEnd) {
                timeInput.options[i].disabled = true;
            }
        });
    }
}

function setDisabledBasedOnOpenings() {
    for (var i = 1; i < timeInput.options.length; i++) {
        let timeArray = timeInput.options[i].value.split(':').map((obj) => { return Number(obj) });
        let itemDate = new Date(dateInput.valueAsNumber + 1.44e+7 + (timeArray[0] + 4) * 3.6e+6 + timeArray[1] * 6.0e+4);
        bookedDateTimes[1].forEach((openTime) => {
            if (new Date(openTime.openStart) <= itemDate && itemDate < new Date(openTime.openEnd)) {
                timeInput.options[i].disabled = false;
            } else {
                timeInput.options[i].disabled = true;
            }
        });
    }
}

function getBookedTimeSlots() {
    // https://martocarwash.herokuapp.com/booked
    httpGETAsync('http://localhost:8770/booked', (resText) => {
        newBookedDateTimes = JSON.parse(resText)
        newBookedDateTimes[0].map((app) => { return { appStart: new Date(app.appStart), appEnd: new Date(app.appEnd) } });
        newBookedDateTimes[1].map((open) => { return { openStart: new Date(open.openStart), openEnd: new Date(open.openEnd) } });
        console.log(newBookedDateTimes)
        if (JSON.stringify(newBookedDateTimes) !== JSON.stringify(bookedDateTimes)) {
            console.log("New appointment detected");
        }
        bookedDateTimes = newBookedDateTimes;
        setDisabledBasedOnCurrentTime(new Date());
        setDisabledBasedOnOtherBookings();
        setDisabledPreemptivelyPreventOverlaps();
        setDisabledBasedOnOpenings();
    });
    console.log("Bookings Updated");
}

// POST a reservation for an appointment and save Id in a cookie.
function submitAppointmentReservation() {
    let id = new Date().valueOf().toString(32);
    let POSTData = {
        'client-name': id,
        'app-name': getSelectedTimeObj().toLocaleString(),
        'app-duration': `${calcServiceCost().hours}hrs`,
        'expiration-time': new Date(new Date().valueOf + 3.6e+6 * (4 + 0.5)).toLocaleString(),
        'special-instructions': 'Reserved booking. This indicates that a user is considering this time slot.',
    };

    httpPOSTAsync('https://martocarwash.herokuapp.com/reserve', POSTData, (res) => { });
}

// Calculate duration and cost of services
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

calculateButton.addEventListener('click', (e) => {
    e.preventDefault();
    let serviceCost = calcServiceCost();

    let appDate = getSelectedTimeObj();
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
    setDisabledBasedOnOpenings();
});

let reloadPeriodic = setInterval(() => { location.reload() }, 1000 * 60 * 60);
let refreshID = setInterval(getBookedTimeSlots, 1000 * 60);
