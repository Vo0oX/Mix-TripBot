const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const userScheme = new Schema({
    id: Number,
    name: String,
    phone: String,
    social: String,
    balance: Number,
    add_funds: Number,
    invoice_payload: String,
    amount: Number,
    task: String,
    price: Number,
    sum: Number,
    userSelectedTour: [Object],
    userOrder: [Object],
    userOrder_t: [Object],
    addFunds_t: [Object],
    step: String,
    stepEditor: String,
    previous_step: String,
    ref: String,
    interestedTour: [Object],
    guide:String,
    guideInfo:String,
    guidePrice:String,
    direction:String,
    nameTour:String,
    typeTour:String,
    presentation:String,
    date:String,
    people:String,
    children:String,
    days:String,


});

const User = mongoose.model('User', userScheme);

module.exports = User;
