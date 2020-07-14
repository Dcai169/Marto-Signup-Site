// MongoDB imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var appointmentSchema = new Schema({
    vehicleType: {type: String, enum: ['Sedan', 'Convertable', 'Minivan', 'SUV', 'Truck', 'Van'], required: true},
    vehicleModel: {type: String},
    exteriorService: {type: String, enum: ['Wash', 'Detailing', 'None'], required: true},
    interiorService: {type: String, enum: ['Cleaning', 'Detailing', 'None'], required: true},
    appDateTime: {type: Date, required: true},
    appDuration: {type: Number, min: 1, max: 6},
    appPrice: {type: Number, min: 15, max: 135},
    clientName: {type: String},
    clientEmail: {type: String},
    clientAddress: {type: String},
    clientPhone: {type: String},
    appInstructions: {type: String},
});

// Export model
module.exports = mongoose.model('Appointment', AppointmentSchema);