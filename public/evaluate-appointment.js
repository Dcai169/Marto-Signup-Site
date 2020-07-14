let vehicleType = document.getElementById('vehicle-type')
let calculateButton = document.getElementById('calculate-button');

// let exteriorNone = document.getElementById('exterior-none');
let exteriorService = document.getElementById('exterior-service');
let interiorService = document.getElementById('interior-service');

let dateInput = document.getElementById('app-date');
let hourInput = document.getElementById('app-hour');
let minuteInput = document.getElementById('app-min');
let display = document.getElementById('datetime-display');

$('#app-date').prop('min', new Date().toISOString().substring(0, 10));
$('#main-form-submit').attr("disabled", true);

function appDateTimeIsValid(date) {
    return date.toString() !== 'Invalid Date' || hourInput.value !== 'none' || minuteInput.value !== 'none';
}

calculateButton.addEventListener('click', (e) => {
    e.preventDefault();
    let serviceCost = { hours: 0, price: 0 };
    let appDate = new Date(dateInput.valueAsNumber + 1.44e+7);
    appDate.setHours((hourInput.value.includes("a") ? hourInput.value.substring(0, 2) : Number(hourInput.value.substring(0, 2)) + 12), (minuteInput.value.includes("3") ? 30 : 00))
    switch (vehicleType.value) {
        case 'Sedan':
        case 'Convertable':
            if (exteriorService.value.includes("wash")) {
                serviceCost.hours += 1;
                serviceCost.price += 15;
            } else if (exteriorService.value.includes("detail")) {
                serviceCost.hours += 2;
                serviceCost.price += 30;
            }

            if (interiorService.value.includes("clean")) {
                serviceCost.hours += 1;
                serviceCost.price += 25;
            } else if (interiorService.value.includes("detail")) {
                serviceCost.hours += 2.5;
                serviceCost.price += 75;
            }
            break;

        case 'Minivan':
        case 'SUV':
            if (exteriorService.value.includes("wash")) {
                serviceCost.hours += 1.5;
                serviceCost.price += 20;
            } else if (exteriorService.value.includes("detail")) {
                serviceCost.hours += 2.5;
                serviceCost.price += 40;
            }

            if (interiorService.value.includes("clean")) {
                serviceCost.hours += 1.5;
                serviceCost.price += 30;
            } else if (interiorService.value.includes("detail")) {
                serviceCost.hours += 3;
                serviceCost.price += 85;
            }
            break;

        case 'Truck':
        case 'Van':
            if (exteriorService.value.includes("wash")) {
                serviceCost.hours += 1.5;
                serviceCost.price += 25;
            } else if (exteriorService.value.includes("detail")) {
                serviceCost.hours += 3;
                serviceCost.price += 50;
            }

            if (interiorService.value.includes("clean")) {
                serviceCost.hours += 1;
                serviceCost.price += 25;
            } else if (interiorService.value.includes("detail")) {
                serviceCost.hours += 2.5;
                serviceCost.price += 75;
            }
            break;

        default:
            break;
    }
    if (appDateTimeIsValid(appDate)) {
        display.innerHTML = `Your appointment is at ${appDate.toLocaleString()}, will take ${serviceCost.hours} ${(serviceCost.hours > 1 ? "hours" : "hour")}, and will cost $${serviceCost.price}.`
        $('#main-form-submit').removeAttr('disabled');
    }
});
