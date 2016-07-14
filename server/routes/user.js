var router = require('express').Router();

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
  res.end();
});

router.post('/auth', function(req, res) {
  console.log('POST request for /api/user/auth');
  res.end();
});


module.exports = router;