




if (row[0].step === 'selectedCountry') {


    console.log(3)

    toursScheme.findOne({'sentence.name' : msg.data},{'sentence.$': 1}, function(err,list){

        console.log(row[0].id,' boom',list);

        if (list === null) {

            toursScheme.find({btnName: msg.data}, function (err, rows) {

                console.log('ищем', rows)

                if (err) {
                    console.log(err)
                }

                else {

                    console.log(2, rows);

                    if (rows === null) {
                        console.log('второй oops');
                        helper.resetUserInfo(chat.id, function (row) {
                            console.log(row);
                        });

                        helper.template_general(chat.id, message_id, kb.homepage, '<b>☁️Выберите нужный Вам раздел ниже:</b>', function (text, opts) {
                            bot.editMessageText(text, opts);

                        });

                    }
                    else {
                        if (rows.length !== 0) {
                            let neName = rows[0].name || '1';

                            console.log("neName",neName);
                            console.log(rows[0].name,row[0].direction);

                            helper.arrTour(row[0].id, neName, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined,function () {


                                helper.findTourInfo(function (rowz) {

                                    if (rowz.length === 0) {
                                        if (rows[0].guide) {
                                            let kbForCountry = [
                                                [{
                                                    text: 'Приобрести гайд',
                                                    callback_data: 'buy_guide',
                                                }],
                                                [{
                                                    text: '↩️Назад',
                                                    callback_data: 'back'
                                                }]
                                            ];


                                            for (let i = 0; i < rows[0].sentence.length; i++) {

                                                kbForCountry.unshift(
                                                    [{
                                                        text: rows[0].sentence[i].name,
                                                        callback_data: rows[0].sentence[i].name,
                                                    }]
                                                );

                                            }

                                            helper.template_general(chat.id,message_id, kbForCountry,'☁️ Выберите нужный Вам раздел ниже!:', function (text, opts) {
                                                bot.editMessageText(text, opts);

                                            });

                                            helper.switchState(chat.id, 'selectedCountry', msg.data, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'tours');

                                            helper.addGuide(chat.id, rows[0].guide, rows[0].guideInfo, rows[0].guidePrice)

                                        }
                                        else {
                                            let kbForCountry = [
                                                [{
                                                    text: '↩️Назад',
                                                    callback_data: 'back'
                                                }]
                                            ];

                                            for (let i = 0; i < rows[0].sentence.length; i++) {

                                                kbForCountry.unshift(
                                                    [{
                                                        text: rows[0].sentence[i].name,
                                                        callback_data: rows[0].sentence[i].name,
                                                    }]
                                                );

                                            }

                                            helper.template_general(chat.id,message_id, kbForCountry,'☁️ Выберите нужный Вам раздел ниже!:', function (text, opts) {
                                                bot.editMessageText(text, opts);

                                            });

                                            helper.switchState(chat.id, 'selectedCountry', msg.data, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'tours');

                                        }

                                    }
                                    else {
                                        if (rows[0].guide) {
                                            let kbForCountry = [
                                                [{
                                                    text: 'Приобрести гайд',
                                                    callback_data: 'buy_guide',
                                                }],
                                                [{
                                                    text: '↩️Назад',
                                                    callback_data: 'back'
                                                }]
                                            ];


                                            for (let i = 0; i < rows[0].sentence.length; i++) {

                                                kbForCountry.unshift(
                                                    [{
                                                        text: rows[0].sentence[i].name,
                                                        callback_data: rows[0].sentence[i].name,
                                                    }]
                                                );

                                            }

                                            helper.template_general(chat.id,message_id, kbForCountry,'☁️ Выберите нужный Вам раздел ниже1:', function (text, opts) {
                                                bot.editMessageText(text, opts);

                                            });

                                            helper.switchState(chat.id, 'selectedCountry', msg.data, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'tours');

                                            helper.addGuide(chat.id, rows[0].guide, rows[0].guideInfo, rows[0].guidePrice)

                                        }
                                        else {
                                            let kbForCountry = [
                                                [{
                                                    text: '↩️Назад',
                                                    callback_data: 'back'
                                                }]
                                            ];

                                            for (let i = 0; i < rows[0].sentence.length; i++) {

                                                kbForCountry.unshift(
                                                    [{
                                                        text: rows[0].sentence[i].name,
                                                        callback_data: rows[0].sentence[i].name,
                                                    }]
                                                );

                                            }

                                            helper.template_general(chat.id,message_id, kbForCountry, rowz[0].info, function (text, opts) {
                                                bot.editMessageText(text, opts);

                                            });

                                            helper.switchState(chat.id, 'selectedCountry', msg.data, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'tours');

                                        }

                                    }
                                })





                            })

                        } else {
                            let neName = row[0].direction || '1';

                            console.log("neName только 1 (дваS)",neName);


                            helper.arrTour(row[0].id, neName, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined,function () {


                                helper.findTourInfo(function (rowz) {

                                    console.log('длинна ', rows)
                                    if (rowz.length === 0) {
                                        if (rows.length !== 0) {
                                            if (rows[0].guide) {
                                                let kbForCountry = [
                                                    [{
                                                        text: 'Приобрести гайд',
                                                        callback_data: 'buy_guide',
                                                    }],
                                                    [{
                                                        text: '↩️Назад',
                                                        callback_data: 'back'
                                                    }]
                                                ];


                                                for (let i = 0; i < rows[0].sentence.length; i++) {

                                                    kbForCountry.unshift(
                                                        [{
                                                            text: rows[0].sentence[i].name,
                                                            callback_data: rows[0].sentence[i].name,
                                                        }]
                                                    );

                                                }

                                                helper.template_general(chat.id,message_id, kbForCountry,'☁️ Выберите нужный Вам раздел ниже!:', function (text, opts) {
                                                    bot.editMessageText(text, opts);

                                                });

                                                helper.switchState(chat.id, 'selectedCountry', msg.data, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'tours');

                                                helper.addGuide(chat.id, rows[0].guide, rows[0].guideInfo, rows[0].guidePrice)

                                            }
                                            else {
                                                let kbForCountry = [
                                                    [{
                                                        text: '↩️Назад',
                                                        callback_data: 'back'
                                                    }]
                                                ];

                                                for (let i = 0; i < rows[0].sentence.length; i++) {

                                                    kbForCountry.unshift(
                                                        [{
                                                            text: rows[0].sentence[i].name,
                                                            callback_data: rows[0].sentence[i].name,
                                                        }]
                                                    );

                                                }

                                                helper.template_general(chat.id,message_id, kbForCountry,'☁️ Выберите нужный Вам раздел ниже!:', function (text, opts) {
                                                    bot.editMessageText(text, opts);

                                                });

                                                helper.switchState(chat.id, 'selectedCountry', msg.data, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'tours');

                                            }
                                        } else {
                                            console.log('вот тут ');

                                            helper.resetUserInfo(chat.id, function (row) {
                                                console.log(row);
                                            });



                                        }

                                    }
                                    else {
                                        console.log('зашли сюда (');
                                        if (rows[0].guide) {
                                            let kbForCountry = [
                                                [{
                                                    text: 'Приобрести гайд',
                                                    callback_data: 'buy_guide',
                                                }],
                                                [{
                                                    text: '↩️Назад',
                                                    callback_data: 'back'
                                                }]
                                            ];


                                            for (let i = 0; i < rows[0].sentence.length; i++) {

                                                kbForCountry.unshift(
                                                    [{
                                                        text: rows[0].sentence[i].name,
                                                        callback_data: rows[0].sentence[i].name,
                                                    }]
                                                );

                                            }

                                            helper.template_general(chat.id,message_id, kbForCountry,'☁️ Выберите нужный Вам раздел ниже1:', function (text, opts) {
                                                bot.editMessageText(text, opts);

                                            });

                                            helper.switchState(chat.id, 'selectedCountry', msg.data, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'tours');

                                            helper.addGuide(chat.id, rows[0].guide, rows[0].guideInfo, rows[0].guidePrice)

                                        }
                                        else {
                                            let kbForCountry = [
                                                [{
                                                    text: '↩️Назад',
                                                    callback_data: 'back'
                                                }]
                                            ];

                                            for (let i = 0; i < rows[0].sentence.length; i++) {

                                                kbForCountry.unshift(
                                                    [{
                                                        text: rows[0].sentence[i].name,
                                                        callback_data: rows[0].sentence[i].name,
                                                    }]
                                                );

                                            }

                                            helper.template_general(chat.id,message_id, kbForCountry, rowz[0].info, function (text, opts) {
                                                bot.editMessageText(text, opts);

                                            });

                                            helper.switchState(chat.id, 'selectedCountry', msg.data, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'tours');

                                        }

                                    }
                                })





                            })
                        }

                    }




                }


            });

            helper.resetUserInfo(chat.id, function (row) {
                console.log(row);
            });

            helper.template_general(chat.id, message_id, kb.homepage, '<b>☁️Выберите нужный Вам раздел ниже:</b>', function (text, opts) {
                bot.editMessageText(text, opts);

            });
        }
        else {
            helper.arrTour(row[0].id, undefined, list.sentence[0].name, list.sentence[0].typeTour, list.sentence[0].sentence, undefined, undefined, undefined, undefined, undefined,function () {




                let kbForCountrys = [
                    [{
                        text: '↩️На главную',
                        callback_data: 'На главную'
                    }]
                ];

                if (list.sentence[0].typeTour === 'Authors') {
                    console.log('Authors - выводим даты -> просим номер взамен даем презентацию')


                    for (let i = 0; i < list.sentence[0].date.length; i++) {

                        kbForCountrys.unshift(
                            [{
                                text: list.sentence[0].date[i],
                                callback_data: list.sentence[0].date[i],
                            }]
                        );

                    }


                    helper.template_general(chat.id,message_id, kbForCountrys,'☁️ Выберите нужную Вам дату ⤵️', function (text, opts) {
                        bot.editMessageText(text, opts);


                    });
                    helper.switchState(chat.id, 'viewsPresentation', undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'selectedCountry');


                }

                else if (list.sentence[0].typeTour === 'Package') {
                    console.log(' Package - выводим перечень вопросов')

                    helper.template_general(chat.id,message_id, undefined,'1️⃣ Введите какие даты вас интереуют ' +
                        '\nНапример: 12.03', function (text, opts) {
                        bot.editMessageText(text, opts);


                    });
                    helper.switchState(chat.id, 'enterInfoTour', msg.data, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'tours');

                }
            });

        }




    });



}
if (row[0].step === 'tours') {

    console.log(1)


    toursScheme.find({btnName: msg.data}, function (err, rows) {


        if (err) {
            console.log(err)
        }

        else {

            console.log(2);

            if (rows === null) {

                helper.resetUserInfo(chat.id, function (row) {

                });

                helper.template_general(chat.id, message_id, kb.homepage, '<b>☁️Выберите нужный Вам раздел ниже:</b>', function (text, opts) {
                    bot.editMessageText(text, opts);

                });

            }
            else {

                if (rows.length !== 0) {
                    let neName = rows[0].name || '1';

                    helper.arrTour(row[0].id, neName, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined,function () {


                        helper.findTourInfo(function (rowz) {

                            if (rowz.length === 0) {
                                if (rows.length !== 0) {
                                    if (rows[0].guide) {
                                        let kbForCountry = [
                                            [{
                                                text: 'Приобрести гайд',
                                                callback_data: 'buy_guide',
                                            }],
                                            [{
                                                text: '↩️Назад',
                                                callback_data: 'back'
                                            }]
                                        ];


                                        for (let i = 0; i < rows[0].sentence.length; i++) {

                                            kbForCountry.unshift(
                                                [{
                                                    text: rows[0].sentence[i].name,
                                                    callback_data: rows[0].sentence[i].name,
                                                }]
                                            );

                                        }

                                        helper.template_general(chat.id,message_id, kbForCountry,'☁️ Выберите нужный Вам раздел ниже!:', function (text, opts) {
                                            bot.editMessageText(text, opts);

                                        });

                                        helper.switchState(chat.id, 'selectedCountry', msg.data, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'tours');

                                        helper.addGuide(chat.id, rows[0].guide, rows[0].guideInfo, rows[0].guidePrice)

                                    }
                                    else {
                                        let kbForCountry = [
                                            [{
                                                text: '↩️Назад',
                                                callback_data: 'back'
                                            }]
                                        ];

                                        for (let i = 0; i < rows[0].sentence.length; i++) {

                                            kbForCountry.unshift(
                                                [{
                                                    text: rows[0].sentence[i].name,
                                                    callback_data: rows[0].sentence[i].name,
                                                }]
                                            );

                                        }

                                        helper.template_general(chat.id,message_id, kbForCountry,'☁️ Выберите нужный Вам раздел ниже!:', function (text, opts) {
                                            bot.editMessageText(text, opts);

                                        });

                                        helper.switchState(chat.id, 'selectedCountry', msg.data, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'tours');

                                    }
                                } else {

                                    helper.resetUserInfo(chat.id, function (row) {

                                    });

                                    helper.template_general(chat.id, message_id, kb.homepage, '<b>☁️Выберите нужный Вам раздел ниже:</b>', function (text, opts) {
                                        bot.editMessageText(text, opts);

                                    });

                                }

                            }
                            else {
                                if (rows[0].guide) {
                                    let kbForCountry = [
                                        [{
                                            text: 'Приобрести гайд',
                                            callback_data: 'buy_guide',
                                        }],
                                        [{
                                            text: '↩️Назад',
                                            callback_data: 'back'
                                        }]
                                    ];


                                    for (let i = 0; i < rows[0].sentence.length; i++) {

                                        kbForCountry.unshift(
                                            [{
                                                text: rows[0].sentence[i].name,
                                                callback_data: rows[0].sentence[i].name,
                                            }]
                                        );

                                    }

                                    helper.template_general(chat.id,message_id, kbForCountry,rowz[0].info, function (text, opts) {
                                        bot.editMessageText(text, opts);

                                    });

                                    helper.switchState(chat.id, 'selectedCountry', msg.data, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'tours');

                                    helper.addGuide(chat.id, rows[0].guide, rows[0].guideInfo, rows[0].guidePrice)

                                }
                                else {
                                    let kbForCountry = [
                                        [{
                                            text: '↩️Назад',
                                            callback_data: 'back'
                                        }]
                                    ];

                                    for (let i = 0; i < rows[0].sentence.length; i++) {

                                        kbForCountry.unshift(
                                            [{
                                                text: rows[0].sentence[i].name,
                                                callback_data: rows[0].sentence[i].name,
                                            }]
                                        );

                                    }

                                    helper.template_general(chat.id,message_id, kbForCountry, rowz[0].info, function (text, opts) {
                                        bot.editMessageText(text, opts);

                                    });

                                    helper.switchState(chat.id, 'selectedCountry', msg.data, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'tours');

                                }

                            }
                        })





                    })


                } else {
                    console.log(rows,'этот',row[0].direction);

                    let neName = row[0].direction || '1';

                    console.log("neName только 1 (раз 02)",neName);
                    console.log(rows,row[0].direction, '099');


                    helper.arrTour(row[0].id, neName, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined,function () {


                        helper.findTourInfo(function (rowz) {

                            if (rowz.length === 0) {
                                if (rows.length !== 0) {
                                    if (rows[0].guide) {
                                        let kbForCountry = [
                                            [{
                                                text: 'Приобрести гайд',
                                                callback_data: 'buy_guide',
                                            }],
                                            [{
                                                text: '↩️Назад',
                                                callback_data: 'back'
                                            }]
                                        ];


                                        for (let i = 0; i < rows[0].sentence.length; i++) {

                                            kbForCountry.unshift(
                                                [{
                                                    text: rows[0].sentence[i].name,
                                                    callback_data: rows[0].sentence[i].name,
                                                }]
                                            );

                                        }

                                        helper.template_general(chat.id,message_id, kbForCountry,'☁️ Выберите нужный Вам раздел ниже!:', function (text, opts) {
                                            bot.editMessageText(text, opts);

                                        });

                                        helper.switchState(chat.id, 'selectedCountry', msg.data, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'tours');

                                        helper.addGuide(chat.id, rows[0].guide, rows[0].guideInfo, rows[0].guidePrice)

                                    }
                                    else {
                                        let kbForCountry = [
                                            [{
                                                text: '↩️Назад',
                                                callback_data: 'back'
                                            }]
                                        ];

                                        for (let i = 0; i < rows[0].sentence.length; i++) {

                                            kbForCountry.unshift(
                                                [{
                                                    text: rows[0].sentence[i].name,
                                                    callback_data: rows[0].sentence[i].name,
                                                }]
                                            );

                                        }

                                        helper.template_general(chat.id,message_id, kbForCountry,'☁️ Выберите нужный Вам раздел ниже!:', function (text, opts) {
                                            bot.editMessageText(text, opts);

                                        });

                                        helper.switchState(chat.id, 'selectedCountry', msg.data, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'tours');

                                    }
                                }
                                else {
                                    console.log(' ЧТО-ТО ТУТ');
                                    helper.resetUserInfo(chat.id, function (row) {
                                        console.log(row);
                                    });

                                    helper.template_general(chat.id, message_id, kb.homepage, '<b>☁️Выберите нужный Вам раздел ниже:</b>', function (text, opts) {
                                        bot.editMessageText(text, opts);

                                    });

                                }

                            }
                            else {

                                if (rows.length === 0) {
                                    helper.resetUserInfo(chat.id, function (row) {

                                    });

                                    helper.template_general(chat.id, message_id, kb.homepage, '<b>☁️Выберите нужный Вам раздел ниже:</b>', function (text, opts) {
                                        bot.editMessageText(text, opts);

                                    });

                                } else {
                                    let kbForCountry = [
                                        [{
                                            text: '↩️Назад',
                                            callback_data: 'back'
                                        }]
                                    ];

                                    for (let i = 0; i < rows[0].sentence.length; i++) {

                                        kbForCountry.unshift(
                                            [{
                                                text: rows[0].sentence[i].name,
                                                callback_data: rows[0].sentence[i].name,
                                            }]
                                        );

                                    }

                                    helper.template_general(chat.id,message_id, kbForCountry, rowz[0].info, function (text, opts) {
                                        bot.editMessageText(text, opts);

                                    });

                                    helper.switchState(chat.id, 'selectedCountry', msg.data, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'tours');

                                }


                            }
                        })





                    })
                }
            }




        }


    });


}

