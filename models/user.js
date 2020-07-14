// MongoDB imports
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: {type: String},
    passwordHash: {type: String},
    passwordSalt: {type: String},
});


// Export model
module.exports = mongoose.model('User', UserSchema);