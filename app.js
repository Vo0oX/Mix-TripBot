process.env.NTBA_FIX_319 = 1;
const express = require('express');
const bodyParser = require("body-parser");
const sha1 = require('sha1');
const TelegramBot = require('node-telegram-bot-api');
const microstats = require('microstats');
require('dotenv').config({path: __dirname + '/.env'});
const config = require('./src/html_template');
const helper = require('./src/helper');
const keyboard = require('./src/keyboard');
const kb = require('./src/keyboard_buttons');
const userScheme = require('./models/user.model');
const CloudIpsp = require('cloudipsp-node-js-sdk');
const toursScheme = require('./models/tours.model');
const eventScheme = require('./models/events.model');
const businessCampScheme = require('./models/businessCamp.model');



const app = express();
const urlencodedParser = bodyParser.urlencoded({extended: false});
app.use(bodyParser.json());

const bot = new TelegramBot(process.env.BOT_TOKEN, {
    polling: {
        interval: 300,
        autoStart: true,
        params: {
            timeout: 10
        }
    }
});

let newSentence = {};
newSentence.date = [];
let newTour = {};


app.post("/callback",urlencodedParser, function(request, response){
    response.sendStatus(200);



    let servSign = request.body.signature;
    let peyStatus = request.body.order_status;

    let myObj = request.body;
    delete myObj.signature;

    let keys = [],
        k, i, len;

    let nLen = [process.env.Fondy_secretKey];

    for (k in myObj) {
        if (myObj.hasOwnProperty(k)) {
            keys.push(k);
        }
    }

    keys.sort();

    len = keys.length;

    for (i = 0; i < len; i++) {
        k = keys[i];

        if (myObj[k].length !== 0) {

            nLen.push(`|`+myObj[k]);
        }

    }
    let lestLen = nLen.join('');


    let signature = sha1(lestLen);

    let client_id = JSON.parse(request.body.merchant_data);

    let chatID = client_id[0].chat_id;



    if (servSign === signature && peyStatus === 'approved') {

        helper.userCheck(chatID, function (row) {

            let fin_blanc = (row[0].balance + (row[0].add_funds));


            helper.add_funds(chatID, fin_blanc, function (row) {

            });


            let order = {
                'sum': row[0].add_funds
            };
            helper.addFundsHist(chatID, order);


            bot.sendMessage(`${chatID}`, config.HTML_add_funds_notif + `${fin_blanc} руб`, {
                parse_mode: 'HTML',
                disable_web_page_preview: true,
                reply_markup: {
                    keyboard: keyboard.homepage,
                    resize_keyboard: true
                }

            }).then(setTimeout(() => {
                bot.sendMessage(chatID, '☁️Выберите нужный Вам раздел ниже:', {
                    reply_markup: {
                        inline_keyboard: kb.homepage
                    }
                })
            }, 700));

            bot.sendMessage(process.env.Admin_ID, `<code>☁️ Серверное сообщение:
💰 ${row[0].add_funds} руб
👤 <b>${chatID}</b>
                </code>`,{
                parse_mode: 'HTML',
                disable_web_page_preview: true,
            });
            bot.sendMessage(process.env.Dev_ID, `<code>☁️ Серверное сообщение:
💰 ${row[0].add_funds} руб
👤 <b>${chatID}</b>
                </code>`,{
                parse_mode: 'HTML',
                disable_web_page_preview: true,
            });

        });

    }
    else if (servSign === signature && peyStatus === 'created') {

        console.log(' created — заказ был создан, но клиент еще не ввел платежные реквизиты; необходимо продолжать опрашивать статус заказа\n');


    }
    else if (servSign === signature && peyStatus === 'processing') {

        console.log(' processing — заказ все еще находится в процессе обработки платежным шлюзом; необходимо продолжать опрашивать статус заказа\n');


    }
    else if (servSign === signature && peyStatus === 'declined') {

        console.log(' declined — заказ отклонен платежным шлюзом FONDY, внешней платежной системой или банком-эквайером\n');


    }
    else if (servSign === signature && peyStatus === 'expired') {

        console.log(' expired — время жизни заказа, указанное в параметре lifetime, истекло.\n');


    }
    else if (servSign === signature && peyStatus === 'reversed') {

        console.log(' reversed — ранее успешная транзакция была полностью отменена. В таком случае параметр reversal_amount будет эквивалентно actual_amount\n');


    }
    else {
        bot.sendMessage(chatID, `Что-то пошло не так 🤔 `, {
            parse_mode: 'HTML',
            reply_markup: {
                resize_keyboard: true
            }

        })
    }


});


let allArr;


bot.on('message', msg => {


    let step;

    helper.userCheck(helper.getChatId(msg), function (row) {


        if (msg.text === kb.general.home_menu) {

            allArr = {};

            bot.sendMessage(helper.getChatId(msg), '☁️Выберите нужный Вам раздел ниже:', {
                reply_markup: {inline_keyboard: kb.homepage}
            });

            helper.resetUserInfo(helper.getChatId(msg), function (row) {});
            // helper.interestedTourTmpClear(helper.getChatId(msg))

            step = 'v2';
            helper.switchState(helper.getChatId(msg), step);

        }
        else if (msg.text === '/start') {
            step = 'v2';
            helper.switchState(helper.getChatId(msg), step);
        }
        else {

            if (msg.text === 'Добавить Тур' && helper.getChatId(msg).toString() === process.env.Admin_ID || msg.text === 'Добавить Тур' && helper.getChatId(msg).toString() === process.env.Dev_ID) {

                bot.sendMessage(helper.getChatId(msg), '1️⃣ Введите Название тура и флаг ' +
                    'Например: 🇬🇪 Грузия');

                helper.switchState(helper.getChatId(msg), 'infoTours');

            }

            else if (msg.text === 'Удалить Тур' && helper.getChatId(msg).toString() === process.env.Admin_ID || msg.text === 'Удалить Тур' && helper.getChatId(msg).toString() === process.env.Dev_ID) {

                helper.loadButton(function (row) {


                    let newRow = row;

                    newRow.push([
                        {
                            text: '🛒Admin',
                            callback_data: '🛒Admin'
                        }
                    ]);


                    bot.sendMessage(helper.getChatId(msg), 'Какой тур будем удалять?', {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                        reply_markup: {
                            keyboard: newRow,
                            resize_keyboard: true
                        }

                    })
                    helper.switchState(helper.getChatId(msg), 'deleteToure');

                });





            }

            else if (msg.text === 'Удалить Мероприятие' && helper.getChatId(msg).toString() === process.env.Admin_ID || msg.text === 'Удалить Мероприятие' && helper.getChatId(msg).toString() === process.env.Dev_ID) {

                eventScheme.find({}, function (err, rows) {


                    let btnRow = [
                        [{
                            text: '🛒Admin',
                            callback_data: '🛒Admin'
                        }]
                    ];


                    for (let i = 0; i < rows.length; i++) {

                        btnRow.unshift([
                            {
                                text: rows[i].eventShortBtn,
                                callback_data: rows[i].eventShortBtn
                            }
                        ]);



                    }

                    bot.sendMessage(helper.getChatId(msg), 'Какое мероприятие будем удалять?', {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                        reply_markup: {
                            keyboard: btnRow,
                            resize_keyboard: true
                        }

                    })
                    helper.switchState(helper.getChatId(msg), 'deleteEvents');



                })






            }

            else if (msg.text === 'Удалить Business Camp' && helper.getChatId(msg).toString() === process.env.Admin_ID || msg.text === 'Удалить Business Camp' && helper.getChatId(msg).toString() === process.env.Dev_ID) {

                businessCampScheme.find({}, function (err, rows) {


                    let btnRows = [
                        [{
                            text: '🛒Admin',
                            callback_data: '🛒Admin'
                        }]
                    ];


                    for (let i = 0; i < rows.length; i++) {

                        btnRows.unshift([
                            {
                                text: rows[i].businessCampShortBtn,
                                callback_data: rows[i].businessCampShortBtn
                            }
                        ]);



                    }

                    bot.sendMessage(helper.getChatId(msg), 'Какое мероприятие будем удалять?', {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                        reply_markup: {
                            keyboard: btnRows,
                            resize_keyboard: true
                        }

                    })
                    helper.switchState(helper.getChatId(msg), 'deleteBusinessCamp');



                })






            }

            else if (row[0].step === 'shareSocial') {


                eventScheme.find({info:row[0].task}, function (err, rows) {

                }).then(
                    helper.eventUsrUp(helper.getChatId(msg),msg.text, function () {
                        bot.sendMessage(helper.getChatId(msg), '🚀 Мероприятие успешно забронировано.', {
                            parse_mode: 'HTML',
                            disable_web_page_preview: true,
                            reply_markup: {
                                inline_keyboard: kb.homepage,
                                resize_keyboard: true
                            }

                        })
                        bot.sendMessage(process.env.Admin_ID, `☁️ Серверное сообщение:
                 
Имя: ${row[0].name},
Соц. сеть: <code><strong>${msg.text}</strong></code>,

                       
Забронировал Мероприятие: 
        ${row[0].task}

                       
                        
                        `,{
                            parse_mode: 'HTML',
                            disable_web_page_preview: true,
                        });
                        bot.sendMessage(process.env.Dev_ID, `☁️ Серверное сообщение:
                 
Имя: ${row[0].name},
Соц. сеть: <code><strong>${msg.text}</strong></code>,

                       
Забронировал Мероприятие: 
        ${row[0].task}
                       
                        
                        `,{
                            parse_mode: 'HTML',
                            disable_web_page_preview: true,
                        });
                    })

                )

            }

            else if (row[0].step === 'shareSocialB') {


                businessCampScheme.find({info:row[0].task}, function (err, rows) {

                }).then(
                    helper.eventUsrUp(helper.getChatId(msg),msg.text, function () {
                        bot.sendMessage(helper.getChatId(msg), '🚀 Мероприятие успешно забронировано.', {
                            parse_mode: 'HTML',
                            disable_web_page_preview: true,
                            reply_markup: {
                                inline_keyboard: kb.homepage,
                                resize_keyboard: true
                            }

                        })
                        bot.sendMessage(process.env.Admin_ID, `☁️ Серверное сообщение:
                 
Имя: ${row[0].name},
Соц. сеть: <code><strong>${msg.text}</strong></code>,

                       
Забронировал Business Camp: 
        ${row[0].task}

                       
                        
                        `,{
                            parse_mode: 'HTML',
                            disable_web_page_preview: true,
                        });
                        bot.sendMessage(process.env.Dev_ID, `☁️ Серверное сообщение:
                 
Имя: ${row[0].name},
Соц. сеть: <code><strong>${msg.text}</strong></code>,

                       
Забронировал Business Camp: 
        ${row[0].task}
                       
                        
                        `,{
                            parse_mode: 'HTML',
                            disable_web_page_preview: true,
                        });
                    })

                )

            }

            else if (row[0].step === 'deleteEvents') {




                bot.sendMessage(helper.getChatId(msg), "Мероприятие успешно удален 🙌", {
                    parse_mode: 'HTML',
                    disable_web_page_preview: true,
                    reply_markup: {
                        keyboard: keyboard.admin,
                        resize_keyboard: true
                    }

                })

                eventScheme.deleteOne({eventShortBtn: msg.text}, function (err) {

                    if (!err) {
                        console.log('ok')
                    }
                    else {
                        console.log('err')
                    }


                });


                helper.switchState(helper.getChatId(msg), 'v6');


            }

            else if (row[0].step === 'deleteBusinessCamp') {




                bot.sendMessage(helper.getChatId(msg), "Business Camp успешно удален 🙌", {
                    parse_mode: 'HTML',
                    disable_web_page_preview: true,
                    reply_markup: {
                        keyboard: keyboard.admin,
                        resize_keyboard: true
                    }

                })

                businessCampScheme.deleteOne({businessCampShortBtn: msg.text}, function (err) {

                    if (!err) {
                        console.log('ok')
                    }
                    else {
                        console.log('err')
                    }


                });


                helper.switchState(helper.getChatId(msg), 'v6');


            }

            else if (row[0].step === 'deleteToure') {




                bot.sendMessage(helper.getChatId(msg), "Тур успешно удален 🙌", {
                    parse_mode: 'HTML',
                    disable_web_page_preview: true,
                    reply_markup: {
                        keyboard: keyboard.admin,
                        resize_keyboard: true
                    }

                })
                toursScheme.deleteOne({name: msg.text}, function (err) {

                    if (!err) {
                        console.log('ok')
                    }
                    else {
                        console.log('err')
                    }


                });


                helper.switchState(helper.getChatId(msg), 'v6');


            }


            else if (row[0].step === 'enterInfoTour') {

                helper.arrTour(row[0].id, undefined, undefined, undefined, undefined, msg.text, undefined, undefined, undefined, undefined,function () {


                    bot.sendMessage(helper.getChatId(msg), '2️⃣ Сколько человек?' +
                        '\nНапример: 2 ', {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                        reply_markup: {
                            resize_keyboard: true
                        }

                    });


                    helper.switchState(helper.getChatId(msg), 'enterInfoTour_people');

                })



            }

            else if (row[0].step === 'enterInfoTour_people') {

                helper.arrTour(row[0].id, undefined, undefined, undefined, undefined, undefined, msg.text, undefined, undefined, undefined,function () {


                    bot.sendMessage(helper.getChatId(msg), '3️⃣ Eсли есть ребенок, то сколько лет?' +
                        '\nНапример: "Мальчик 12" или "Девочка 8"', {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                        reply_markup: {
                            resize_keyboard: true
                        }

                    });

                    helper.switchState(helper.getChatId(msg), 'enterInfoTour_children');
                })



            }

            else if (row[0].step === 'enterInfoTour_children') {

                helper.arrTour(row[0].id, undefined, undefined, undefined, undefined, undefined, undefined, msg.text, undefined, undefined,function () {

                    bot.sendMessage(helper.getChatId(msg), '4️⃣ На сколько дней рассматриваете?' +
                        '\nНапример: "10 дней" или "5-7 дней"', {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                        reply_markup: {
                            resize_keyboard: true
                        }

                    });

                    helper.switchState(helper.getChatId(msg), 'enterInfoTour_finder');
                })



            }

            else if (row[0].step === 'enterInfoTour_finder') {

                helper.arrTour(row[0].id, undefined, undefined, undefined, undefined, undefined, undefined, undefined, msg.text, undefined,function () {


                    if (row[0].phone === null) {
                        let options = {
                            "parse_mode": "Markdown",
                            "reply_markup": JSON.stringify({
                                "keyboard": [
                                    [{ text: "Поделиться контактом", request_contact: true }]
                                ],
                                "one_time_keyboard" : true
                            })
                        };
                        bot.sendMessage(helper.getChatId(msg), "❗️️ Отправьте нам Ваш контакт, менеджер подберет варианты и свяжется с Вами", options);



                        helper.switchState(row[0].id, 'v12');

                    }
                    else {
                        bot.sendMessage(helper.getChatId(msg), `❗️Ваша презентация: \n${row[0].presentation}`, {
                            parse_mode: 'HTML',
                            reply_markup: {
                                keyboard: keyboard.homepage,
                                resize_keyboard: true
                            }

                        }).then(setTimeout(() => {
                            bot.sendMessage(helper.getChatId(msg), '☁️Выберите нужный Вам раздел ниже:', {
                                reply_markup: {
                                    inline_keyboard: kb.homepage
                                }
                            })
                        }, 700))

                        bot.sendMessage(process.env.Admin_ID, `☁️ Серверное сообщение:
                 
Имя: ${row[0].name},
Номер: <code><strong>${row[0].phone}</strong></code>,

                       
Забронировал Тур: 
    Страна: ${row[0].direction}
    Тур: ${row[0].nameTour}
    Тип тура: ${row[0].typeTour}
    Дата: ${row[0].date}
    Кол-во людей: ${row[0].people}
    Дети: ${row[0].children}
    Рассматривают дней: ${msg.text}
    

                       
                        
                        `,{
                            parse_mode: 'HTML',
                            disable_web_page_preview: true,
                        });

                        bot.sendMessage(process.env.Dev_ID, `☁️ Серверное сообщение:
                 
Имя: ${row[0].name},
Номер: <code><strong>${row[0].phone}</strong></code>,

                       
Забронировал Тур: 
    Страна: ${row[0].direction}
    Тур: ${row[0].nameTour}
    Тип тура: ${row[0].typeTour}
    Дата: ${row[0].date}
    Кол-во людей: ${row[0].people}
    Дети: ${row[0].children}
    Рассматривают дней: ${msg.text}   
    
 
                        `,{
                            parse_mode: 'HTML',
                            disable_web_page_preview: true,
                        });


                        // helper.interestedTourTmp(row[0].id, selectedTourArr, function () {
                        //     selectedTourArr = {};
                        // })



                    }


                })


            }

            else if (row[0].step === 'infoTours') {


                String.prototype.translit = String.prototype.translit || function () {
                    let Chars = {
                            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya', 'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'YO', 'Ж': 'ZH', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'C', 'Ч': 'CH', 'Ш': 'SH', 'Щ': 'SHCH', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'YU', 'Я': 'YA'
                        },
                        t = this;
                    for (let i in Chars) { t = t.replace(new RegExp(i, 'g'), Chars[i]); }
                    return t;
                };

                let btn_name = msg.text.translit().replace(/[^a-zA-ZА-Яа-я]/g, '');

                newTour.name = msg.text;
                newTour.btn_name = btn_name;


                bot.sendMessage(helper.getChatId(msg), '2️⃣ Добавьте описание Туров. \nНапример:' +
                    `<i>
    <code><strong>Отличие туров:</strong>🤖</code> 
    <pre>
    Все очень просто:
    </pre>
    
<code>1️⃣<u> С помощью меню выбираешь - «🛒<strong>Туры</strong>».</u></code>
<code>2️⃣<u> Выбираешь.</u></code>
</i>`);




                helper.switchState(helper.getChatId(msg), 'doneTour');


            }

            else if (row[0].step === 'doneTour') {


                newTour.infoTours = msg.text;


                bot.sendMessage(helper.getChatId(msg), '🙌 Тур добавлен');


                helper.addTour(newTour,function () {
                    newTour = {};
                })

                helper.switchState(helper.getChatId(msg), 'v6');


            }



            else if (msg.text === 'Редактировать Тур' && helper.getChatId(msg).toString() === process.env.Admin_ID || msg.text === 'Редактировать Тур' && helper.getChatId(msg).toString() === process.env.Dev_ID) {

                newSentence.date = [];

                helper.loadButton(function (row) {


                    let newRow = row;

                    newRow.push([
                        {
                            text: '🛒Admin',
                            callback_data: '🛒Admin'
                        }
                    ]);


                    bot.sendMessage(helper.getChatId(msg), 'Что будем редактировать?', {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                        reply_markup: {
                            keyboard: newRow,
                            resize_keyboard: true
                        }

                    })
                    helper.switchState(helper.getChatId(msg), 'editTour');

                });




            }

            else if (msg.text === 'Добавить Мероприятие' && helper.getChatId(msg).toString() === process.env.Admin_ID || msg.text === 'Добавить Мероприятие' && helper.getChatId(msg).toString() === process.env.Dev_ID) {



                bot.sendMessage(helper.getChatId(msg), '1️⃣ Введите описание Мероприятия. \nНапример:' +
                    `<i>
    <code><strong>Мероприятие такое-то</strong>🤖</code> 
    <pre>
        Будет то и то
    </pre>
    
<code>1️⃣<u> Забронировать можно нажав кнопку🛒<strong> Забронировать Мероприятие </strong>».</u></code>

</i>`);




                helper.switchState(helper.getChatId(msg), 'eventsCreate');

            }

            else if (msg.text === 'Добавить Business Camp' && helper.getChatId(msg).toString() === process.env.Admin_ID || msg.text === 'Добавить Business Camp' && helper.getChatId(msg).toString() === process.env.Dev_ID) {



                bot.sendMessage(helper.getChatId(msg), '1️⃣ Введите описание Business Camp. \nНапример:' +
                    `<i>
    <code><strong>Мероприятие такое-то</strong>🤖</code> 
    <pre>
        Будет то и то
    </pre>
    
<code>1️⃣<u> Забронировать можно нажав кнопку🛒<strong> Забронировать Business Camp </strong>».</u></code>

</i>`);




                helper.switchState(helper.getChatId(msg), 'businessCampCreate');

            }

            else if (row[0].step === 'businessCampCreate') {

                allArr = {
                    info: msg.text
                };


                bot.sendMessage(helper.getChatId(msg), '2️⃣ Введите КРОТКУЮ КНОПКУ \n❗️Обратите внимание, короткая кнопка не должна совпадать с любым другим названием. \nНапример: "businessCamp1" или "camp1"');




                helper.switchState(helper.getChatId(msg), 'businessCampCreateDone');
            }

            else if (row[0].step === 'businessCampCreateDone') {


                allArr.businessCampShortBtn = msg.text;



                bot.sendMessage(helper.getChatId(msg), '🙌 Business Camp добавлен');


                helper.businessCampCreateS(allArr,function () {
                    allArr = {};
                })

                helper.switchState(helper.getChatId(msg), 'v6');
            }

            else if (row[0].step === 'eventsCreate') {

                allArr = {
                    info: msg.text
                };


                bot.sendMessage(helper.getChatId(msg), '2️⃣ Введите КРОТКУЮ КНОПКУ \n❗️Обратите внимание, короткая кнопка не должна совпадать с любым другим названием. \nНапример: "event1Name" или "eventCamp1202"');




                helper.switchState(helper.getChatId(msg), 'eventsCreateDone');
            }

            else if (row[0].step === 'eventsCreateDone') {


                allArr.eventShortBtn = msg.text;



                bot.sendMessage(helper.getChatId(msg), '🙌 Мероприятие добавлено');


                helper.eventsCreate(allArr,function () {
                    allArr = {};
                })

                helper.switchState(helper.getChatId(msg), 'v6');
            }

            else if (row[0].step === 'editTour') {

                if (msg.text === '🛒Admin') {

                    allArr = {};

                    helper.switchState(helper.getChatId(msg), 'v99');

                    helper.resetUserInfo(helper.getChatId(msg), function () {

                        bot.sendMessage(helper.getChatId(msg), "🙌 Изменения внесены", {
                            parse_mode: 'HTML',
                            disable_web_page_preview: true,
                            reply_markup: {
                                keyboard: keyboard.admin,
                                resize_keyboard: true
                            }

                        })
                    });


                }
                else {
                    toursScheme.find({name: msg.text}, function (err, rows) {


                        if (err) {
                            console.log(err)
                        } else {


                            if (rows.length === 0) {

                            } else {


                                bot.sendMessage(helper.getChatId(msg), 'Что будем добавлять?', {
                                    parse_mode: 'HTML',
                                    disable_web_page_preview: true,
                                    reply_markup: {
                                        keyboard: kb.add_tours,
                                        resize_keyboard: true
                                    }

                                })

                                helper.switchState(helper.getChatId(msg), 'editTourCountry', rows[0]._id);
                                //helper.switchState(helper.getChatId(msg), 'editTourCountry', rows[0]._id);


                            }

                        }


                    });

                }

            }

            else if (row[0].step === 'editTourCountry') {


                if (msg.text === '🛒Admin') {

                    allArr = {};

                    helper.switchState(helper.getChatId(msg), 'v99');

                    helper.resetUserInfo(helper.getChatId(msg), function () {

                        bot.sendMessage(helper.getChatId(msg), "🙌 Изменения внесены", {
                            parse_mode: 'HTML',
                            disable_web_page_preview: true,
                            reply_markup: {
                                keyboard: keyboard.admin,
                                resize_keyboard: true
                            }

                        })
                    });


                }
                else if (msg.text === 'Добавить Гайд') {

                    bot.sendMessage(helper.getChatId(msg), '1️⃣ Добавить Гайд,' +
                        'Например: https://telegra.ph/Kak-dobavit-zadanie-v-bot-02-01', {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                        reply_markup: {
                            resize_keyboard: true
                        }

                    });


                    helper.switchState(helper.getChatId(msg), 'add_guide');



                }
                else if (msg.text === 'Добавить Экспедицию' ) {


                    bot.sendMessage(helper.getChatId(msg), '1️⃣ Введите Предложение' +
                        '☁️ Например: Марокко Люкс 1350 евро', {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                        reply_markup: {
                            keyboard: [[
                                {
                                    text: '🛒Admin',
                                    callback_data: '🛒Admin'
                                }
                            ]],
                            resize_keyboard: true
                        }

                    })
                    helper.switchState(helper.getChatId(msg), 'sentence');

                }
                else if (msg.text === 'Редактировать Экспедицию' ) {


                    helper.userCheck(helper.getChatId(msg), function (row) {


                        toursScheme.find({_id:row[0].stepEditor}, function (err, rows) {

                            if (err)
                                console.log(err)
                            else {
                                if (rows[0].sentence.length === 0) {

                                    bot.sendMessage(helper.getChatId(msg), 'Экспедиций нету!', {
                                        parse_mode: 'HTML',
                                        disable_web_page_preview: true,
                                        reply_markup: {
                                            keyboard: kb.add_tours,
                                            resize_keyboard: true
                                        }

                                    })

                                    helper.switchState(helper.getChatId(msg), 'editTourCountry', rows[0]._id);
                                    //helper.switchState(helper.getChatId(msg), 'editTourCountry', rows[0]._id);


                                } else {

                                    let kbForCountryEditExp = [
                                        [{
                                            text: '🛒Admin',
                                            callback_data: '🛒Admin'
                                        }]
                                    ];


                                    for (let i = 0; i < rows[0].sentence.length; i++) {



                                        kbForCountryEditExp.unshift(
                                            [{
                                                text: rows[0].sentence[i].name,
                                                callback_data: rows[0].sentence[i].name,
                                            }]
                                        );



                                    }
                                    bot.sendMessage(helper.getChatId(msg), 'Что будем редактировать?', {
                                        parse_mode: 'HTML',
                                        disable_web_page_preview: true,
                                        reply_markup: {
                                            keyboard: kbForCountryEditExp,
                                            resize_keyboard: true
                                        }

                                    })
                                    helper.switchState(helper.getChatId(msg), 'adminEditCountry');

                                }

                            }
                        })

                    });

                }
                else if (msg.text === 'Удалить Экспедицию' ) {


                    helper.userCheck(helper.getChatId(msg), function (row) {


                        toursScheme.find({_id:row[0].stepEditor}, function (err, rows) {

                            if (err)
                                console.log(err)
                            else {
                                if (rows[0].sentence.length === 0) {

                                    bot.sendMessage(helper.getChatId(msg), 'Экспедиций нету!', {
                                        parse_mode: 'HTML',
                                        disable_web_page_preview: true,
                                        reply_markup: {
                                            keyboard: kb.add_tours,
                                            resize_keyboard: true
                                        }

                                    })

                                    helper.switchState(helper.getChatId(msg), 'editTourCountry', rows[0]._id);
                                    //helper.switchState(helper.getChatId(msg), 'editTourCountry', rows[0]._id);


                                }
                                else {

                                    let kbForCountryEditExp = [
                                        [{
                                            text: '🛒Admin',
                                            callback_data: '🛒Admin'
                                        }]
                                    ];


                                    for (let i = 0; i < rows[0].sentence.length; i++) {



                                        kbForCountryEditExp.unshift(
                                            [{
                                                text: rows[0].sentence[i].name,
                                                callback_data: rows[0].sentence[i].name,
                                            }]
                                        );



                                    }
                                    bot.sendMessage(helper.getChatId(msg), 'Что будем удалять?', {
                                        parse_mode: 'HTML',
                                        disable_web_page_preview: true,
                                        reply_markup: {
                                            keyboard: kbForCountryEditExp,
                                            resize_keyboard: true
                                        }

                                    })
                                    helper.switchState(helper.getChatId(msg), 'adminEditCountryExpedition');

                                }

                            }
                        })

                    });

                }
                else if (msg.text === 'Редактировать Описание Туров' ) {


                    bot.sendMessage(helper.getChatId(msg), '2️⃣ Добавьте описание Туров. \nНапример:' +
                        `<i>
    <code><strong>Отличие туров:</strong>🤖</code> 
    <pre>
    Все очень просто:
    </pre>
    
<code>1️⃣<u> С помощью меню выбираешь - «🛒<strong>Туры</strong>».</u></code>
<code>2️⃣<u> Выбираешь.</u></code>
</i>`, {
                        disable_web_page_preview: true,
                        reply_markup: {
                            keyboard: [[
                                {
                                    text: '🛒Admin',
                                    callback_data: '🛒Admin'
                                }
                            ]],
                            resize_keyboard: true
                        }

                    });




                    helper.switchState(helper.getChatId(msg), 'adminEditInfoToursTT');
                }

            }

            else if (row[0].step === 'adminEditCountry') {
                helper.userCheck(helper.getChatId(msg), function () {


                    if (msg.text === '🛒Admin') {
                        allArr = {};
                        newSentence = {};

                        helper.switchState(helper.getChatId(msg), 'v99');

                        helper.resetUserInfo(helper.getChatId(msg), function () {

                            bot.sendMessage(helper.getChatId(msg), "🙌 Изменения внесены", {
                                parse_mode: 'HTML',
                                disable_web_page_preview: true,
                                reply_markup: {
                                    keyboard: keyboard.admin,
                                    resize_keyboard: true
                                }

                            })
                        });
                    }
                    else {
                        console.log('тут');

                        helper.sentenseCheck(msg.text , function (list) {
                            allArr = list;

                            bot.sendMessage(helper.getChatId(msg), 'Что будем редактировать?', {
                                parse_mode: 'HTML',
                                disable_web_page_preview: true,
                                reply_markup: {
                                    keyboard: [
                                        [{
                                            text: 'Название предложения',
                                            callback_data: 'countryEditNameT'
                                        }],
                                        [{
                                            text: 'Изменить описание',
                                            callback_data: 'countryEditInfoT'
                                        }],
                                        [{
                                            text: 'Изменить презентацию',
                                            callback_data: 'countryEditPresenT'
                                        }],
                                        [{
                                            text: 'Изменить даты',
                                            callback_data: 'countryEditDate'
                                        }],
                                        [{
                                            text: 'Изменить предоплату',
                                            callback_data: 'countryEditPreOrder'
                                        }],
                                        [{
                                            text: '🛒Admin',
                                            callback_data: '🛒Admin'
                                        }]
                                    ],
                                    resize_keyboard: true
                                }

                            })
                            helper.switchState(helper.getChatId(msg), 'editorAllCountryAdT');
                        })



                    }


                });

            }

            else if (row[0].step === 'adminDeleteCountry') {
                helper.userCheck(helper.getChatId(msg), function () {


                    if (msg.text === '🛒Admin') {
                        allArr = {};
                        newSentence = {};

                        helper.switchState(helper.getChatId(msg), 'v99');

                        helper.resetUserInfo(helper.getChatId(msg), function () {

                            bot.sendMessage(helper.getChatId(msg), "🙌 Изменения внесены", {
                                parse_mode: 'HTML',
                                disable_web_page_preview: true,
                                reply_markup: {
                                    keyboard: keyboard.admin,
                                    resize_keyboard: true
                                }

                            })
                        });
                    } else {
                        console.log('третий редакт');
                        helper.sentenseCheck(msg.text , function (list) {
                            allArr = list;

                            bot.sendMessage(helper.getChatId(msg), 'Что будем редактировать?', {
                                parse_mode: 'HTML',
                                disable_web_page_preview: true,
                                reply_markup: {
                                    keyboard: [
                                        [{
                                            text: 'Название предложения',
                                            callback_data: 'countryEditNameT'
                                        }],
                                        [{
                                            text: 'Изменить описание',
                                            callback_data: 'countryEditInfoT'
                                        }],
                                        [{
                                            text: 'Изменить презентацию',
                                            callback_data: 'countryEditPresenT'
                                        }],
                                        [{
                                            text: 'Изменить даты',
                                            callback_data: 'countryEditDate'
                                        }],
                                        [{
                                            text: 'Изменить предоплату',
                                            callback_data: 'countryEditPreOrder'
                                        }],
                                        [{
                                            text: '🛒Admin',
                                            callback_data: '🛒Admin'
                                        }]
                                    ],
                                    resize_keyboard: true
                                }

                            })
                            helper.switchState(helper.getChatId(msg), 'editorAllCountryAdT');
                        })

                    }


                });



            }

            else if (row[0].step === 'adminEditInfoToursTT') {

                if (msg.text === '🛒Admin') {


                    helper.switchState(helper.getChatId(msg), 'v99');

                    helper.resetUserInfo(helper.getChatId(msg), function () {

                        bot.sendMessage(helper.getChatId(msg), "🙌 Изменения внесены", {
                            parse_mode: 'HTML',
                            disable_web_page_preview: true,
                            reply_markup: {
                                keyboard: keyboard.admin,
                                resize_keyboard: true
                            }

                        })
                    });


                }
                else {
                    bot.sendMessage(helper.getChatId(msg), 'Успешно изменили', {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                        reply_markup: {
                            keyboard: keyboard.admin,
                            resize_keyboard: true
                        }

                    });


                    toursScheme.updateMany({_id: row[0].stepEditor}, {
                        $set: {
                            infoTours: msg.text
                        }
                    }, {upsert: false}, function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('OK');
                        }
                    });

                    helper.switchState(helper.getChatId(msg), 'v8n72');
                }




            }

            else if (row[0].step === 'editorAllCountryAdT') {
                if (msg.text === '🛒Admin') {
                    allArr = {};
                    newSentence = {};

                    helper.switchState(helper.getChatId(msg), 'v99');

                    helper.resetUserInfo(helper.getChatId(msg), function () {

                        bot.sendMessage(helper.getChatId(msg), "🙌 Изменения внесены", {
                            parse_mode: 'HTML',
                            disable_web_page_preview: true,
                            reply_markup: {
                                keyboard: keyboard.admin,
                                resize_keyboard: true
                            }

                        })
                    });
                }
                else if (msg.text === 'Название предложения' ) {


                    bot.sendMessage(helper.getChatId(msg), '1️⃣ Введите Предложение' +
                        '☁️ Например: Марокко Люкс 1350 евро', {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                        reply_markup: {
                            keyboard: [[
                                {
                                    text: '🛒Admin',
                                    callback_data: '🛒Admin'
                                }
                            ]],
                            resize_keyboard: true
                        }

                    })

                    helper.switchState(helper.getChatId(msg), 'countryEditNameTT');

                }
                else if (msg.text === 'Изменить описание') {
                    bot.sendMessage(helper.getChatId(msg), '1️⃣ Добавьте описание тура,' +
                        'Например: "Это Авторский тур тоси-боси" ', {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                        reply_markup: {
                            keyboard: [
                                [{
                                    text: '🛒Admin',
                                    callback_data: '🛒Admin'
                                }]
                            ],
                            resize_keyboard: true
                        }

                    });
                    helper.switchState(helper.getChatId(msg), 'countryEditInfoTT');

                }
                else if (msg.text === 'Изменить презентацию') {
                    bot.sendMessage(helper.getChatId(msg), '1️⃣ Добавьте презентацию,' +
                        'Например: https://telegra.ph/Kak-dobavit-zadanie-v-bot-02-01', {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                        reply_markup: {
                            keyboard: [
                                [{
                                    text: '🛒Admin',
                                    callback_data: '🛒Admin'
                                }]
                            ],
                            resize_keyboard: true
                        }

                    });
                    helper.switchState(helper.getChatId(msg), 'countryEditPresenTT');

                }
                else if (msg.text === 'Изменить даты') {
                    bot.sendMessage(helper.getChatId(msg), '1️⃣ Добавьте дату', {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                        reply_markup: {
                            keyboard: [
                                [{
                                    text: '🛒Admin',
                                    callback_data: '🛒Admin'
                                }]
                            ],
                            resize_keyboard: true
                        }

                    });
                    helper.switchState(helper.getChatId(msg), 'countryEditDateTT');
                }
                else if (msg.text === 'Изменить предоплату') {
                    bot.sendMessage(helper.getChatId(msg), '1️⃣ Добавьте предоплату в рублях,' +
                        'Например: "25000"', {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                        reply_markup: {
                            keyboard: [
                                [{
                                    text: '🛒Admin',
                                    callback_data: '🛒Admin'
                                }]
                            ],
                            resize_keyboard: true
                        }

                    });
                    helper.switchState(helper.getChatId(msg), 'countryEditPreOrderTT');
                }




            }

            else if (row[0].step === 'countryEditNameTT') {

                if (msg.text === '🛒Admin') {
                    allArr = {};
                    newSentence = {};

                    helper.switchState(helper.getChatId(msg), 'v99');

                    helper.resetUserInfo(helper.getChatId(msg), function () {

                        bot.sendMessage(helper.getChatId(msg), "🙌 Изменения внесены", {
                            parse_mode: 'HTML',
                            disable_web_page_preview: true,
                            reply_markup: {
                                keyboard: keyboard.admin,
                                resize_keyboard: true
                            }

                        })
                    });
                }
                else {
                    toursScheme.updateMany({'sentence.name': allArr.sentence[0].name}, {'$set': {
                            'sentence.$.name': msg.text
                        }}, function() {

                        allArr.sentence[0].name = msg.text

                        bot.sendMessage(helper.getChatId(msg), "🙌 Изменения внесены", {
                            parse_mode: 'HTML',
                            disable_web_page_preview: true,
                            reply_markup: {
                                keyboard: [
                                    [{
                                        text: 'Название предложения',
                                        callback_data: 'countryEditNameT'
                                    }],
                                    [{
                                        text: 'Изменить описание',
                                        callback_data: 'countryEditInfoT'
                                    }],
                                    [{
                                        text: 'Изменить презентацию',
                                        callback_data: 'countryEditPresenT'
                                    }],
                                    [{
                                        text: 'Изменить даты',
                                        callback_data: 'countryEditDate'
                                    }],
                                    [{
                                        text: 'Изменить предоплату',
                                        callback_data: 'countryEditPreOrder'
                                    }],
                                    [{
                                        text: '🛒Admin',
                                        callback_data: '🛒Admin'
                                    }]
                                ],
                                resize_keyboard: true
                            }

                        });


                        helper.switchState(helper.getChatId(msg), 'editorAllCountryAdT');

                    });
                }

            }

            else if (row[0].step === 'countryEditPresenTT') {


                console.log(9999);
                console.log(allArr);
                console.log(allArr.sentence[0].name);

                if (msg.text === '🛒Admin') {
                    allArr = {};
                    newSentence = {};

                    helper.switchState(helper.getChatId(msg), 'v99');

                    helper.resetUserInfo(helper.getChatId(msg), function () {

                        bot.sendMessage(helper.getChatId(msg), "🙌 Изменения внесены", {
                            parse_mode: 'HTML',
                            disable_web_page_preview: true,
                            reply_markup: {
                                keyboard: keyboard.admin,
                                resize_keyboard: true
                            }

                        })
                    });
                }
                else {
                    toursScheme.updateMany({'sentence.name': allArr.sentence[0].name || 'what'}, {'$set': {
                            'sentence.$.sentence': msg.text
                        }}, function(err) {

                        if (err) {
                            console.log (err, 'row[0].step === countryEditPresenTT');
                        }
                        else {
                            console.log('без ошибок');
                            allArr.sentence[0].sentence = msg.text
                        }

                    });

                    bot.sendMessage(helper.getChatId(msg), "🙌 Изменения внесены", {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                        reply_markup: {
                            keyboard: [
                                [{
                                    text: 'Название предложения',
                                    callback_data: 'countryEditNameT'
                                }],
                                [{
                                    text: 'Изменить описание',
                                    callback_data: 'countryEditInfoT'
                                }],
                                [{
                                    text: 'Изменить презентацию',
                                    callback_data: 'countryEditPresenT'
                                }],
                                [{
                                    text: 'Изменить даты',
                                    callback_data: 'countryEditDate'
                                }],
                                [{
                                    text: 'Изменить предоплату',
                                    callback_data: 'countryEditPreOrder'
                                }],
                                [{
                                    text: '🛒Admin',
                                    callback_data: '🛒Admin'
                                }]
                            ],
                            resize_keyboard: true
                        }

                    });


                    helper.switchState(helper.getChatId(msg), 'editorAllCountryAdT');
                }





            }

            else if (row[0].step === 'countryEditInfoTT') {


                toursScheme.updateMany({'sentence.name': allArr.sentence[0].name}, {'$set': {
                        'sentence.$.typeTourInfo': msg.text
                    }}, function() {

                    allArr.sentence[0].typeTourInfo = msg.text
                });

                bot.sendMessage(helper.getChatId(msg), "🙌 Изменения внесены", {
                    parse_mode: 'HTML',
                    disable_web_page_preview: true,
                    reply_markup: {
                        keyboard: [
                            [{
                                text: 'Название предложения',
                                callback_data: 'countryEditNameT'
                            }],
                            [{
                                text: 'Изменить описание',
                                callback_data: 'countryEditInfoT'
                            }],
                            [{
                                text: 'Изменить презентацию',
                                callback_data: 'countryEditPresenT'
                            }],
                            [{
                                text: 'Изменить даты',
                                callback_data: 'countryEditDate'
                            }],
                            [{
                                text: 'Изменить предоплату',
                                callback_data: 'countryEditPreOrder'
                            }],
                            [{
                                text: '🛒Admin',
                                callback_data: '🛒Admin'
                            }]
                        ],
                        resize_keyboard: true
                    }

                });


                helper.switchState(helper.getChatId(msg), 'editorAllCountryAdT');



            }

            else if (row[0].step === 'countryEditDateTT') {


                if (msg.text === '🛒Admin') {

                }
                else {

                    const str = msg.text;
                    const re = str.split(" ");


                    toursScheme.updateMany({'sentence.name': allArr.sentence[0].name}, {'$set': {
                            'sentence.$.date': re
                        }}, function() {

                        allArr.sentence[0].date = re

                    });

                    bot.sendMessage(helper.getChatId(msg), "🙌 Изменения внесены", {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                        reply_markup: {
                            keyboard: [
                                [{
                                    text: 'Название предложения',
                                    callback_data: 'countryEditNameT'
                                }],
                                [{
                                    text: 'Изменить описание',
                                    callback_data: 'countryEditInfoT'
                                }],
                                [{
                                    text: 'Изменить презентацию',
                                    callback_data: 'countryEditPresenT'
                                }],
                                [{
                                    text: 'Изменить даты',
                                    callback_data: 'countryEditDate'
                                }],
                                [{
                                    text: 'Изменить предоплату',
                                    callback_data: 'countryEditPreOrder'
                                }],
                                [{
                                    text: '🛒Admin',
                                    callback_data: '🛒Admin'
                                }]
                            ],
                            resize_keyboard: true
                        }

                    });


                    helper.switchState(helper.getChatId(msg), 'editorAllCountryAdT');



                }

            }

            else if (row[0].step === 'countryEditPreOrderTT') {


                if (msg.text === '🛒Admin') {
                    allArr = {};
                    newSentence = {};

                    helper.switchState(helper.getChatId(msg), 'v99');

                    helper.resetUserInfo(helper.getChatId(msg), function () {

                        bot.sendMessage(helper.getChatId(msg), "🙌 Изменения внесены", {
                            parse_mode: 'HTML',
                            disable_web_page_preview: true,
                            reply_markup: {
                                keyboard: keyboard.admin,
                                resize_keyboard: true
                            }

                        })
                    });
                }
                else {



                    toursScheme.updateMany({'sentence.name': allArr.sentence[0].name}, {'$set': {
                            'sentence.$.preOrder': msg.text
                        }}, function() {

                        allArr.sentence[0].preOrder = msg.text

                    });

                    bot.sendMessage(helper.getChatId(msg), "🙌 Изменения внесены", {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                        reply_markup: {
                            keyboard: [
                                [{
                                    text: 'Название предложения',
                                    callback_data: 'countryEditNameT'
                                }],
                                [{
                                    text: 'Изменить описание',
                                    callback_data: 'countryEditInfoT'
                                }],
                                [{
                                    text: 'Изменить презентацию',
                                    callback_data: 'countryEditPresenT'
                                }],
                                [{
                                    text: 'Изменить даты',
                                    callback_data: 'countryEditDate'
                                }],
                                [{
                                    text: 'Изменить предоплату',
                                    callback_data: 'countryEditPreOrder'
                                }],
                                [{
                                    text: '🛒Admin',
                                    callback_data: '🛒Admin'
                                }]
                            ],
                            resize_keyboard: true
                        }

                    });


                    helper.switchState(helper.getChatId(msg), 'v2');



                }

            }



            else if (row[0].step === 'sentence') {

                //TODO: admin - сброс

                if (msg.text === '🛒Admin') {
                    allArr = {};
                    newSentence = {};

                    helper.switchState(helper.getChatId(msg), 'v99');

                    helper.resetUserInfo(helper.getChatId(msg), function () {

                        bot.sendMessage(helper.getChatId(msg), "🙌 Изменения внесены", {
                            parse_mode: 'HTML',
                            disable_web_page_preview: true,
                            reply_markup: {
                                keyboard: keyboard.admin,
                                resize_keyboard: true
                            }

                        })
                    });
                }
                else {
                    newSentence.name = msg.text;



                    bot.sendMessage(helper.getChatId(msg), '2️⃣ Добавьте Тип тура,' +
                        'Например: "Package"  "Authors" ', {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                        reply_markup: {
                            keyboard: [
                                [{
                                    text: 'Package'
                                }],
                                [{
                                    text: 'Authors',
                                }],
                                [{
                                    text: '🛒Admin',
                                    callback_data: '🛒Admin'
                                }]
                            ],
                            resize_keyboard: true
                        }

                    });


                    helper.switchState(helper.getChatId(msg), 'editTypeTourAddInfo');
                }




            }

            else if (row[0].step === 'editTypeTourAddInfo') {

                newSentence.typeTour = msg.text;



                bot.sendMessage(helper.getChatId(msg), '3️⃣ Добавьте описание тура,' +
                    'Например: "Это Авторский тур тоси-боси" ', {
                    parse_mode: 'HTML',
                    disable_web_page_preview: true,
                    reply_markup: {
                        keyboard: [
                            [{
                                text: '🛒Admin',
                                callback_data: '🛒Admin'
                            }]
                        ],
                        resize_keyboard: true
                    }

                });


                helper.switchState(helper.getChatId(msg), 'editTypeTour');



            }

            else if (row[0].step === 'editTypeTour') {

                newSentence.typeTourInfo = msg.text;



                bot.sendMessage(helper.getChatId(msg), '4️⃣ Добавьте презентацию,' +
                    'Например: https://telegra.ph/Kak-dobavit-zadanie-v-bot-02-01', {
                    parse_mode: 'HTML',
                    disable_web_page_preview: true,
                    reply_markup: {
                        keyboard: [
                            [{
                                text: '🛒Admin',
                                callback_data: '🛒Admin'
                            }]
                        ],
                        resize_keyboard: true
                    }

                });


                helper.switchState(helper.getChatId(msg), 'editExpeditionPreOrder');



            }

            else if (row[0].step === 'editExpeditionPreOrder') {

                newSentence.sentence = msg.text;

                if (newSentence.typeTour === 'Package') {
                    toursScheme.updateMany({_id: row[0].stepEditor}, {$push: {sentence: newSentence}}, {upsert: false}, function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('OK');
                        }

                        bot.sendMessage(helper.getChatId(msg), "🙌 Изменения внесены", {
                            parse_mode: 'HTML',
                            disable_web_page_preview: true,
                            reply_markup: {
                                keyboard: keyboard.admin,
                                resize_keyboard: true
                            }

                        })
                        helper.switchState(helper.getChatId(msg), 'v98', 'v99');

                        newSentence = {};
                        newSentence.date = [];

                    });


                    helper.switchState(helper.getChatId(msg), 'v4');
                }
                else if (newSentence.typeTour === 'Authors') {
                    bot.sendMessage(helper.getChatId(msg), '5️⃣ Добавьте предоплату в рублях,' +
                        'Например: "25000"', {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                        reply_markup: {
                            keyboard: [
                                [{
                                    text: '🛒Admin',
                                    callback_data: '🛒Admin'
                                }]
                            ],
                            resize_keyboard: true
                        }

                    });


                    helper.switchState(helper.getChatId(msg), 'editExpedition');
                }





            }

            else if (row[0].step === 'editExpedition') {



                newSentence.preOrder = msg.text;

                //попробовать тут


                bot.sendMessage(helper.getChatId(msg), '6️⃣ Введите дату тура' +
                    '\nНапример: 12.02');

                helper.switchState(helper.getChatId(msg), 'dateTour');




            }

            else if (row[0].step === 'add_guide') {


                toursScheme.updateMany({_id: row[0].stepEditor}, {
                    $set: {
                        guide: msg.text
                    }
                }, {upsert: false}, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('OK');
                    }

                    bot.sendMessage(helper.getChatId(msg), '2️⃣ Добавьте описание гайда. \nНапример:' +
                        `<i>
    Чтобы приобрести <code><strong>ТУР</strong>🤖</code> 
    <pre>
    Все очень просто:
    </pre>
    
<code>1️⃣<u> С помощью меню выбираешь - «🛒<strong>Туры</strong>».</u></code>
<code>2️⃣<u> Выбираешь.</u></code>
</i>`, {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                        reply_markup: {
                            resize_keyboard: true
                        }

                    });


                    helper.switchState(helper.getChatId(msg), 'guideInfo');

                    newSentence = {};
                    newSentence.date = [];

                });






            }

            else if (row[0].step === 'guideInfo') {



                toursScheme.updateMany({_id: row[0].stepEditor}, {
                    $set: {
                        guideInfo: msg.text
                    }
                }, {upsert: false}, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('OK');
                    }

                    bot.sendMessage(helper.getChatId(msg), '3️⃣ Добавьте цену гайда в рублях.  \nНапример:' +
                        `<i>
                                <code><u>4000</u></code>
                        </i>`, {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                        reply_markup: {
                            resize_keyboard: true
                        }

                    });


                    helper.switchState(helper.getChatId(msg), 'guidePrice');

                    newSentence = {};
                    newSentence.date = [];

                });




            }


            else if (row[0].step === 'guidePrice') {


                toursScheme.updateMany({_id: row[0].stepEditor}, {
                    $set: {
                        guidePrice: msg.text
                    }
                }, {upsert: false}, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('OK');
                    }

                    bot.sendMessage(helper.getChatId(msg), "🙌 Изменения внесены", {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                        reply_markup: {
                            keyboard: keyboard.admin,
                            resize_keyboard: true
                        }

                    })
                    helper.switchState(helper.getChatId(msg), 'v98', 'v99');

                    newSentence = {};
                    newSentence.date = [];

                });





            }





            else if (row[0].step === 'dateTour') {



                console.log('newSentence',newSentence);
                console.log('newSentence.date',newSentence.date);
                console.log('TYPEOF',typeof newSentence.date);

                newSentence.date.push(msg.text);



                let arrTourDateMore = [
                    [{
                        text: 'Да'
                    }],
                    [{
                        text: 'Нет'
                    }]
                ]

                bot.sendMessage(helper.getChatId(msg), 'Добавить еще даты?', {
                    parse_mode: 'HTML',
                    disable_web_page_preview: true,
                    reply_markup: {
                        keyboard: arrTourDateMore,
                        resize_keyboard: true
                    }

                })


                helper.switchState(helper.getChatId(msg), 'dateTourMore');

            }

            else if (row[0].step === 'dateTourMore') {


                if (msg.text === 'Да') {

                    bot.sendMessage(helper.getChatId(msg), '3️⃣ Дату тура' +
                        '\nНапример: 12.02');

                    helper.switchState(helper.getChatId(msg), 'dateTour');


                } else if (msg.text === 'Нет') {

                    toursScheme.updateMany({_id: row[0].stepEditor}, {$push: {sentence: newSentence}}, {upsert: false}, function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('OK');
                        }

                        bot.sendMessage(helper.getChatId(msg), "🙌 Изменения внесены", {
                            parse_mode: 'HTML',
                            disable_web_page_preview: true,
                            reply_markup: {
                                keyboard: keyboard.admin,
                                resize_keyboard: true
                            }

                        })
                        helper.switchState(helper.getChatId(msg), 'v98', 'v99');

                        newSentence = {};
                        newSentence.date = [];

                    });


                    helper.switchState(helper.getChatId(msg), 'v4');

                }



            }


            // Пополнить баланс
            else if (row[0].step === 'add_funds') {
                if (msg.text.replace(/\s/g, '').length === 0 || isNaN(msg.text)) {

                    bot.sendMessage(
                        helper.getChatId(msg), config.HTML_number_check, {
                            parse_mode: 'HTML',
                            disable_web_page_preview: true,
                        });

                    step = 'add_funds';


                    //(id, step, link, amount, price) сохранил старый зпросили новый посту
                    helper.switchState(helper.getChatId(msg), step);
                }
                else {

                    let numTyp = Number(msg.text);
                    let minAdd = 10;

                    if (numTyp < minAdd) {
                        bot.sendMessage(
                            helper.getChatId(msg), config.HTML_min_amount_check + config.HTML_min_add_funds_check, {
                                parse_mode: 'HTML',
                                disable_web_page_preview: true,
                            });

                        step = 'add_funds';


                        //(id, step, link, amount, price) сохранил старый зпросили новый посту
                        helper.switchState(helper.getChatId(msg), step);

                    }
                    else {
                        let numFondy = Number(msg.text)*100;
                        let payload = helper.getChatId(msg) + Date.now() + 'pay' + numTyp;	// you can use your own payload
                        let step = 'WAIT';
                        //let callback_url = `http://165.227.154.26/callback`;
                        helper.switchState(helper.getChatId(msg), step, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, msg.text, undefined, undefined, undefined, undefined, payload);



                        const merchant_data = JSON.stringify([{
                            chat_id: `${helper.getChatId(msg)}`,
                        }]);

                        let creatSig = `${process.env.Fondy_secretKey}|${numFondy}|RUB|${process.env.Fondy_merchantId}|Mixtripbot|${payload}`;

                        let signature = sha1(creatSig);


                        const requestData = {
                            order_id: payload,
                            order_desc: 'Mixtripbot',
                            currency: 'RUB',
                            amount: numFondy,
                            server_callback_url: `http://165.227.154.26/callback`,
                            signature: signature,
                            response_url: `https://t.me/Mixtripbot`,
                            merchant_data: merchant_data,
                        };


                        const fondy = new CloudIpsp(
                            {
                                merchantId: process.env.Fondy_merchantId,
                                secretKey: process.env.Fondy_secretKey
                            }
                        );

                        fondy.Checkout(requestData).then(data => {


                            let payBut = [
                                [
                                    {
                                        text: '✅Пополнить',
                                        callback_data: 'add_funds',
                                        url: `${data.checkout_url}`
                                    }
                                ],
                                [
                                    {
                                        text: '❌Отмена',
                                        callback_data: 'cancel'
                                    }
                                ]
                            ];

                            bot.sendMessage(helper.getChatId(msg), config.HTML_min_add_funds_button + `<strong>${numTyp}</strong>₽  \nПерейдите со ссылке👇👇👇`, {
                                parse_mode: 'HTML',
                                reply_markup: {
                                    inline_keyboard: payBut,
                                    resize_keyboard: true
                                }

                            })
                        }).catch((error) => {
                            console.log(error)
                        });



                    }


                }
            }


            // для адиина кнопки
            else if (msg.text === '🛒Admin' && helper.getChatId(msg).toString() === process.env.Admin_ID || msg.text === '🛒Admin' && helper.getChatId(msg).toString() === process.env.Dev_ID) {
                allArr = {};

                helper.switchState(helper.getChatId(msg), 'v99');

                helper.resetUserInfo(helper.getChatId(msg), function () {

                    bot.sendMessage(helper.getChatId(msg), "🙌 Изменения внесены", {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                        reply_markup: {
                            keyboard: keyboard.admin,
                            resize_keyboard: true
                        }

                    })
                });

            }
            else if (msg.text === '👥How many users' && helper.getChatId(msg).toString() === process.env.Admin_ID || msg.text === '👥How many users' && helper.getChatId(msg).toString() === process.env.Dev_ID) {

                helper.all_user(function (row) {
                    bot.sendMessage(msg.chat.id, `☁️ Зарегистрировано: ${row}`, {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                        reply_markup: {
                            keyboard: keyboard.admin,
                            resize_keyboard: true
                        }

                    })
                })
            }
            else if (msg.text === '📊All Status' && helper.getChatId(msg).toString() === process.env.Admin_ID || msg.text === '📊All Status' && helper.getChatId(msg).toString() === process.env.Dev_ID) {

                bot.sendMessage(helper.getChatId(msg), '🙌 Процесс запущен! ☁️');

                let memory_ub;
                let cpu_ub;


                microstats.on('memory', function (value) {
                    console.log('MEMORY:', value);

                    memory_ub = `
            
            ☁️ usedpct: ${value.usedpct}
            ☁️ total: ${value.total}
            ☁️ free: ${value.free}`;

                });

                microstats.on('cpu', function (value) {
                    console.log('CPU:', value);

                    cpu_ub = `
            
            ☁️ loadpct: ${value.loadpct}
            ☁️ userpct: ${value.userpct}
            ☁️ syspct: ${value.syspct}
            ☁️ idlepct: ${value.idlepct}`;

                });


                //«один раз»: проверит всю статистику, сообщит текущие числа и остановится.
                let options1 = {frequency: 'once'};

                let optionsArray = [options1];
                optionsArray.forEach(function (options) {
                    console.log('---Testing options:', options, '---');
                    microstats.start(options, function (err) {
                        if (err) console.log(err);
                    });

                    setTimeout(function () {

                        bot.sendMessage(
                            msg.chat.id, `
            ☁️--- CPU ---
            
            ${cpu_ub}
            
            
☁️--- MEMORY ---
            
            ${memory_ub}
            
            `, {
                                reply_markup: {}
                            });

                        microstats.stop();
                    }, 10000);
                });


            }
            else if (msg.text === '📣Announcement' && helper.getChatId(msg).toString() === process.env.Admin_ID || msg.text === '📣Announcement' && helper.getChatId(msg).toString() === process.env.Dev_ID) {

                bot.sendMessage(helper.getChatId(msg), '🙌 Введите сообщение ☁️');

                helper.switchState(helper.getChatId(msg), 'Announcement');


            }
            else if (row[0].step === 'Announcement') {

                let Announcement = msg.text;

                helper.announcement(function (row) {

                    for (let i = 0; i < row.length; i++) {

                        bot.sendMessage(row[i].id, Announcement, {
                            parse_mode: 'HTML',
                            disable_web_page_preview: true,
                        });
                    }
                    helper.switchState(helper.getChatId(msg), 'admin');


                });


            }
            else if (msg.text === '📢Announcement Preview' && helper.getChatId(msg).toString() === process.env.Admin_ID || msg.text === '📢Announcement Preview' && helper.getChatId(msg).toString() === process.env.Dev_ID) {

                bot.sendMessage(helper.getChatId(msg), '🙌 Введите сообщение для предпросмотра☁️');

                helper.switchState(helper.getChatId(msg), 'Announcement_preview');


            }
            else if (msg.text === '📢Рефералы' && helper.getChatId(msg).toString() === process.env.Admin_ID || msg.text === '📢Рефералы' && helper.getChatId(msg).toString() === process.env.Dev_ID) {

                bot.sendMessage(helper.getChatId(msg), '🙌 Введите рефералку ☁️');

                helper.switchState(helper.getChatId(msg), 'refarr');


            }
            else if (msg.text === '📢Очистить рефералку' && helper.getChatId(msg).toString() === process.env.Admin_ID || msg.text === '📢Очистить рефералку' && helper.getChatId(msg).toString() === process.env.Dev_ID) {

                bot.sendMessage(helper.getChatId(msg), '🙌 Введите рефералку ☁️');

                helper.switchState(helper.getChatId(msg), 'refarrCle');


            }
            else if (row[0].step === 'refarr') {


                helper.refArr(msg.text, function (row) {


                   // let texti = [];

                    async function processArray() {

                        if (row.length === 0) {
                            bot.sendMessage(msg.chat.id, `Еще не привел друзей 🙁`
                                , {
                                    parse_mode: 'HTML',
                                    disable_web_page_preview: true,
                                    reply_markup: {
                                        resize_keyboard: true
                                    }

                                });
                        }
                        else {

                            function delay() {
                                return new Promise(resolve => setTimeout(resolve, 1000));
                            }

                            async function delayedLog(item) {
                                // мы можем использовать await для Promise
                                // который возвращается из delay
                                for (const items of item) {

                                    if (items.typeTour) {
                                        bot.sendMessage(
                                            msg.chat.id, `
<code>Забронированный тур</code>

<strong>Страна</strong>: ${items.direction}
<strong>Тур</strong>: ${items.nameTour}
<strong>Тип тура</strong>: ${items.typeTour}
<strong>Дата</strong>: ${items.date}
<strong>Предоплата</strong>: ${items.preOrder} руб



                                    `, {
                                                parse_mode: 'HTML',
                                            });
                                        await delay();

                                    }
                                    else {
                                        bot.sendMessage(
                                            msg.chat.id, `
<code>Приобритен гайд</code>

<strong>Страна</strong>: ${items.direction},
<strong>Цена</strong>: ${items.guidePrice} руб.,


                                    `, {
                                                parse_mode: 'HTML',
                                            });
                                        await delay();

                                    }


                                }




                            }

                            async function processArray(array) {
                                let aC = 0;
                                let bC = 0;

                                for (const item of array) {

                                    if (item.userOrder_t.length === 0) {
                                        aC = 1;
                                    }
                                    else {
                                        bC = 1;
                                        await delayedLog(item.userOrder_t);
                                    }


                                }
                                console.log('Done!');

                                if (aC === 1 && bC === 0 ) {
                                    bot.sendMessage(
                                        msg.chat.id, `
Привел: <code>${row.length}</code>`, {
                                            parse_mode: 'HTML',
                                        });
                                }
                                else if (aC === 1 && bC === 1) {
                                    bot.sendMessage(
                                        msg.chat.id, `
<code>Done!</code>`, {
                                            parse_mode: 'HTML',
                                        });
                                }
                                else if (aC === 0 && bC === 1) {
                                    bot.sendMessage(
                                        msg.chat.id, `
<code>Done!</code>`, {
                                            parse_mode: 'HTML',
                                        });
                                }


                            }

                            processArray(row);

                        }

                    }
                    processArray();

                    step = 'clientRefs_';
                    previous_step = 'Профиль_';
                    helper.switchState(msg.chat.id, step, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, previous_step);


                });
            }

            else if (row[0].step === 'refarrCle') {

                console.log('111',msg.text);
                userScheme.updateMany({ref: msg.text}, {
                    $set: {
                        userOrder_t: []
                    }
                }, {upsert: false}, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('OK');
                        bot.sendMessage(
                            msg.chat.id, `
<code>Успешно удалили</code>




                                    `, {
                                parse_mode: 'HTML',
                            });
                        helper.switchState(helper.getChatId(msg), 'v82');

                    }
                });


            }
            else if (row[0].step === 'Announcement_preview') {

                bot.sendMessage(process.env.Admin_ID, `${msg.text}`, {
                    parse_mode: 'HTML',
                    disable_web_page_preview: true,
                });
                bot.sendMessage(process.env.Dev_ID, `${msg.text}`, {
                    parse_mode: 'HTML',
                    disable_web_page_preview: true,
                });

                helper.switchState(helper.getChatId(msg), 'admin');

            }
        }

    }, msg.text, msg.from.first_name);


});

bot.on("contact",msg =>{


    helper.userCheck(msg.chat.id, function (row) {

        helper.arrTour(row[0].id, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, msg.contact.phone_number,function () {

        })

        if (row[0].typeTour === 'Package') {

            bot.sendMessage(msg.chat.id, `Спасибо ${msg.contact.first_name}! ❗️Ваша презентация: \n${row[0].presentation}`, {
                parse_mode: 'HTML',
                reply_markup: {
                    keyboard: keyboard.homepage,
                    resize_keyboard: true
                }

            }).then(setTimeout(() => {
                bot.sendMessage(msg.chat.id, '☁️Выберите нужный Вам раздел ниже:', {
                    reply_markup: {
                        inline_keyboard: kb.homepage
                    }
                })
            }, 700))
            bot.sendMessage(process.env.Admin_ID, `☁️ Серверное сообщение:
                 
Поделился номером: ${msg.contact.first_name},
Номер Телефона: <code><strong>${msg.contact.phone_number}</strong></code>,

                       
Интересует: 
    Страна: ${row[0].direction}
    Тур: ${row[0].nameTour}
    Тип тура: ${row[0].typeTour}
    Дата: ${row[0].date}
    Кол-во людей: ${row[0].people}
    Дети: ${row[0].children}
    Рассматривают дней: ${row[0].days}
    
                       
                        
                        `,{
                parse_mode: 'HTML',
                disable_web_page_preview: true,
            });
            bot.sendMessage(process.env.Dev_ID, `☁️ Серверное сообщение:
                 
Поделился номером: ${msg.contact.first_name},
Номер Телефона: <code><strong>${msg.contact.phone_number}</strong></code>,

                       
Интересует: 
    Страна: ${row[0].direction}
    Тур: ${row[0].nameTour}
    Тип тура: ${row[0].typeTour}
    Дата: ${row[0].date}
    Кол-во людей: ${row[0].people}
    Дети: ${row[0].children}
    Рассматривают дней: ${row[0].days}
    
                       
                        
                        `,{
                parse_mode: 'HTML',
                disable_web_page_preview: true,
            });

            helper.switchState(msg.chat.id, 'v100');

        }
        else if (row[0].typeTour === 'Authors') {

            //helper.interestedTourTmp(msg.chat.id, row[0].userSelectedTour[0]);
            //helper.selectedTourClear(msg.chat.id, msg.contact.phone_number)

            bot.sendMessage(msg.chat.id, `Спасибо ${msg.contact.first_name}! ❗️Ваша презентация: \n${row[0].presentation}`, {
                parse_mode: 'HTML',
                reply_markup: {
                    keyboard: keyboard.homepage,
                    resize_keyboard: true
                }

            }).then(setTimeout(() => {
                bot.sendMessage(msg.chat.id, `Вы можете Забронировать тур или задать вопрос организатору`, {
                    parse_mode: 'HTML',
                    disable_web_page_preview: true,
                    reply_markup: {
                        inline_keyboard: [
                            [{
                                text: 'Забронировать тур',
                                callback_data: 'book_a_tour'
                            }],
                            [{
                                text: 'Задать вопрос организатору',
                                url: "https://t.me/mixtripsupport"
                            }],
                            [{
                                text: '↩️На главную',
                                callback_data: 'На главную'
                            }]
                        ],
                        resize_keyboard: true
                    }

                })
            }, 700))
            bot.sendMessage(process.env.Admin_ID, `☁️ Серверное сообщение:
                 
Поделился номером: ${msg.contact.first_name},
Номер Телефона: <code><strong>${msg.contact.phone_number}</strong></code>,

                       
Интересует: 
    Страна: ${row[0].direction}
    Тур: ${row[0].nameTour}
    Тип тура: ${row[0].typeTour}
    Дата: ${row[0].date}
                       
                        
                        `,{
                parse_mode: 'HTML',
                disable_web_page_preview: true,
            });
            bot.sendMessage(process.env.Dev_ID, `☁️ Серверное сообщение:
                 
Поделился номером: ${msg.contact.first_name},
Номер Телефона: <code><strong>${msg.contact.phone_number}</strong></code>,

                       
Интересует: 
    Страна: ${row[0].direction}
    Тур: ${row[0].nameTour}
    Тип тура: ${row[0].typeTour}
    Дата: ${row[0].date}
                       
                        
                        `,{
                parse_mode: 'HTML',
                disable_web_page_preview: true,
            });

            helper.switchState(msg.chat.id, 'v100');
        }



    });


})

bot.on('callback_query', msg => {

    const {chat, message_id, text} = msg.message;

    let step;
    let previous_step;

    if (msg.data === 'pay_guide') {

        helper.userCheck(chat.id, function (row) {

            helper.template_general(chat.id,message_id,[],'💡️ Услуга успешно оплачена. \n🔭Ваш гайд: \n'+ `<i>${row[0].guide}</i>`  , function (text, opts) {
                bot.editMessageText(text, opts).then(setTimeout(() => {
                    bot.sendMessage(chat.id, '☁️Выберите нужный Вам раздел ниже:', {
                        reply_markup: {
                            inline_keyboard: kb.homepage
                        }
                    })
                }, 700));

            });


            console.log('pay');



            console.log('balance -> ', row[0].balance);
            console.log('sum -> ', row[0].guidePrice);

            let new_balance = (row[0].balance - row[0].guidePrice).toFixed(2);
            console.log('new_balance', new_balance);
            //записываем новый баланс и сохраняем в истоию
            helper.balance_man(chat.id, new_balance, function (rowz) {
                console.log('balance_man row', rowz);

                //TODO: проверять на реф, если нету рефа тогда не записать в доп массив userOrder_t


                console.log(row[0].ref, 'REFFF');
                if (row[0].ref) {
                    let orderidarr = [];

                    orderidarr.push({
                        'direction': row[0].direction,
                        'guide': row[0].guide,
                        'guidePrice': row[0].guidePrice,

                    });
                    userScheme.updateMany({id: chat.id }, { $push: { userOrder: orderidarr, userOrder_t:orderidarr}}, function (err) {
                        console.log('err', err)
                    });

                }
                else {
                    let orderidarr = [];

                    orderidarr.push({
                        'direction': row[0].direction,
                        'guide': row[0].guide,
                        'guidePrice': row[0].guidePrice,

                    });
                    userScheme.updateMany({id: chat.id }, { $push: { userOrder: orderidarr}}, function (err) {
                        console.log('err', err)
                    });

                }

                bot.sendMessage(process.env.Admin_ID, `☁️ Серверное сообщение:
                 
Имя: ${row[0].name},
Номер: <code><strong>${row[0].phone}</strong></code>,

                       
Купил гайд: 
    Страна: ${row[0].direction}
    Цена гайда: ${row[0].guidePrice}руб
  
                   

                        `,{
                    parse_mode: 'HTML',
                    disable_web_page_preview: true,
                });
                bot.sendMessage(process.env.Dev_ID, `☁️ Серверное сообщение:
                 
Имя: ${row[0].name},
Номер: <code><strong>${row[0].phone}</strong></code>,

                       
Купил гайд: 
    Страна: ${row[0].direction}
    Цена гайда: ${row[0].guidePrice}руб
    
                        `,{
                    parse_mode: 'HTML',
                    disable_web_page_preview: true,
                });


            });


        });

        helper.resetUserInfo(chat.id, function (row) {
        });

    }
    if (msg.data === 'pay') {
        helper.template_general(chat.id,message_id,undefined,'☁️ Услуга успешно оплачена !', function (text, opts) {
            bot.editMessageText(text, opts).then(setTimeout(() => {
                bot.sendMessage(chat.id, '☁️Выберите нужный Вам раздел ниже:', {
                    reply_markup: {
                        inline_keyboard: kb.homepage
                    }
                })
            }, 700));

        });

        helper.userCheck(chat.id, function (rows) {

            let new_balance = (rows[0].balance - rows[0].price).toFixed(2);
            //записываем новый баланс и сохраняем в истоию
            helper.balance_man(chat.id, new_balance, function () {

                let orderidarr = [];

                orderidarr.push({
                    'direction': rows[0].direction,
                    'preOrder': rows[0].price,
                    'nameTour': rows[0].nameTour,
                    'typeTour': rows[0].typeTour,
                    'presentation': rows[0].presentation,
                    'date': rows[0].date,
                });
                if (rows[0].ref) {
                    userScheme.updateMany({id: chat.id }, { $push: { userSelectedTour: orderidarr, userOrder_t:orderidarr}}, function (err) {
                        console.log('err', err)
                    });
                }
                else {
                    userScheme.updateMany({id: chat.id }, { $push: { userSelectedTour: orderidarr}}, function (err) {
                        console.log('err', err)
                    });
                }
                bot.sendMessage(process.env.Admin_ID, `☁️ Серверное сообщение:
                 
Имя: ${rows[0].name},
Номер: <code><strong>${rows[0].phone}</strong></code>,

                       
Забронировал Тур: 
    Страна: ${rows[0].direction}
    Тур: ${rows[0].nameTour}
    Тип тура: ${rows[0].typeTour}
    Дата: ${rows[0].date}

                   
    Внес предоплату:${rows[0].price}руб

                        `,{
                    parse_mode: 'HTML',
                    disable_web_page_preview: true,
                });
                bot.sendMessage(process.env.Dev_ID, `☁️ Серверное сообщение:
                 
Имя: ${rows[0].name},
Номер: <code><strong>${rows[0].phone}</strong></code>,

                       
Забронировал Тур: 
    Страна: ${rows[0].direction}
    Тур: ${rows[0].nameTour}
    Тип тура: ${rows[0].typeTour}
    Дата: ${rows[0].date}
   
    
    Внес предоплату:${rows[0].price}руб
    
                        `,{
                    parse_mode: 'HTML',
                    disable_web_page_preview: true,
                });







            });
        });

    }
    else if (msg.data === 'CreateRef') {

        helper.template_general(chat.id,message_id,kb.create_ref,`☁️<code> <b>Поделитесь ссылкой со своими друзьями и зарабатывайте 10% с каждой покупки друга!\n</b></code>
☁️ <b>Заработанную сумму Вы сможете потратить на раскрутку Вашей группы, аккаунта или канала либо вывести на электронный кошелёк, вывод может занимать до 72 часов😉</b>`, function (text, opts) {
            bot.editMessageText(text, opts);

        });

        step = 'CreateRef';
        previous_step = 'Профиль_';
        helper.switchState(chat.id, step, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, previous_step);

    }
    else if (msg.data === 'clientRefs') {

        helper.refArr(chat.id, function (row) {


            //let texti = [];

            async function processArray() {

                if (row.length === 0) {
                    helper.template_general(chat.id,message_id,kb.back,`Вы еще не привели друзей 🙁`, function (text, opts) {
                        bot.editMessageText(text, opts);

                    });
                } else {

                    function delay() {
                        return new Promise(resolve => setTimeout(resolve, 1000));
                    }

                    async function delayedLog(item) {
                        // мы можем использовать await для Promise
                        // который возвращается из delay
                        for (const items of item) {

                            if (items.typeTour) {
                                bot.sendMessage(
                                    chat.id, `
<code>Забронированный тур</code>

<strong>Страна</strong>: ${items.direction}
<strong>Тур</strong>: ${items.nameTour}
<strong>Тип тура</strong>: ${items.typeTour}
<strong>Дата</strong>: ${items.date}
<strong>Предоплата</strong>: ${items.preOrder} руб



                                    `, {
                                        parse_mode: 'HTML',
                                    });
                                await delay();

                            }
                            else {
                                bot.sendMessage(
                                    chat.id, `
<code>Приобритен гайд</code>

<strong>Страна</strong>: ${items.direction},
<strong>Цена</strong>: ${items.guidePrice} руб.,


                                    `, {
                                        parse_mode: 'HTML',
                                    });
                                await delay();

                            }


                        }




                    }

                    async function processArray(array) {
                        let aC = 0;
                        let bC = 0;

                        for (const item of array) {

                            if (item.userOrder_t.length === 0) {
                                aC = 1;
                            }
                            else {
                                bC = 1;
                                await delayedLog(item.userOrder_t);
                            }


                        }
                        console.log('Done!');

                        if (aC === 1 && bC === 0 ) {
                            bot.sendMessage(
                                chat.id, `
Вы привели: <code>${row.length}</code>`, {
                                    parse_mode: 'HTML',
                                });
                        }
                        else if (aC === 1 && bC === 1) {
                            bot.sendMessage(
                                chat.id, `
<code>Done!</code>`, {
                                    parse_mode: 'HTML',
                                });
                        }
                        else if (aC === 0 && bC === 1) {
                            bot.sendMessage(
                                chat.id, `
<code>Done!</code>`, {
                                    parse_mode: 'HTML',
                                });
                        }


                    }

                    processArray(row);

                }

            }
            processArray();

            step = 'clientRefs_';
            previous_step = 'Профиль_';
            helper.switchState(chat.id, step, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, previous_step);


        });
    }
    else if (msg.data === 'takeRef') {

        let linkRef = `https://t.me/Mixtripbot?start=${chat.id}`;

        helper.template_general(chat.id,message_id,kb.back,`☁️ Твоя ссылка:\n ${linkRef} `, function (text, opts) {
            bot.editMessageText(text, opts);

        });

        bot.sendMessage(process.env.Admin_ID, `<code>☁️ Серверное сообщение:
Создана рефералка
👤 <i>${linkRef}</i>
                </code>`,{
            parse_mode: 'HTML',
            disable_web_page_preview: true,
        });
        bot.sendMessage(process.env.Dev_ID, `<code>☁️ Серверное сообщение:
Создана рефералка
👤 <i>${linkRef}</i>
                </code>`,{
            parse_mode: 'HTML',
            disable_web_page_preview: true,
        });

        step = 'takeRef';
        previous_step = 'CreateRef_';
        helper.switchState(chat.id, step, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, previous_step);

    }
    else if (msg.data === 'back') {
        helper.userCheck(chat.id, function (row) {

            if (row[0].previous_step === 'Главное меню') {

                helper.template_general(chat.id, message_id, kb.homepage, `☁️Выберите нужный Вам раздел ниже:`, function (text, opts) {
                    bot.editMessageText(text, opts);

                });

                helper.resetUserInfo(chat.id, function (row) {
                });

            }

            if (row[0].previous_step === 'tours') {


                helper.loadButton(function (row) {
                    let newRow = row;

                    newRow.push([{
                        text: '↩️На главную',
                        callback_data: 'На главную'
                    }]);

                    helper.template_general(chat.id, message_id, newRow, config.tours_description, function (text, opts) {
                        bot.editMessageText(text, opts);

                    });

                    step = 'tours';
                    previous_step = 'Главное меню';
                    helper.switchState(chat.id, step, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, previous_step);



                });

            }

            if (row[0].previous_step === 'selectedCountry') {


                toursScheme.find({btnName: row[0].stepEditor}, function (err, rows) {


                    if (err) {
                        console.log(err)
                    }

                    else {


                        if (rows[0].typeTour === 'Authors') {

                        }

                        else if (rows[0].typeTour === 'Package') {

                        }

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

                        helper.template_general(chat.id,message_id, kbForCountry,'☁️ Выберите нужный Вам раздел ниже:', function (text, opts) {
                            bot.editMessageText(text, opts);

                        });

                        helper.switchState(chat.id, 'selectedCountry', undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'tours');


                    }


                });

            }

            if (row[0].previous_step === 'Профиль_') {


                userScheme.find({id: msg.from.id}, function (err, rows) {
                    if (err) {
                        console.log(err)
                    } else {

                        helper.template_general(chat.id,message_id,kb.profile,`<b>💰Баланс - ${rows[0].balance} руб.\n</b>` +
                            `<b>Ваш ID - ${chat.id}</b>`, function (text, opts) {
                            bot.editMessageText(text, opts);

                        });


                    }
                });


                helper.resetUserInfo(chat.id, function (row) {
                });

            }

            if (row[0].previous_step === 'Faq_') {


                helper.template_general(chat.id, message_id, kb.help, '⁉️️Помощь:', function (text, opts) {
                    bot.editMessageText(text, opts);

                });

                helper.resetUserInfo(chat.id, function (row) {
                });

            }

            if (row[0].previous_step === 'CreateRef_') {


                helper.template_general(chat.id,message_id,kb.create_ref,`☁️<code> <b>Поделитесь ссылкой со своими друзьями и зарабатывайте 10% с каждой покупки друга!\n</b></code>
☁️ <b>Заработанную сумму Вы сможете потратить на раскрутку Вашей группы, аккаунта или канала либо вывести на электронный кошелёк, вывод может занимать до 72 часов😉</b>`, function (text, opts) {
                    bot.editMessageText(text, opts);

                });

                helper.resetUserInfo(chat.id, function (row) {
                });

            }

            if (row[0].previous_step === 'История заказов_') {


                helper.userCheck(msg.from.id, function (row) {


                    if (row[0].userOrder.length === 0) {

                        /**
                        const opts = {
                            chat_id: chat.id,
                            message_id: message_id,
                            parse_mode: 'HTML',
                            disable_web_page_preview: true,
                            reply_markup: JSON.stringify({
                                inline_keyboard: kb.back

                            })

                        };
                        **/
                        helper.template_general(chat.id, message_id, kb.taskbutton, `<b>☁️История заказов:\n</b>`, function (text, opts) {
                            bot.editMessageText(text, opts);

                        });
                    }
                    else {

                        //TODO: выводить активные задания


                    }

                    step = 'История заказов_';
                    previous_step = 'Профиль_';
                    helper.switchState(chat.id, step, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, previous_step);
                });


                helper.resetUserInfo(chat.id, function (row) {
                });

            }



        })

    }
    else if (msg.data === 'cancel') {
        helper.resetUserInfo(chat.id, function (row) {
        });

        helper.template_general(chat.id, message_id, kb.homepage, '☁️Выберите нужный Вам раздел ниже:', function (text, opts) {
            bot.editMessageText(text, opts);

        });


    }
    else if (msg.data === 'профиль') {
        userScheme.find({id: msg.from.id}, function (err, rows) {
            if (err) {
                console.log(err)
            } else {

                helper.template_general(chat.id,message_id,kb.profile,`<b>💰Баланс - ${rows[0].balance} руб.\n</b>` +
                    `<b>Ваш ID - ${chat.id}</b>`, function (text, opts) {
                    bot.editMessageText(text, opts);

                });


            }
        });

        step = 'Профиль_';
        previous_step = 'Главное меню';
        helper.switchState(chat.id, step, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, previous_step);


    }
    else if (msg.data === 'book_a_tour') {


        helper.userCheck(chat.id, function (row) {


            //TODO: Чтобы забронировать тур нужно внести предоплату в размере


            if (row[0].balance >= row[0].price) {

                helper.template_general(chat.id,message_id,kb.pay,`
<strong>Чтобы забронировать тур нужно внести предоплату в размере: \n${row[0].price} руб.</strong>

    Страна: ${row[0].direction}
    Тур: ${row[0].nameTour}
    Тип тура: ${row[0].typeTour}
    Дата: ${row[0].date}

К оплате: <code>${row[0].price} руб.</code>

Баланс: <code>${row[0].balance} руб.</code>

Проверьте и подтвердите заказ:⬇️`, function (text, opts) {
                    bot.editMessageText(text, opts);

                });



            }
            else {

                //РАЗДЕОИТЬ ПАКЕТНЫЙ И АВТОРСКИЙ
                if (row[0].typeTour === 'Authors') {

                    helper.template_general(chat.id,message_id,kb.add_funds,`
<strong>Чтобы забронировать тур нужно внести предоплату в размере: \n${row[0].price} руб.</strong>

    Страна: ${row[0].direction}
    Тур: ${row[0].nameTour}
    Тип тура: ${row[0].typeTour}
    Дата: ${row[0].date}

К оплате: <code>${row[0].price} руб.</code>

Баланс: <code>${row[0].balance} руб.</code>
            
            У Вас недостаточно денег для выполнения заказа:⬇️`, function (text, opts) {
                        bot.editMessageText(text, opts);

                    });

                }
                else if (row[0].typeTour === 'Package') {
                    helper.template_general(chat.id,message_id,kb.add_funds,`

<strong>Чтобы забронировать тур нужно внести предоплату в размере: \n${row[0].price} руб.</strong>

    Страна: ${row[0].direction}
    Тур: ${row[0].nameTour}
    Тип тура: ${row[0].typeTour}
    Дата: ${row[0].date}
    Кол-во людей: ${row[0].people}
    Дети: ${row[0].children}
    Рассматривают дней: ${row[0].days}

К оплате: <code>${row[0].price} руб.</code>

Баланс: <code>${row[0].balance} руб.</code>
            
У Вас недостаточно денег для выполнения заказа:⬇️`, function (text, opts) {
                        bot.editMessageText(text, opts);

                    });
                }


            }
        })




    }
    else if (msg.data === 'book_a_event') {


        helper.userCheck(chat.id, function (row) {
            if (row[0].social) {

                bot.sendMessage(process.env.Admin_ID, `☁️ Серверное сообщение:
                 
Имя: ${row[0].name},
Соц. сеть: <code><strong>${row[0].social}</strong></code>,

                       
Забронировал Мероприятие: 
        ${text}

                       
                        
                        `,{
                    parse_mode: 'HTML',
                    disable_web_page_preview: true,
                });
                bot.sendMessage(process.env.Dev_ID, `☁️ Серверное сообщение:
                 
Имя: ${row[0].name},
Соц. сеть: <code><strong>${row[0].social}</strong></code>,

                       
Забронировал Мероприятие: 
        ${text}
                       
                        
                        `,{
                    parse_mode: 'HTML',
                    disable_web_page_preview: true,
                });


            }
            else {
                helper.template_general(chat.id, message_id, undefined, 'Чтобы забронировать мероприятие, поделитесь вашей социальной сетью. \nНапример: instagram, facebook, vkontakte ', function (text, opts) {
                    bot.editMessageText(text, opts);

                });

                userScheme.updateMany({id: chat.id}, {
                    $set: {
                        step: 'shareSocial',
                        task: text,
                    }
                }, {upsert: false}, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('OK');
                    }
                });
            }
        })





    }
    else if (msg.data === 'book_a_businessCamp') {


        helper.userCheck(chat.id, function (row) {
            if (row[0].social) {

                bot.sendMessage(process.env.Admin_ID, `☁️ Серверное сообщение:
                 
Имя: ${row[0].name},
Соц. сеть: <code><strong>${row[0].social}</strong></code>,

                       
Забронировал Business Camp: 
        ${text}

                       
                        
                        `,{
                    parse_mode: 'HTML',
                    disable_web_page_preview: true,
                });
                bot.sendMessage(process.env.Dev_ID, `☁️ Серверное сообщение:
                 
Имя: ${row[0].name},
Соц. сеть: <code><strong>${row[0].social}</strong></code>,

                       
Забронировал Business Camp: 
        ${text}
                       
                        
                        `,{
                    parse_mode: 'HTML',
                    disable_web_page_preview: true,
                });


            }
            else {
                helper.template_general(chat.id, message_id, undefined, 'Чтобы забронировать мероприятие, поделитесь вашей социальной сетью. \nНапример: instagram, facebook, vkontakte ', function (text, opts) {
                    bot.editMessageText(text, opts);

                });

                userScheme.updateMany({id: chat.id}, {
                    $set: {
                        step: 'shareSocialB',
                        task: text,
                    }
                }, {upsert: false}, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('OK');
                    }
                });
            }
        })





    }
    else if (msg.data === 'faq') {

        helper.template_general(chat.id, message_id, kb.help, '⁉️️Помощь:', function (text, opts) {
            bot.editMessageText(text, opts);

        });

        step = 'faq';
        previous_step = 'Главное меню';
        helper.switchState(chat.id, step, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, previous_step);



    }
    else if (msg.data === 'events') {

        //TODO: если есть мероприятия и если нету

        eventScheme.find({}, function (err, rows) {
            if (err) {
                console.log(err)
            }

            else {


                if (rows.length === 0) {
                    helper.template_general(chat.id, message_id, kb.back, 'На данный момент мероприятий нет!', function (text, opts) {
                        bot.editMessageText(text, opts);

                    });

                    step = 'viewsAllEvents';
                    previous_step = 'Главное меню';
                    helper.switchState(chat.id, step, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, previous_step);


                }
                else if (rows.length === 1) {
                    eventScheme.find({}, function (err, rows) {


                        for (let i = 0; i < rows.length; i++) {
/////
                            helper.template_general(chat.id, message_id, [
                                [{
                                    text: 'Забронировать Мероприятие',
                                    callback_data: 'book_a_event'
                                }],
                                [{
                                    text: 'Задать вопрос организатору',
                                    url: "https://t.me/mixtripsupport"
                                }],
                                [{
                                    text: '↩️На главную',
                                    callback_data: 'На главную'
                                }]
                            ], rows[i].info, function (text, opts) {
                                bot.editMessageText(text, opts);

                            });


                        }

                    });



                }
                else {
                    eventScheme.find({}, function (err, rows) {



                        for (let i = 0; i < rows.length; i++) {

                            bot.sendMessage(chat.id, rows[i].info, {
                                parse_mode: 'HTML',
                                reply_markup: {
                                    inline_keyboard: [
                                        [{
                                            text: 'Забронировать Мероприятие',
                                            callback_data: 'book_a_event'
                                        }],
                                        [{
                                            text: 'Задать вопрос организатору',
                                            url: "https://t.me/mixtripsupport"
                                        }],
                                        [{
                                            text: '↩️На главную',
                                            callback_data: 'На главную'
                                        }]
                                    ],
                                    resize_keyboard: true
                                }

                            })

                        }

                    });



                }

            }


        });



    }
    else if (msg.data === 'Business_Camp') {
        businessCampScheme.find({}, function (err, rows) {
            if (err) {
                console.log(err)
            }

            else {


                if (rows.length === 0) {
                    helper.template_general(chat.id, message_id, kb.back, 'На данный момент Business Camp нет!', function (text, opts) {
                        bot.editMessageText(text, opts);

                    });

                    step = 'viewsAllbusinessCamp';
                    previous_step = 'Главное меню';
                    helper.switchState(chat.id, step, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, previous_step);


                }
                else if (rows.length === 1) {
                    businessCampScheme.find({}, function (err, rows) {


                        for (let i = 0; i < rows.length; i++) {
/////
                            helper.template_general(chat.id, message_id, [
                                [{
                                    text: 'Забронировать Business Camp',
                                    callback_data: 'book_a_businessCamp'
                                }],
                                [{
                                    text: 'Задать вопрос организатору',
                                    url: "https://t.me/mixtripsupport"
                                }],
                                [{
                                    text: '↩️На главную',
                                    callback_data: 'На главную'
                                }]
                            ], rows[i].info, function (text, opts) {
                                bot.editMessageText(text, opts);

                            });


                        }

                    });



                }
                else {
                    businessCampScheme.find({}, function (err, rows) {


                        for (let i = 0; i < rows.length; i++) {

                            bot.sendMessage(chat.id, rows[i].info, {
                                parse_mode: 'HTML',
                                reply_markup: {
                                    inline_keyboard: [
                                        [{
                                            text: 'Забронировать Мероприятие',
                                            callback_data: 'book_a_businessCamp'
                                        }],
                                        [{
                                            text: 'Задать вопрос организатору',
                                            url: "https://t.me/mixtripsupport"
                                        }],
                                        [{
                                            text: '↩️На главную',
                                            callback_data: 'На главную'
                                        }]
                                    ],
                                    resize_keyboard: true
                                }

                            })

                        }

                    });



                }

            }


        });


    }
    else if (msg.data === 'Instructions') {

        let text = 'https://telegra.ph/Mix-Trip-04-20';
        const opts = {
            chat_id: chat.id,
            message_id: message_id,
            parse_mode: 'HTML',
            reply_markup: JSON.stringify({
                inline_keyboard: kb.back

            })

        };


        bot.editMessageText(text, opts);

        step = 'Instructions';
        previous_step = 'Faq_';
        helper.switchState(chat.id, step, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, previous_step);




    }
    else if (msg.data === 'myGuideF') {

        helper.userCheck(chat.id, function (rows) {


            if (rows[0].userOrder.length !== 0) {
                function delay() {
                    return new Promise(resolve => setTimeout(resolve, 1000));
                }

                async function delayedLog(item) {
                    // мы можем использовать await для Promise
                    // который возвращается из delay

                    bot.sendMessage(
                        chat.id, `
<code>Приобритенные гайды</code>

<strong>Страна</strong>: ${item.direction},
<strong>Цена</strong>: ${item.guidePrice} руб.,
<strong>Гайд</strong>: ${item.guide},


                                    `, {
                            parse_mode: 'HTML',
                        });
                    await delay();

                }

                async function processArray(array) {
                    for (const item of array) {
                        await delayedLog(item);

                    }
                    console.log('Done!');
                    bot.sendMessage(
                        chat.id, `
<code>Это все ваши гайды!</code>`, {
                            parse_mode: 'HTML',
                        });
                }

                processArray(rows[0].userOrder);
            }
            else {
                let text = 'Вы еще не приобретали гайды';
                const opts = {
                    chat_id: chat.id,
                    message_id: message_id,
                    parse_mode: 'HTML',
                    reply_markup: JSON.stringify({
                        inline_keyboard: kb.back

                    })

                };
                bot.editMessageText(text, opts);

                step = 'myGuideF_hist';
                previous_step = 'История заказов_';
                helper.switchState(chat.id, step, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, previous_step);

            }
        })





    }
    else if (msg.data === 'myPreOrdTour') {

        helper.userCheck(chat.id, function (rows) {

            if (rows[0].userSelectedTour.length !== 0) {


                function delay() {
                    return new Promise(resolve => setTimeout(resolve, 1000));
                }

                async function delayedLog(item) {
                    // мы можем использовать await для Promise
                    // который возвращается из delay

                    bot.sendMessage(
                        chat.id, `
<code>Забронированный тур</code>

Страна: ${item.direction}
    Тур: ${item.nameTour}
    Тип тура: ${item.typeTour}
    Дата: ${item.date}
<strong>Предоплата</strong>: ${item.preOrder} руб

                                    `, {
                            parse_mode: 'HTML',
                        });
                    await delay();

                }

                async function processArray(array) {
                    for (const item of array) {
                        await delayedLog(item);

                    }
                    console.log('Done!');
                    bot.sendMessage(
                        chat.id, `
<code>Это все ваши забронированные туры!</code>`, {
                            parse_mode: 'HTML',
                        });
                }

                processArray(rows[0].userSelectedTour);
            }
            else {
                let text = 'Вы еще не бронировали туры';
                const opts = {
                    chat_id: chat.id,
                    message_id: message_id,
                    parse_mode: 'HTML',
                    reply_markup: JSON.stringify({
                        inline_keyboard: kb.back

                    })

                };
                bot.editMessageText(text, opts);

                step = 'myPreOrdTour_hist';
                previous_step = 'История заказов_';
                helper.switchState(chat.id, step, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, previous_step);

            }
        })

    }
    else if (msg.data === 'finishTask') {
        helper.userCheck(msg.from.id, function (row) {


            if (row[0].userOrder_t.length === 0) {

                const opts = {
                    chat_id: chat.id,
                    message_id: message_id,
                    parse_mode: 'HTML',
                    disable_web_page_preview: true,
                    reply_markup: JSON.stringify({
                        inline_keyboard: kb.back

                    })

                };


                bot.editMessageText(`На данны момент выполненных заданий нету`, opts);

            }
            else {

                async function finishTasksArr(cb) {
                    let arrHistOrd = [];
                    //let texti = [];

                    for (let i = 0; i < row[0].userOrder_t.length; i++) {


                        await arrHistOrd.push(row[0].userOrder_t[i]);
                    }
                    cb(arrHistOrd);
                    //callback(texti);
                }

                finishTasksArr(function (row) {


                    let array = row;
                    let size = 10; //размер подмассива
                    let subarray = []; //массив в который будет выведен результат.
                    for (let i = 0; i <Math.ceil(array.length/size); i++){
                        subarray[i] = array.slice((i*size), (i*size) + size);
                    }


                    //let textis = [];

                    let rowLen = JSON.stringify(subarray)



                    if (rowLen.length > 4096) {

                        let finishTaskArrparsArr = async function (arr, cb) {

                            for (let i = 0; i < arr.length; i++) {
                                await cb(arr[i]);

                            }


                        }

                        finishTaskArrparsArr(subarray, function (arrTex) {

                            async function procLongMessfinishTaskArr(arrTex,cb) {
                                let texti = [];

                                for (let i = 0; i < arrTex.length; i++) {

                                    await  texti.push(`
Номер заказа: ${arrTex[i].id},
Прогрес: ${arrTex[i].progress},
Дата: ${arrTex[i].date},
Соц.сеть: ${arrTex[i].web},
Задача: ${arrTex[i].name},
Ссылка: ${arrTex[i].url},
Заказано: ${arrTex[i].amount},
Выполнено: ${arrTex[i].current}
                                    `);
                                }
                                cb(texti);
                            }
                            procLongMessfinishTaskArr(arrTex,function (row) {

                                bot.sendMessage(
                                    chat.id, `${row}`, {
                                        parse_mode: 'HTML',disable_web_page_preview: true,
                                    });

                            });




                        })


                    }
                    else {

                        let parsfinishTaskArrArrz = async function (arr, cb) {

                            for (let i = 0; i < arr.length; i++) {
                                await cb(arr[i]);

                            }


                        }

                        parsfinishTaskArrArrz(subarray, function (arrTex) {


                            async function procfinishTaskArrLongMessz(arrTex,cb) {
                                let texti = [];
                                //let arrHistOrd = [];


                                for (let i = 0; i < arrTex.length; i++) {
                                    await texti.push(`
Номер заказа: ${arrTex[i].id},
Прогрес: ${arrTex[i].progress},
Дата: ${arrTex[i].date},
Соц.сеть: ${arrTex[i].web},
Задача: ${arrTex[i].name},
Ссылка: ${arrTex[i].url},
Заказано: ${arrTex[i].amount},
Выполнено: ${arrTex[i].current}
                                    `)


                                }
                                cb(texti);

                            }
                            procfinishTaskArrLongMessz(arrTex,function (row) {

                                helper.template_general(chat.id, message_id, kb.back, `<b>☁️Выполненные задания:\n</b>`+`${row}`, function (text, opts) {
                                    bot.editMessageText(text, opts);

                                });

                            });
                        })
                    }

                });

            }

            step = 'finishTask_';
            previous_step = 'История заказов_';
            helper.switchState(chat.id, step, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, previous_step);
        });



    }
    else if (msg.data === 'История заказов') {

        helper.userCheck(msg.from.id, function () {


            helper.template_general(chat.id, message_id, kb.taskbutton, `<b>☁️История заказов:\n</b>`, function (text, opts) {
                bot.editMessageText(text, opts);

            });


            step = 'История заказов_';
            previous_step = 'Профиль_';
            helper.switchState(chat.id, step, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, previous_step);
        });

    }
    else if (msg.data === 'История пополнения') {

        helper.userCheck(msg.from.id, function (rows) {


            if (rows[0].addFunds_t.length === 0) {
                helper.template_general(chat.id, message_id, kb.back, `Вы еще не пополняли счет`, function (text, opts) {
                    bot.editMessageText(text, opts);

                });

            }
            else {

                async function processArrayq(cb) {
                    let texti = [];

                    for (let i = 0; i < rows[0].addFunds_t.length; i++) {

                        texti.push(`
☁️ Пополнение на сумму: ${rows[0].addFunds_t[i].sum}руб

                `);
                    }
                    cb(texti);
                }
                processArrayq(function (row) {



                    let array = row;
                    let size = 50; //размер подмассива
                    let subarray = []; //массив в который будет выведен результат.
                    for (let i = 0; i <Math.ceil(array.length/size); i++){
                        subarray[i] = array.slice((i*size), (i*size) + size);
                    }
                    let rowLen = JSON.stringify(subarray)


                    if (rowLen.length < 3800) {

                        console.log('меньше');


                        helper.template_general(chat.id, message_id, kb.back, `${row}`, function (text, opts) {
                            bot.editMessageText(text, opts);

                        });
                    } else {


                        let finishFoundsArrparsArr = async function (arr, cb) {

                            for (let i = 0; i < arr.length; i++) {
                                await cb(arr[i]);

                            }


                        }

                        finishFoundsArrparsArr(subarray, function (arrTex) {
                            console.log('arrTex',arrTex);

                            bot.sendMessage(
                                chat.id, `${arrTex}`, {
                                    parse_mode: 'HTML',disable_web_page_preview: true,
                                    reply_markup: {
                                        inline_keyboard: kb.back
                                    }
                                });





                        })

                    }



                });
            }

            step = 'История пополнения_';
            previous_step = 'Профиль_';
            helper.switchState(chat.id, step, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, previous_step);

        });

    }
    else if (msg.data === 'На главную') {

        helper.resetUserInfo(chat.id, function (row) {

        });

        helper.template_general(chat.id, message_id, kb.homepage, '☁️Выберите нужный Вам раздел ниже:', function (text, opts) {
            bot.editMessageText(text, opts);

        });

        // helper.interestedTourTmpClear(chat.id)

    }
    else if (msg.data === 'tours') {

        helper.loadButton(function (row) {

            let newRow = row;

            newRow.push([{
                text: '↩️На главную',
                callback_data: 'На главную'
            }]);

            helper.template_general(chat.id, message_id, newRow, config.tours_description, function (text, opts) {
                bot.editMessageText(text, opts);

            });

            step = 'tours';
            previous_step = 'Главное меню';
            helper.switchState(chat.id, step, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, previous_step);



        });


    }
    else if (msg.data === 'add_funds') {

        helper.template_general(chat.id, message_id, undefined, config.HTML_add_funds, function (text, opts) {
            bot.editMessageText(text, opts);

        });

        //(id, step, link, amount, price, sum, text, example_text, min, max, task, request_type, service_id)
        helper.switchState(chat.id, 'add_funds');

    }
    else if (msg.data === 'buy_guide') {

        helper.userCheck(chat.id, function (row) {

            //TODO: Определять баланс и выводить либо кнопки облаты либо пополнить

            let viewGuide = [
                [{
                    text: '✅Оплатить',
                    callback_data: 'pay_guide'
                }],
                [{
                    text: '❌Отмена',
                    callback_data: 'cancel'
                }]
            ];



            if (row[0].balance >= row[0].guidePrice) {



                helper.template_general(chat.id, message_id, viewGuide, `Цена гайда:  <code><strong>${row[0].guidePrice} руб</strong></code> \n\n`+ `${row[0].guideInfo} \n\nНа вашем балансе: ${row[0].balance}руб.`, function (text, opts) {
                    bot.editMessageText(text, opts);

                });

                step = 'Главное меню';
                previous_step = 'Главное меню';
                helper.switchState(chat.id, step, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, previous_step);

            }
            else {

                helper.template_general(chat.id, message_id, kb.add_funds, `Цена гайда:  <code><strong>${row[0].guidePrice} руб</strong></code> \n\n`+ `${row[0].guideInfo}`+ ` \n\nНа вашем балансе: ${row[0].balance}руб. \n\nУ Вас недостаточно средств, пополните баланс. `, function (text, opts) {
                    bot.editMessageText(text, opts);

                });

                step = 'Главное меню';
                previous_step = 'Главное меню';
                helper.switchState(chat.id, step, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, previous_step);

            }


        })



    }
    else {

        helper.userCheck(chat.id, function (row) {


            if (row[0].step === 'tours') {

                toursScheme.find({btnName: msg.data}, function (err, rows) {


                    if (err) {
                        console.log(err)
                    }

                    else {


                        if (rows === null) {


                            helper.resetUserInfo(chat.id, function (row) {

                            });

                            helper.template_general(chat.id, message_id, kb.homepage, '☁️Выберите нужный Вам раздел ниже:', function (text, opts) {
                                bot.editMessageText(text, opts);

                            });
                            helper.switchState(chat.id, 'v2');

                        }
                        else {


                            if (rows.length !== 0) {
                                userScheme.updateMany({id: row[0].id}, {
                                    $set: {
                                        direction: rows[0].name
                                    }
                                }, {upsert: false}, function (err) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        //let neName = rows[0].name || '1';

                                        //есть гайд
                                        if (rows[0].guide) {

                                            let kbForCountry = [
                                                [{
                                                    text: '💰 Приобрести гайд',
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

                                            helper.template_general(chat.id,message_id, kbForCountry,rows[0].infoTours || '☁️ Выберите нужный Вам раздел ниже!', function (text, opts) {
                                                bot.editMessageText(text, opts);

                                            });

                                            helper.switchState(chat.id, 'selectedCountry', msg.data, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'tours');

                                            helper.addGuide(chat.id, rows[0].guide, rows[0].guideInfo, rows[0].guidePrice)

                                        }
                                        //нету гайда
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

                                            helper.template_general(chat.id,message_id, kbForCountry, rows[0].infoTours || '☁️ Выберите нужный Вам раздел ниже!', function (text, opts) {
                                                bot.editMessageText(text, opts);

                                            });

                                            helper.switchState(chat.id, 'selectedCountry', msg.data, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'tours');

                                        }
                                    }
                                })




                            }
                            //TODO: тут еще посмотреть
                            else {

                                helper.resetUserInfo(chat.id, function (row) {

                                });

                                helper.template_general(chat.id, message_id, kb.homepage, '☁️Выберите нужный Вам раздел ниже:', function (text, opts) {
                                    bot.editMessageText(text, opts);

                                });
                                helper.switchState(chat.id, 'v22');



                            }
                        }




                    }


                });


            }

            else if (row[0].step === 'selectedCountry') {

                console.log('второй редакт');

                helper.sentenseCheck(msg.data , function (list) {
                    if (list === null) {


                        helper.resetUserInfo(chat.id, function (row) {

                        });

                        helper.template_general(chat.id, message_id, kb.homepage, '☁️Выберите нужный Вам раздел ниже:', function (text, opts) {
                            bot.editMessageText(text, opts);

                        });
                        helper.switchState(chat.id, 'v2', undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'v34');


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


                                for (let i = 0; i < list.sentence[0].date.length; i++) {

                                    kbForCountrys.unshift(
                                        [{
                                            text: list.sentence[0].date[i],
                                            callback_data: list.sentence[0].date[i],
                                        }]
                                    );

                                }


                                helper.template_general(chat.id,message_id, kbForCountrys,list.sentence[0].typeTourInfo ||'☁️ Выберите нужную Вам дату ⤵️', function (text, opts) {
                                    bot.editMessageText(text, opts);


                                });
                                helper.switchState(chat.id, 'viewsPresentation', undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'selectedCountry');


                            }

                            else if (list.sentence[0].typeTour === 'Package') {

                                helper.template_general(chat.id,message_id, undefined,'1️⃣ Введите какие даты вас интересует ' +
                                    '\nНапример: 12.03', function (text, opts) {
                                    bot.editMessageText(text, opts);

                                    helper.switchState(chat.id, 'enterInfoTour', msg.data, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'tours');

                                });

                            }
                        }, list.sentence[0].preOrder);

                    }

                })




            }
            else if (row[0].step === 'viewsPresentation') {
                //bot.deleteMessage(chat.id, message_id);

                helper.arrTour(row[0].id, undefined, undefined, undefined, undefined, msg.data, undefined, undefined, undefined, undefined,function () {

                    if (row[0].phone === null) {
                        let options = {
                            "parse_mode": "Markdown",
                            "reply_markup": JSON.stringify({
                                "keyboard": [
                                    [{ text: "Поделиться контактом", request_contact: true }]
                                ],
                                "one_time_keyboard" : true
                            })
                        };
                        bot.sendMessage(chat.id, "❗️️ Чтобы получить презентацию, поделитесь контактом", options);



                    }
                    else {

                        bot.sendMessage(chat.id, `❗️Ваша презентация: \n${row[0].presentation}`, {
                            parse_mode: 'HTML',
                            reply_markup: {
                                keyboard: keyboard.homepage,
                                resize_keyboard: true
                            }

                        }).then(setTimeout(() => {
                            bot.sendMessage(chat.id, `Вы можете Забронировать тур или задать вопрос организатору`, {
                                parse_mode: 'HTML',
                                disable_web_page_preview: true,
                                reply_markup: {
                                    inline_keyboard: [
                                        [{
                                            text: 'Забронировать тур',
                                            callback_data: 'book_a_tour'
                                        }],
                                        [{
                                            text: 'Задать вопрос организатору',
                                            url: "https://t.me/mixtripsupport"
                                        }],
                                        [{
                                            text: '↩️На главную',
                                            callback_data: 'На главную'
                                        }]
                                    ],
                                    resize_keyboard: true
                                }

                            })
                        }, 700))


                    }

                })

            }


            else if (row[0].step === 'v1') {


                helper.resetUserInfo(chat.id, function (row) {
                });

                helper.template_general(chat.id, message_id, kb.homepage, '☁️Выберите нужный Вам раздел ниже:', function (text, opts) {
                    bot.editMessageText(text, opts);

                });



            }
            else if (row[0].step === 'v2') {

                helper.resetUserInfo(chat.id, function (row) {
                    console.log(row);
                });

                helper.template_general(chat.id, message_id, kb.homepage, '☁️Выберите нужный Вам раздел ниже:', function (text, opts) {
                    bot.editMessageText(text, opts);

                });



            }



        })


    }






});

bot.on('inline_query', msg => {
    const {chat, message_id, text} = msg.message;
    let result = {
        name: 1
    };

    bot.answerInlineQuery(chat.id, result, {});


});

bot.onText(/start/i, (msg, [source, match]) => {

    //bot.deleteMessage(msg.from.id, msg.message_id);
    allArr = {};


    if (msg.from.id.toString() === process.env.Admin_ID || msg.from.id.toString() === process.env.Dev_ID) {
        bot.sendMessage(msg.chat.id, "Hello Admin 🙌", {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
            reply_markup: {
                keyboard: keyboard.admin,
                resize_keyboard: true
            }

        }).then(setTimeout(() => {
            bot.sendMessage(helper.getChatId(msg), '☁️Выберите нужный Вам раздел ниже:', {
                reply_markup: {
                    inline_keyboard: kb.homepage
                }
            })
        }, 700))
            .catch((error) => {
                console.error(error)
            });
    } else {
        bot.sendMessage(helper.getChatId(msg), config.HTML_main, {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
            reply_markup: {
                keyboard: keyboard.homepage,
                resize_keyboard: true
            }
        })
            .then(setTimeout(() => {
                bot.sendMessage(helper.getChatId(msg), '☁️Выберите нужный Вам раздел ниже:', {
                    reply_markup: {
                        inline_keyboard: kb.homepage
                    }
                })
            }, 700))
            .catch((error) => {
                console.error(error)
            });

    }


});




module.exports = app;

