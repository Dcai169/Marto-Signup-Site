const express = require('express');
const bodyParser = require('body-parser');
// const flash = require('connect-flash');
const app = express();
const httpPort = 4350;
const server = require("http").createServer(app);
require('dotenv').config({ path: './config.env' });
// MongoDB imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const MongoClient = require('mongodb');
const { check, body, validationResult } = require('express-validator');

appointmentValidators = [
    check('client-email').isEmail().normalizeEmail(),
    check('app-phone').isMobilePhone().withMessage('Invalid phone number'),
    check('vehicle-type').isIn(['Sedan', 'Convertable', 'Minivan', 'SUV', 'Truck', 'Van']),
    check('exterior-service').isIn(['none', 'exterior-wash', 'exterior-detail']),
    check('interior-service').isIn(['none', 'interior-clean', 'interior-detail']),
    // check('app-date').isBefore().withMessage('Date is in the past').isISO8601(),
    check('app-date').isISO8601(),
    check('app-hour').isIn(['10am', '11am', '12am', '01pm', '03pm', '04pm', '05pm']),
    check('app-min').isIn([':00', ':30'])
];
appointmentSanitizers = [
    body('vehicle-model').escape(),
    body('client-name').escape(),
    body('client-address').escape(),
    body('client-city').escape(),
    body('app-state').escape(),
    body('special-instructions').escape()
];

// DB Schema definition
var AppointmentSchema = new Schema({
    vehicleType: { type: String, enum: ['Sedan', 'Convertable', 'Minivan', 'SUV', 'Truck', 'Van'], required: true },
    vehicleModel: { type: String },
    exteriorService: { type: String, enum: ['wash', 'detail', 'none'], required: true },
    interiorService: { type: String, enum: ['clean', 'detail', 'none'], required: true },
    appDateTime: { type: Date, required: true },
    appDuration: { type: Number, min: 1, max: 6 },
    appPrice: { type: Number, min: 15, max: 135 },
    clientName: { type: String },
    clientEmail: { type: String },
    clientAddress: { type: String },
    clientPhone: { type: String },
    appInstructions: { type: String },
});
var UserSchema = new Schema({
    username: { type: String },
    passwordHash: { type: String },
    passwordSalt: { type: String },
});

mongoose.connect('mongodb://127.0.0.1:27017', { useNewUrlParser: true, useUnifiedTopology: true });
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Create document models
let AppointmentModel = mongoose.model('AppointmentModel', AppointmentSchema);
let UserModel = mongoose.model('UserModel', UserSchema);
// AppointmentModel.create({name: 'appointmentInstance'}, (err, appointmentInstance) => {if (err) {return console.error(err)}});
// UserModel.create({name: 'userInstance'}, (err, userInstance) => {if (err) {return console.error(err)}});``

app.set('view engine', 'pug');
app.use(express.static(__dirname + "/public"));
// app.use(flash());

server.listen(httpPort, () => {
    console.log('Server running on port ' + httpPort)
    console.log('============')
})

app.get('/', (req, res) => {
    res.render("signup-form");
});

app.post('/', bodyParser.urlencoded({ extended: false }), appointmentValidators, appointmentSanitizers, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422);
        console.error(errors.array());
        return res.render('signup-form', { errorList: errors.array() });
    } else {
        console.log(req.body);
        let dateArray = req.body['app-date'].split('-');
        let appDate = new Date(dateArray[0], dateArray[1] - 1, dateArray[2], (req.body['app-hour'].includes("a") ? req.body['app-hour'].substring(0, 2) : Number(req.body['app-hour'].substring(0, 2)) + 12), (req.body['app-min'].includes("3") ? 30 : 00));
        let serviceCost = { hours: 0, price: 0 };
        switch (req.body['vehicle-type']) {
            case 'Sedan':
            case 'Convertable':
                if (req.body['exterior-service'].includes("wash")) {
                    serviceCost.hours += 1;
                    serviceCost.price += 15;
                } else if (req.body['exterior-service'].includes("detail")) {
                    serviceCost.hours += 2;
                    serviceCost.price += 30;
                }

                if (req.body['interior-service'].includes("clean")) {
                    serviceCost.hours += 1;
                    serviceCost.price += 25;
                } else if (req.body['interior-service'].includes("detail")) {
                    serviceCost.hours += 2.5;
                    serviceCost.price += 75;
                }
                break;

            case 'Minivan':
            case 'SUV':
                if (req.body['exterior-service'].includes("wash")) {
                    serviceCost.hours += 1.5;
                    serviceCost.price += 20;
                } else if (req.body['exterior-service'].includes("detail")) {
                    serviceCost.hours += 2.5;
                    serviceCost.price += 40;
                }

                if (req.body['interior-service'].includes("clean")) {
                    serviceCost.hours += 1.5;
                    serviceCost.price += 30;
                } else if (req.body['interior-service'].includes("detail")) {
                    serviceCost.hours += 3;
                    serviceCost.price += 85;
                }
                break;

            case 'Truck':
            case 'Van':
                if (req.body['exterior-service'].includes("wash")) {
                    serviceCost.hours += 1.5;
                    serviceCost.price += 25;
                } else if (req.body['exterior-service'].includes("detail")) {
                    serviceCost.hours += 3;
                    serviceCost.price += 50;
                }

                if (req.body['interior-service'].includes("clean")) {
                    serviceCost.hours += 1;
                    serviceCost.price += 25;
                } else if (req.body['interior-service'].includes("detail")) {
                    serviceCost.hours += 2.5;
                    serviceCost.price += 75;
                }
                break;

            default:
                break;
        }
        console.log(serviceCost);
        AppointmentModel.create({}, (err, appointmentInstance) => { if (err) { console.error(err) } });
        return res.render('form-submit', { date: appDate.toLocaleString() });
    }

})

app.get('/dashboard', (req, res) => {
    res.send('dashboard');
});