
module.exports = function(app) {
    console.log("inside index.server.routes");
    const index = require('../controllers/index.server.controller');
    app.get('/', index.render);

    app.get('/home', function(req, res) {
        res.redirect('/hallo.html');
    });

};
