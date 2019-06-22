var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var request = require("request-promise");
var http = require('http');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');

var mongoose = require('mongoose');
var passport = require('passport');


var configDB = require('./config/database');

//set up express app
var app = express();

//connect to database
mongoose.connect(configDB.url);

//configure passport
require('./config/passport')(passport);

app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//passport requirement
app.use(session({secret: 'mysecret'})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

//routes
require('./routes/index')(app, passport);
require('./routes/dashboard')(app);

//redirect invalid URL
app.all('*', function(req, res) {
    res.redirect("/");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    //res.render('error');
});

module.exports = app;
