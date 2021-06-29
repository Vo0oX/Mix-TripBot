const userScheme = require('../models/user.model');
const toursScheme = require('../models/tours.model');
const eventScheme = require('../models/events.model');
const businessCampScheme = require('../models/businessCamp.model');

require('dotenv').config({path: __dirname + '/.env'});



module.exports = {

    arrTour(id, direction, nameTour, typeTour, presentation, date, people, children, days, phone, callback, preOrder) {

        //console.log('зашли в switchState: ', id, step, link, amount, price, sum, text, example_text, min, max, task, request_type, service_id, add_funds, post_old, post_new);

        if (direction) {
            userScheme.updateMany({id: id}, {
                $set: {
                    direction: direction
                }
            }, {upsert: false}, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    callback('OK');
                }
            });
        }
        else if (nameTour && typeTour && presentation ) {

            userScheme.updateMany({id: id}, {
                $set: {
                    nameTour:nameTour,
                    typeTour: typeTour,
                    presentation: presentation,
                    price: preOrder,

                }
            }, {upsert: false}, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    callback('OK');
                }
            });
        }
        else if (date) {

            userScheme.updateMany({id: id}, {
                $set: {
                    date:date,
                }
            }, {upsert: false}, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    callback('OK');
                }
            });
        }
        else if (phone) {

            userScheme.updateMany({id: id}, {
                $set: {

                    phone:phone

                }
            }, {upsert: false}, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    callback('OK');
                }
            });
        }
        else if (people) {

            userScheme.updateMany({id: id}, {
                $set: {

                    people:people

                }
            }, {upsert: false}, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    callback('OK');
                }
            });
        }
        else if (children) {

            userScheme.updateMany({id: id}, {
                $set: {

                    children:children

                }
            }, {upsert: false}, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    callback('OK');
                }
            });
        }
        else if (days) {

            userScheme.updateMany({id: id}, {
                $set: {

                    days:days

                }
            }, {upsert: false}, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    callback('OK');
                }
            });
        }





    },

    addGuide(id, guide, guideInfo, guidePrice) {

        //console.log('зашли в switchState: ', id, step, link, amount, price, sum, text, example_text, min, max, task, request_type, service_id, add_funds, post_old, post_new);

        if (guide) {
            userScheme.updateMany({id: id}, {
                $set: {
                    guide: guide,
                    guideInfo:guideInfo,
                    guidePrice:guidePrice
                }
            }, {upsert: false}, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('OK');
                }
            });
        }


    },

    eventUsrUp(id, text, cb) {
        userScheme.updateMany({id: id}, {
            $set: {
                social: text
            }
        }, {upsert: false}, function (err, row) {
            if (err) {
                console.log(err);
            } else {
                cb('ok')
            }
        })


    },

    getChatId(msg) {
        return msg.chat.id
    },

    eventsCreate(info, callback) {
        eventScheme.find({}, function (err, rows) {
            if (err) {
                console.log(err)
            }

            else {
                let event = new eventScheme({
                    info: info.info,
                    eventShortBtn: info.eventShortBtn,
                });

                event.save(function (err) {

                    if (err) return console.log(err);

                });

            }


        });
    },

    businessCampCreateS(info, callback) {
        businessCampScheme.find({}, function (err, rows) {
            if (err) {
                console.log(err)
            }

            else {
                let businessCamp = new businessCampScheme({
                    info: info.info,
                    businessCampShortBtn: info.businessCampShortBtn,
                });

                businessCamp.save(function (err) {

                    if (err) return console.log(err);

                });

            }


        });
    },


    loadButton(callback) {
        toursScheme.find({}, function (err, rows) {

            let arrToursBtn = [

            ];

            for (let i = 0; i < rows.length; i++) {

                arrToursBtn.unshift(
                    [{
                        text: rows[i].name,
                        callback_data: rows[i].btnName
                    }],
                );

            }

            callback(arrToursBtn)


        });
    },

    switchState(id, step, stepEditor, amount, price, sum, text, example_text, min, max, task, request_type, service_id, add_funds, post_old, post_new, comments, login, payload, previous_step) {
//TODO: ИЗМЕНЕНИЯ ELSE МОГУТ ПОВЛИЯТЬ!!!!

        if (price) {
            userScheme.updateMany({id: id}, {
                $set: {
                    step: step,
                    price: price,
                    text: text,
                    example_text: example_text,
                    min: min,
                    max: max,
                    task: task,
                    request_type: request_type,
                    service_id: service_id
                }
            }, {upsert: false}, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('OK price', step);
                }
            });
        }

        else if (amount && sum) {
            userScheme.updateMany({id: id}, {
                $set: {
                    step: step,
                    amount: amount,
                    sum: sum
                }
            }, {upsert: false}, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('OK');
                }
            });
        }

        else if (stepEditor) {
            userScheme.updateMany({id: id}, {$set: {step: step, stepEditor: stepEditor, previous_step:previous_step}}, {upsert: false}, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('OK');
                }
            });
        }

        else if (post_old) {
            userScheme.updateMany({id: id}, {$set: {step: step, post_old: post_old}}, {upsert: false}, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('OK  post_old', step);
                }
            });
        }

        else if (post_new) {
            userScheme.updateMany({id: id}, {$set: {step: step, post_new: post_new}}, {upsert: false}, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('OK post_new', step);
                }
            });
        }

        else if (add_funds) {
            userScheme.updateMany({id: id}, {
                $set: {
                    step: step,
                    add_funds: add_funds,
                    invoice_payload: payload
                }
            }, {upsert: false}, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('OK add_funds', step);
                }
            });
        }

        else if (step && !stepEditor && !amount && !price && !sum && !text && !example_text && !min && !max && !task && !request_type && !service_id && !add_funds && !post_old && !post_new && !login && !payload) {

            //console.log('stepEditor: ', stepEditor);

            userScheme.updateMany({id: id}, {$set: {step: step, previous_step:previous_step}}, {upsert: false}, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    //console.log('шаг: ', step, '/ предыдущий:', previous_step);
                }
            });
        }

        else if (comments) {
            let mySplits = comments.split('()');

            console.log('COMMENTS mySplits _ ', mySplits);
        }

        else if (login) {
            userScheme.updateMany({id: id}, {$set: {step: step, login: login}}, {upsert: false}, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('OK login', step);
                }
            });
        }



    },

    addTour(tour, callback) {

        console.log('tour in addTour', tour);

        let newTour = new toursScheme({
            name: tour.name,
            infoTours: tour.infoTours,
            btnName: tour.btn_name,
            typeTour: tour.typeTour,
            date: tour.date,
            guide:'',
            guideInfo:'',
            guidePrice:''


        });
        // сохранили
        newTour.save(function (err) {

            if (err) return console.log(err);

        });

        callback("Tour save #", newTour.name)

    },


    async addTourInfo(tourInfo, callback) {

        await toursInfoScheme.find({}, function (err, rows) {
            console.log(rows);
            toursInfoScheme.updateMany({_id: rows[0]._id}, {$set: {info: tourInfo}}, {upsert: false}, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    callback(`balance Новый баланс -> ${tourInfo} `);
                }
            });
        })




    },

    async findTourInfo(callback) {

        toursInfoScheme.find({}, function (err, rows) {
            if (err)
                console.log(err)
            else {
                if (rows.length === 0) {
                    callback([])

                } else {
                    callback(rows)
                }

            }
        })



    },

    async userCheck(id, callback, ref, name, phone) {

        await userScheme.find({id: id}, function (err, rows) {
            if (err) {
                console.log(err)
            } else {
                // не нашли -> создали



                if (rows.length === 0) {

                    let newRef = ref.split(' ')[1];


                    let user = new userScheme({
                        id: id,
                        name:name,
                        phone: null,
                        social: null,
                        balance: 0,
                        add_funds: 0,
                        invoice_payload: null,
                        stepEditor: null,
                        amount: null,
                        task: null,
                        price: null,
                        sum: null,
                        userSelectedTour: [],
                        interestedTour: [],
                        userOrder: [],
                        userOrder_t: [],
                        addFunds_t: [],
                        step: 'New_user',
                        previous_step: 'New_user',
                        ref: newRef || '',
                        direction:'',
                        nameTour:'',
                        typeTour:'',
                        presentation:'',
                        date:'',
                        people:'',
                        children:'',
                        days:'',

                    });
                    // сохранили
                    user.save(function (err) {

                        if (err) return console.log(err);

                        console.log("User save #", user.id);
                    });

                    //отправили инфу
                    callback([user]);
                } else {

                    console.log('User in DB', rows[0].id, rows[0].name);
                    callback(rows);


                }

            }


        });
    },

    async sentenseCheck(name, cb) {
       await toursScheme.findOne({'sentence.name' : name},{'sentence.$': 1}, function(err,list){

            cb(list);
            console.log('sentenseCheck - work');

        })

    },

    balance_man(id, balance, callback) {

        userScheme.updateMany({id: id}, {$set: {balance: balance}}, {upsert: false}, function (err) {
            if (err) {
                console.log(err);
            } else {
                callback(`balance Новый баланс -> ${balance} `);
            }
        });
    },

    async order(id, order) {

        await userScheme.updateMany({id: id }, { $push: { userOrder_t: order }});




    },

    async deleteOrder(id, order) {

        console.log("order", order);
        //await userScheme.updateOne({id: id}, { $pull: { 'userOrder': '3114833' } })

        userScheme.updateMany({ id: id }, { "$pull": { "userOrder": { id: `${order}` } }}, { safe: true, multi:true }, function(err, obj) {
            //do something smart
        });
        },

    async addFundsHist(id, order) {

        await userScheme.updateMany({id: id }, { $push: { addFunds_t: order }});




    },

    add_funds(id, balance, callback) {

        userScheme.updateMany({id: id}, {$set: {balance: balance, add_funds: '0', step: 'money'}}, {upsert: false}, function (err) {
            if (err) {
                console.log(err);
            } else {
                callback(`addFunds Новый баланс -> ${balance} `);
            }
        });
    },

    all_user(cb) {
        userScheme.find({}, function (err, rows) {
            cb(rows.length);
        })
    },

    resetUserInfo(id, callback) {

        userScheme.updateMany({id: id}, {$set: {
                add_funds: 0,
                login: null,
                comments: [],
                link: null,
                post_old: null,
                post_new: null,
                amount: null,
                service_id: null,
                task: null,
                request_type: null,
                text: null,
                example_text: null,
                price: null,
                min: null,
                max: null,
                sum: null,
                step: 'v1',
                previous_step:'Главное меню'

            }}, {upsert: false}, function (err) {
            if (err) {
                console.log(err);
            } else {
                callback(`Данные сброшены `);
            }
        });
    },

    announcement(cb) {
        userScheme.find({}, function (err, rows) {
            cb(rows);
        })
    },

    refArr (ref, cb) {
        userScheme.find({ref: ref}, function (err, rows) {
            cb(rows);
        })
    },



    template_general(chat_id, message_id, inline_keyboard, textS, callback) {
        let text = textS;

        const opts = {
            chat_id: chat_id,
            message_id: message_id,
            parse_mode: 'HTML',
            reply_markup: JSON.stringify({
                inline_keyboard: inline_keyboard,
                resize_keyboard: true

            })

        };

        callback(text,opts);

    },

};







