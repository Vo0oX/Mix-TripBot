const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const EventScheme = new Schema({
    info: String,
    eventShortBtn: String,
});

const Event = mongoose.model('Event', EventScheme);

module.exports = Event;
