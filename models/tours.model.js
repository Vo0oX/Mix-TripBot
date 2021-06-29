const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const toursScheme = new Schema({
    name: String,
    infoTours: String,
    btnName: String,
    sentence: [Object],
    presentation: String,
    typeTour: String,
    guide: String,
    guideInfo: String,
    guidePrice: String,



});

const Tours = mongoose.model('Tours', toursScheme);

module.exports = Tours;
