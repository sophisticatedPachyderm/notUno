'use strict';

const router = require('express').Router();
const gameController = require('./../db/gameController.js');

//--------------- GAME RETRIEVAL --------------------//

router.post('/getgame', (req, res) => {
  console.log('POST request for /api/game/getgame');
  gameController.getGame(req, res);
});

router.post('/getopengames', (req, res) => {
  console.log('POST request for /api/game/getopengames');
  gameController.getOpenGames(req, res);
});

router.post('/allgames', (req, res) => {
  console.log('POST request for /api/game/allgames');
  gameController.allGames(req, res);
});


//--------------- GAME ACTIONS --------------------//


//create a new game, user will be the first player in the game
router.post('/creategame', (req, res) => {
  console.log('POST request for /api/game/creategame');
  gameController.createGame(req, res);
});

//join game, for joining a game created by another player
// will auto-initialize the game if you are the final (4th) player to join
router.post('/joingame', (req, res) => {
  console.log('POST request for /api/game/joingame');
  gameController.joinGame(req, res);
});

//start game is for initializing a game early (i.e. with only 2 or 3 players) 
//if the game creator does not want to wait for 4 players.  
router.post('/startgame', (req, res) => {
  console.log('POST request for /api/game/startgame');
  gameController.startGame(req, res);
});

//drawcard for drawing a single card
router.post('/drawcard', (req, res) => {
  console.log('POST request for /api/game/drawcard');
  gameController.drawCard(req, res);
});

//for playing a card to end a turn
router.post('/myturn', (req, res) => {
  console.log('POST request for /api/game/myturn');
  gameController.myTurn(req, res);
});

module.exports = router;