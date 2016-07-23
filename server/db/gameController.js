'use strict';

const gameModel = require('./gameModel.js');

module.exports = {

//--------------- GAME RETRIEVAL --------------------//

  getGame: (req, res) => {
    gameModel.getGame(req.body.gameId, (rows) => {
      console.log('getGame callback', req.body.gameId, rows);
      res.json(rows);
    });
  },

  getOpenGames: (req, res) => {
    gameModel.getOpenGames(req.body.userId, (rows) => {
      console.log('getOpenGames callback', req.body.userId, rows);
      res.json(rows);
    });
  },

  allGames: (req, res) => {
    gameModel.allGames(req.body.userId, (rows) => {
      console.log('allGames callback', req.body.userId, rows);
      res.json(rows);
    });
  },


//--------------- GAME ACTIONS --------------------//
//see routes for high-level descriptions on each action

  createGame: (req, res) => {
    gameModel.createGame(req.body.userId, (rows) => {
      console.log('createGame callback');
      res.json(rows);  
    });
  },

  joinGame: (req, res) => {
    // var {userId, gameId} = req.body;
    console.log('joinGame in controller', req.body);
    gameModel.joinGame(req.body.userId, req.body.gameId, (rows) => {
      console.log('joinGame complete');
      res.json(rows);  
    });
  },

  startGame: (req, res) => {
    var {userId, gameId} = req.body;

    gameModel.startGame(userId, gameId, (rows) => {
      console.log('startGame complete');
      res.json(rows);
    });
  },

  drawCard: (req, res) => {
    // var {userId, gameId} = req.body;

    gameModel.drawCard(req.body.userId, req.body.gameId, (rows) => {
      console.log('drawCard complete');
      res.json(rows);
    });
  },

  myTurn: (req, res) => {
    //cardIndex is the index of the card to be played
    // var {userId, gameId, cardIndex, wildColor} = req.body;

    gameModel.myTurn(req.body, (rows) => {
      console.log('myTurn callback');
      //socket call to update other players on the changes

      //we need to grab all players Ids and scores to pass into completeGame
      //we probably need to call 

      //if the game is over, update user scores
      if (parameters.complete === 2) {
        //need to update for all players
        // gameModel.updateScore();
      }
      res.json(rows);
    });
  },
};
