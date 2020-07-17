// MongoDB imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
    clientCity: { type: String },
    clientState: { type: String },
    clientPhone: { type: String },
    appInstructions: { type: String },
});

// Export model
module.exports = mongoose.model('Appointment', AppointmentSchema);