const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const toursInfoScheme = new Schema({
    info: String,
});

const ToursInfo = mongoose.model('ToursInfo', toursInfoScheme);

module.exports = ToursInfo;
