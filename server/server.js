'use strict';

var server = require('http').createServer();
var express = require('express');
var parser = require('body-parser');
var morgan = require('morgan');
var bcrypt = require('bcrypt-nodejs');
var passport = require('passport');

var LocalStrategy = require('passport-local').Strategy;
var userRoutes = require('./routes/userRoutes');
var gameRoutes = require('./routes/gameRoutes');

var app = express();
//--------- SETUP MIDDLEWARE ----------------------//
app.use(morgan('dev'));
app.use(parser.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));
app.use('/api/user', userRoutes);
app.use('/api/game', gameRoutes);


//--------- SETUP WEBSOCKETS ----------------------//
var socketHandler = require('./sockets/socketHandler.js');
socketHandler.init(server);

var port = process.env.PORT || 3000;

server.on('request', app);
server.listen(port, function() {
  console.log('Listening to port:', port);
});
