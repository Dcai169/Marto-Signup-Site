const express = require('express');
const bodyParser = require('body-parser');
const { check, body, validationResult } = require('express-validator');
const router = express.Router();
// let AppointmentModel = require('./models/appointment.js');
// let UserModel = require('./models/user.js');
const { GoogleSpreadsheet } = require('google-spreadsheet');

let doc = null;
(async () => {
    doc = new GoogleSpreadsheet('1RXtdcuZ9MKMl9q6ceS7-Txz8OwZFfQmie8i1KmwT7O0');
    await doc.useServiceAccountAuth(require('./service-acc.json'));
    await doc.loadInfo();
    console.log('GSpread Ready')
})();

appointmentValidators = [
    check('client-email').isEmail().normalizeEmail(),
    check('app-phone').isMobilePhone().withMessage('Invalid phone number'),
    check('vehicle-type').isIn(['Sedan', 'Convertible', 'Hatchback', 'Station Wagon', 'Minivan', 'SUV', 'Truck', 'Van']),
    check('exterior-service').isIn(['exterior-none', 'exterior-wash', 'exterior-detail']),
    check('interior-service').isIn(['interior-none', 'interior-clean', 'interior-detail']),
    // check('app-date').isBefore().withMessage('Date is in the past').isISO8601(),
    check('app-date').isISO8601(),
    // check('app-hour').isIn(['10am', '11am', '12am', '01pm', '02pm','03pm', '04pm', '05pm']),
    // check('app-min').isIn([':00', ':30'])
];
appointmentSanitizers = [
    body('vehicle-model').escape(),
    body('client-name').escape(),
    body('client-address').escape(),
    body('client-city').escape(),
    // body('app-state').escape(),
    body('special-instructions').escape()
];

router.get('/', (req, res) => {
    console.log(`GET ${req.ipInfo['ip'].substring(7)}${(req.ipInfo.error ? "" : `${(req.ipInfo.city ? ' ' + req.ipInfo.city : '')}${(req.ipInfo.region ? ' ' + req.ipInfo.region + ',' : '')} ${req.ipInfo.country} ${req.ipInfo.ll}`)}`);
    console.log('=================================');
    res.render("signup-form");
});

router.get('/booked', (req, res) => {
    console.log('GET /booked');
    // let appointmentList = undefined;
    (async () => {
        let sheetRows = await doc.sheetsByIndex[0].getRows({ offset: 0 });
        let appointmentList = sheetRows.map((row) => {
            return { appStart: new Date(`${row.AppDate} -0400`), appEnd: new Date(new Date(`${row.AppDate} -0400`).valueOf() + Number(row.AppDuration.substring(0, row.AppDuration.length - 3)) * 3.6e+6) };
        });
        res.send(JSON.stringify(appointmentList));
    })();
});

router.post('/', bodyParser.urlencoded({ extended: false }), appointmentValidators, appointmentSanitizers, (req, res) => {
    console.log(`POST / ${JSON.stringify(req.body)}`);
    console.log('=================================');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422);
        console.error(errors.array());
        return res.render('signup-form', { errorList: errors.array() });
    } else {
        // console.log(req.body['app-date']);
        // console.log(req.body['app-time']);
        let appDate = new Date(`${req.body['app-date']} ${req.body['app-time']}:00`);
        let serviceCost = { hours: 0, price: 0 };
        switch (req.body['vehicle-type']) {
            case 'Sedan':
            case 'Convertible':
            case 'Hatchback':
            case 'Station Wagon':
                if (req.body['exterior-service'].includes("wash")) {
                    serviceCost.hours += 1;
                    serviceCost.price += 20;
                } else if (req.body['exterior-service'].includes("detail")) {
                    serviceCost.hours += 2;
                    serviceCost.price += 40;
                }

                if (req.body['interior-service'].includes("clean")) {
                    serviceCost.hours += 1;
                    serviceCost.price += 75;
                } else if (req.body['interior-service'].includes("detail")) {
                    serviceCost.hours += 2.5;
                    serviceCost.price += 150;
                }
                break;

            case 'Minivan':
            case 'SUV':
                if (req.body['exterior-service'].includes("wash")) {
                    serviceCost.hours += 1.5;
                    serviceCost.price += 30;
                } else if (req.body['exterior-service'].includes("detail")) {
                    serviceCost.hours += 2.5;
                    serviceCost.price += 50;
                }

                if (req.body['interior-service'].includes("clean")) {
                    serviceCost.hours += 1.5;
                    serviceCost.price += 100;
                } else if (req.body['interior-service'].includes("detail")) {
                    serviceCost.hours += 3;
                    serviceCost.price += 150;
                }
                break;

            case 'Truck':
            case 'Van':
                if (req.body['exterior-service'].includes("wash")) {
                    serviceCost.hours += 1.5;
                    serviceCost.price += 35;
                } else if (req.body['exterior-service'].includes("detail")) {
                    serviceCost.hours += 3;
                    serviceCost.price += 55;
                }

                if (req.body['interior-service'].includes("clean")) {
                    serviceCost.hours += 1;
                    serviceCost.price += 100;
                } else if (req.body['interior-service'].includes("detail")) {
                    serviceCost.hours += 2.5;
                    serviceCost.price += 150;
                }
                break;

            default:
                break;
        }
        // console.log(serviceCost);

        // AppointmentModel.create({
        //     vehicleType: req.body['vehicle-type'],
        //     vehicleModel: req.body['vehicle-model'],
        //     exteriorService: req.body['exterior-service'].substring(9),
        //     interiorService: req.body['interior-service'].substring(9),
        //     appDateTime: appDate,
        //     appDuration: serviceCost.hours,
        //     appPrice: serviceCost.price,
        //     clientName: req.body['client-name'],
        //     clientEmail: req.body['client-email'],
        //     clientAddress: req.body['client-address'],
        //     clientCity: req.body['client-city'],
        //     clientState: req.body['app-state'],
        //     clientPhone: req.body['app-phone'],
        //     appInstructions: req.body['special-instructions']
        // }, (err, appointmentInstance) => { if (err) { console.error(err) } });

        let sheet = doc.sheetsByIndex[0];
        (async () => {
            await sheet.addRow({
                VehicleType: req.body['vehicle-type'],
                VehicleModel: req.body['vehicle-model'],
                ExteriorService: req.body['exterior-service'].substring(9),
                InteriorService: req.body['interior-service'].substring(9),
                AppDate: appDate.toLocaleString(),
                AppDuration: `${serviceCost.hours}hrs`,
                AppPrice: `$${serviceCost.price}`,
                AppAddress: `${req.body['client-address']} ${req.body['client-city']}, ${req.body['app-state']}`,
                ClientName: req.body['client-name'],
                ClientEmail: req.body['client-email'],
                ClientPhone: req.body['app-phone'],
                TimeBooked: new Date().toLocaleString(),
                ExpirationTime: '',
                SpecialInstructions: (req.body['special-instructions'] ? req.body['special-instructions'] : 'No Instructions')
            });
        })();

        // console.log('============');
        return res.render('form-submit', { date: appDate.toLocaleString() });
    }
});

router.post('/reserve', bodyParser.urlencoded({ extended: false }), (req, res) => {
    console.log(`POST /reserve`);
    console.log('=================================');
    let sheet = doc.sheetsByIndex[0];
        (async () => {
            await sheet.addRow({
                // VehicleType: req.body['vehicle-type'],
                // VehicleModel: req.body['vehicle-model'],
                // ExteriorService: req.body['exterior-service'].substring(9),
                // InteriorService: req.body['interior-service'].substring(9),
                AppDate: req.body['client-name'],
                AppDuration: req.body['app-name'],
                // AppPrice: `$${serviceCost.price}`,
                // AppAddress: `${req.body['client-address']} ${req.body['client-city']}, ${req.body['app-state']}`,
                ClientName: req.body['client-name'],
                // ClientEmail: req.body['client-email'],
                // ClientPhone: req.body['app-phone'],
                TimeBooked: new Date().toLocaleString(),
                ExpirationTime: req.body['expiration-time'],
                SpecialInstructions: req.body['special-instructions']
            });
        })();
});

router.get('/dashboard', (req, res) => {
    res.send('dashboard');
});

module.exports = router;