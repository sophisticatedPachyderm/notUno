const router = require('express').Router();
const gameController = require('./../db/gameController');

//--------------- GAME RETRIEVAL --------------------//

router.post('/getgame', (req, res) => {
  console.log('POST request for /api/game/getgame');
  gameController.getGame(req, res);
});

router.post('/allgames', (req, res) => {
  console.log('POST request for /api/game/allgames');
  gameController.allGames(req, res);
});


//--------------- GAME ACTIONS --------------------//


//create a new game, user will be the first player in the game
router.post('/creategame', (req, res) => {
  console.log('POST request for /api/game/creategame', req.body.userId);
  gameController.createGame(req, res);
});

//join game, for joining a game created by another player
// will auto-initialize the game if you are the final (4th) player to join
router.post('/joingame', (req, res) => {
  console.log('POST request for /api/game/joingame', req.body.userId);
  gameController.startGame(req, res);
});

//start game is for initializing a game early (i.e. with only 2 or 3 players) 
//if the game creator does not want to wait for 4 players.  
router.post('/startgame', (req, res) => {
  console.log('POST request for /api/game/startgame', req.body.userId);
  gameController.createGame(req, res);
});

//drawcard for drawing a single card
//we can get away with NOT doing this and handling all "draws" within myturn
// However... it would look cooler if we can pass each draw into sockets so
// all players can see the card draws as they happen.
router.post('/drawcard', (req, res) => {
  console.log('POST request for /api/game/drawcard');
  res.end();
});

//for playing a card to end a turn
router.post('/myturn', (req, res) => {
  console.log('POST request for /api/game/myturn');
  res.end();
});

module.exports = router;