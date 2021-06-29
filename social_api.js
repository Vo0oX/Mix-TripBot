const needle = require('needle');
const helper = require('./src/helper');
let smmyt;

require('dotenv').config({path: __dirname + '/.env'});


module.exports = {
    sendTask:  function (row, task_id, callback) {
        console.log('отправили запрос на выполнение:', row);


        if (row[0].request_type === 'subscribe') {
            console.log('подписка = subscribe');

            if (row[0].login) {
                if (row[0].post_old || row[0].post_new) {
                    console.log('post_old','post_new','login');

                    let likemania = `https://likemania.com/api2/subscribe/?key=${process.env.Likemania_TOKEN}&service_id=${row[0].service_id}&amount=${row[0].amount}&old=${row[0].post_old}&new=${row[0].post_new}&url=http://instagram.com/${row[0].login}&force=1`;

                    console.log(likemania);

                    needle('post', likemania)
                        .then(function (resp) {

                            console.log('resp: ',resp.body, likemania);

                            //отпрааляем ответ от сервер накрутки
                            callback([resp.body,likemania]);

                        })
                        .catch(function (err) {
                            console.log(err)
                        });

                    helper.resetUserInfo(row[0].id, function (row) {
                        console.log('запрос отправлен, инфо обновленно');
                    });
                }

            }
            if (row[0].link) {
                if (row[0].post_old || row[0].post_new) {
                    console.log('post_old','post_new','link');
                    let  likemania = `https://likemania.com/api2/subscribe/?key=${process.env.Likemania_TOKEN}&service_id=${row[0].service_id}&amount=${row[0].amount}&old=${row[0].post_old}&new=${row[0].post_new}&url=${row[0].link}&force=1`;
                    console.log(likemania);

                    needle('post', likemania)
                        .then(function (resp) {

                            console.log('resp: ',resp.body, likemania);

                            //отпрааляем ответ от сервер накрутки
                            callback([resp.body,likemania]);

                        })
                        .catch(function (err) {
                            console.log(err)
                        });

                    helper.resetUserInfo(row[0].id, function (row) {
                        console.log('запрос отправлен, инфо обновленно');
                    });
                }

            }

        }
        else {
            console.log('подписка !== subscribe');

            if (!row[0].post_old && !row[0].post_new && row[0].link && !row[0].login) {
                console.log('!post_old','!post_new','link');
                let likemania = `https://likemania.com/api2/task/?key=${process.env.Likemania_TOKEN}&service_id=${row[0].service_id}&amount=${row[0].amount}&url=${row[0].link}&force=1`;
                console.log(likemania);

               needle('post', likemania)
                    .then( function (resp) {

                        console.log('resp: ',resp.body, likemania);


                        //отпрааляем ответ от сервер накрутки
                        callback([resp.body,likemania]);
                        helper.resetUserInfo(row[0].id, function (row) {
                            console.log('запрос отправлен, инфо обновленно');
                        });

                    })
                    .catch(function (err) {
                        console.log(err)
                    });


            }
            if (!row[0].post_old && !row[0].post_new && row[0].login && !row[0].link) {
                console.log('!post_old','!post_new','login');

                let likemania = `https://likemania.com/api2/task/?key=${process.env.Likemania_TOKEN}&service_id=${row[0].service_id}&amount=${row[0].amount}&url=http://instagram.com/${row[0].login}&force=1`;

                console.log(likemania);

                needle('post', likemania)
                    .then(function (resp) {

                        console.log('resp: ',resp.body, likemania);

                        //отпрааляем ответ от сервер накрутки
                        callback([resp.body,likemania]);

                    })
                    .catch(function (err) {
                        console.log(err)
                    });

                helper.resetUserInfo(row[0].id, function (row) {
                    console.log('запрос отправлен, инфо обновленно');
                });
            }
            if (!row[0].post_old && !row[0].post_new && row[0].link && row[0].login) {
                console.log('!post_old','!post_new','link','login');
                let likemania = `https://likemania.com/api2/task/?key=${process.env.Likemania_TOKEN}&service_id=${row[0].service_id}&amount=${row[0].amount}&url=${row[0].link}&username=${row[0].login}&force=1`;
                console.log(likemania);

                needle('post', likemania)
                    .then(function (resp) {

                        console.log('resp: ',resp.body, likemania);

                        //отпрааляем ответ от сервер накрутки
                        callback([resp.body,likemania]);

                    })
                    .catch(function (err) {
                        console.log(err)
                    });

                helper.resetUserInfo(row[0].id, function (row) {
                    console.log('запрос отправлен, инфо обновленно');
                });
            }
        }



        //
/**

        let social_arr = [];

        console.log(' ___NEED: ', likemania);

        needle('get', likemania)
            .then(function (resp) {
                console.log('resp.body: ', resp.body);
                for (let i = 0; i < resp.body.length; ++i) {

                    social_arr.push({
                        'id': resp.body[i].id,
                        'label': resp.body[i].label,
                        'text': resp.body[i].text,
                    });
                }

                //отпрааляем ответ от сервер накрутки
                callback(resp.body);

            })
            .catch(function (err) {
                console.log(err)
            });
**/
    },

    my_balance: function (callback) {

        needle('get', `https://likemania.com/api2/balance?key=${process.env.Likemania_TOKEN}`)
            .then(function (resp) {

                callback(resp.body);

            })
            .catch(function (err) {
                console.log(err)
            });
    },

    my_balanceSmm: function (callback) {


        needle('post', `https://smmyt.ru/api/v2/?key=${process.env.Smmyt_TOKEN}&action=balance`)
            .then(function (resp) {
                console.log(resp.body);
                callback(resp.body);

            })
            .catch(function (err) {
                console.log(err)
            });
    },

    my_task: function (callback) {

        needle('get', `https://likemania.com/api2/tasks?key=${process.env.Likemania_TOKEN}&page=0`)
            .then(function (resp) {

                callback(resp.body.results);

            })
            .catch(function (err) {
                console.log(err)
            });
    },

    sendTaskSMM: function (row, task_id, callback) {
        console.log('отправили запрос на выполнение:', row);
        let smmyt;


        if (row[0].request_type === 'subscribe') {
            console.log('подписка = subscribe');



            /**

            if (row[0].login) {
                if (row[0].post_old || row[0].post_new) {
                    console.log('post_old','post_new','login');

                    likemania = `https://likemania.com/api2/subscribe/?key=${process.env.Likemania_TOKEN}&service_id=${row[0].service_id}&amount=${row[0].amount}&old=${row[0].post_old}&new=${row[0].post_new}&url=http://instagram.com/${row[0].login}&force=1`;

                    console.log(likemania);

                    needle('post', likemania)
                        .then(function (resp) {

                            console.log('resp: ',resp.body, likemania);

                            //отпрааляем ответ от сервер накрутки
                            callback(resp.body);

                        })
                        .catch(function (err) {
                            console.log(err)
                        });

                    helper.resetUserInfo(row[0].id, function (row) {
                        console.log('запрос отправлен, инфо обновленно');
                    });
                }

            }
            if (row[0].link) {
                if (row[0].post_old || row[0].post_new) {
                    console.log('post_old','post_new','link');
                    likemania = `https://likemania.com/api2/subscribe/?key=${process.env.Likemania_TOKEN}&service_id=${row[0].service_id}&amount=${row[0].amount}&old=${row[0].post_old}&new=${row[0].post_new}&url=${row[0].link}&force=1`;
                    console.log(likemania);

                    needle('post', likemania)
                        .then(function (resp) {

                            console.log('resp: ',resp.body, likemania);

                            //отпрааляем ответ от сервер накрутки
                            callback(resp.body);

                        })
                        .catch(function (err) {
                            console.log(err)
                        });

                    helper.resetUserInfo(row[0].id, function (row) {
                        console.log('запрос отправлен, инфо обновленно');
                    });
                }

            }

             **/
        }
        else {
            console.log('подписка !== subscribe');

            if (row[0].link) {
                console.log(row[0].link);

                smmyt = `https://smmyt.ru/api/v2/?key=${process.env.Smmyt_TOKEN}&action=add&service=${row[0].service_id}&link=${row[0].link}&quantity=${row[0].amount}`;
                let smmyts = `https://smmyt.ru/api/v2/?key=${process.env.Smmyt_TOKEN}&action=add&service=${row[0].service_id}&link=${row[0].link}&quantity=${row[0].amount}`;

                console.log(smmyts);

                needle('post', smmyt)
                    .then(function (resp) {

                        console.log('resp: ',resp.body, smmyt);

                        //отпрааляем ответ от сервер накрутки
                        callback(JSON.parse(resp.body));

                    })
                    .catch(function (err) {
                        console.log(err)
                    });

                helper.resetUserInfo(row[0].id, function (row) {
                    console.log('запрос отправлен, инфо обновленно');
                });
            }

        }





        /**

         let social_arr = [];

         console.log(' ___NEED: ', likemania);

         needle('get', likemania)
         .then(function (resp) {
                console.log('resp.body: ', resp.body);
                for (let i = 0; i < resp.body.length; ++i) {

                    social_arr.push({
                        'id': resp.body[i].id,
                        'label': resp.body[i].label,
                        'text': resp.body[i].text,
                    });
                }

                //отпрааляем ответ от сервер накрутки
                callback(resp.body);

            })
         .catch(function (err) {
                console.log(err)
            });
         **/
    }



};
