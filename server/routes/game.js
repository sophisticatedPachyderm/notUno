var router = require('express').Router();
var db = require('./../db/gameModel.js');

router.get('/wait', function(req, res) {
  console.log('GET request for /api/game/wait');
  res.end();
});

router.get('/allgames', function(req, res) {
  console.log('GET request for /api/game/allgames');
  db.completeGame(1, 1200, res);
});

router.post('/myturn', function(req, res) {
  console.log('POST request for /api/game/myturn');
  res.end();
});

module.exports = router;
