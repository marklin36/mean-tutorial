const config = require('./config');
const mongoose = require('mongoose');

module.exports = function() {
    // config.db store the url to the database; see
    const db = mongoose.connect(config.db);

    require('../app/models/user.server.model');
    return db;
};