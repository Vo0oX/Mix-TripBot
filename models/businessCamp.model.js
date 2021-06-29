const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const businessCampScheme = new Schema({
    info: String,
    businessCampShortBtn: String,
});

const businessCamp = mongoose.model('businessCamp', businessCampScheme);

module.exports = businessCamp;
