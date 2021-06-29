const mongoose = require('mongoose');

let routes = function (callback) {
    mongoose.connect(process.env.DB_CONNECTION,
        {useNewUrlParser: true,useUnifiedTopology: true,useFindAndModify: false},
        () => {
            mongoose.Promise = global.Promise;
            console.log('\x1b[32m','Connected to Database...');

            return callback();

        })
};

module.exports = routes;