// Set the 'NODE_ENV' variable
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const configureMongoose = require('./config/mongoose');
const configureExpress = require('./config/express');
const configurePassport = require('./config/passport');

const db = configureMongoose();
const app = configureExpress();
const passport = configurePassport();
app.listen(3000);

console.log('Server running at http://localhost:3000/');

// Use the module.exports property to expose our Express application instance for external usage
module.exports = app;