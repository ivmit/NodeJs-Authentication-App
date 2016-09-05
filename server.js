/**
 * Created by imitrach on 9/5/2016.
 */

/*get Tools*/
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database');


/*Configuration*/

mongoose.connect(configDB.url); //connect to the database

require('./config/passport')(passport); //pass passport for configuration;

//set up express app
app.use(morgan('dev')); //log every request to console;
app.use(cookieParser()); //read cookied (needed for auth);
app.use(bodyParser()); //get information from html form;

app.set('view engine', 'ejs'); //set up efs for templating;

//required for passport
app.use(session({ secret: 'test'})); //session secret
app.use(passport.initialize());
app.use(passport.session()); //persistent login session
app.use(flash()); // use connect-flash for flash messages stored in session

require('./routes/routes.js')(app, passport); //load routes and pass in our app
app.listen(port);
console.log('The magic happens on port' + port);





