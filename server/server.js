var express = require('express');
var parser = require('body-parser');
var morgan = require('morgan');
var bcrypt = require('bcrypt-nodejs');
var passport = require('passport');

var LocalStrategy = require('passport-local').Strategy;
var userRoutes = require('./routes/userRoutes');
var gameRoutes = require('./routes/gameRoutes');

var database = require('./db/dbStart');

var app = express();
//--------- SETUP MIDDLEWARE ----------------------//
app.use(morgan('dev'));
app.use(parser.json());
app.use(passport.initialize());
app.use(passport.session());
app.use('/api/user', userRoutes);
app.use('/api/game', gameRoutes);


var port = 3000;
app.listen(port, function() {
  console.log('Listening to port:', port);
});
