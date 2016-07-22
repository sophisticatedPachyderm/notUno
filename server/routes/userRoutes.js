'use strict';

var router = require('express').Router();
var db = require('./../db/userController.js');

router.get('/chat', function(req, res) {
  console.log('GET request for /api/user/chat');
  //not yet tested
  res.end();
});

router.post('/chat', function(req, res) {
  console.log('POST request for /api/user/chat');
  // not yet tested
  res.end();
});

router.post('/auth/signin', function(req, res) {
  console.log('POST request for /api/user/auth/signin');
  db.signin(req, res);
});

router.post('/auth/signup', function(req, res) {
  console.log('POST request for /api/user/auth/signup');
  db.signup(req, res);
});

module.exports = router;
