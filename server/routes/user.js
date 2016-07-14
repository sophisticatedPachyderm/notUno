var router = require('express').Router();
var db = require('./../db/userModel.js');
// delete

router.get('/chat', function(req, res) {
  console.log('GET request for /api/user/chat');
  res.end();
});

router.post('/chat', function(req, res) {
  console.log('POST request for /api/user/chat');
  res.end();
});

router.get('/auth', function(req, res) {
  console.log('GET request for /api/user/auth');
  db.verifyPassword('docBrown', 'crazy', res);
});

router.post('/auth', function(req, res) {
  console.log('POST request for /api/user/auth');
  // this will create a new user in the database
  db.newUser(req.body.username, req.body.password, res);
});

module.exports = router;
