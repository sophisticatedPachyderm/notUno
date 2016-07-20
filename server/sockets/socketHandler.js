'use strict';

const url = require('url');
const WebSocketServer = require('ws').Server;
const gameModel = require('./../db/gameModel.js');
const userController = require('../db/userController.js');

const wsRoutes = {

  //--------------- GAME RETRIEVAL --------------------//

  getGame: (ws, req) => {

    gameModel.getGame(req.gameId, (rows) => {
      console.log('getGame callback', rows);
      ws.send(JSON.stringify(rows));
    });
  },

  allGames: (ws, req) => {
    gameModel.allGames(req.userId, (rows) => {
      console.log('allGames callback', req.userId, rows);
      ws.send(JSON.stringify(rows));
    });
  },


//--------------- GAME ACTIONS --------------------//

  createGame: (ws, req) => {
    gameModel.createGame(req.userId, (rows) => {
      console.log('createGame callback');
      ws.send(JSON.stringify(rows));  // make this a boolean?
    });
  },

  joinGame: (ws, req) => {
    var {userId, gameId} = req;
    console.log('joinGame in controller', req);
    gameModel.joinGame(userId, gameId, (rows) => {
      console.log('joinGame complete');
      //socket call to players in this game showing that username has joined!
      ws.send(JSON.stringify(rows));  // boolean?
    });
  },

  startGame: (ws, req) => {
    var {userId, gameId} = req;

    gameModel.startGame(userId, gameId, () => {
      console.log('startGame complete');
      //socket call to players in this game showing that game has started
      ws.send(JSON.stringify(rows));
    });
  },

  drawCard: (ws, req) => {
    var {userId, gameId} = req;

    gameModel.drawCard(userId, gameId, (rows) => {
      console.log('drawCard complete');
      //socket call to players in this game showing draw card
      ws.send(JSON.stringify(rows));
    });
  },

  myTurn: (ws, req) => {
    //cardIndex is the index of the card to be played
    // var {userId, gameId, cardIndex, wildColor} = req;

    gameModel.myTurn(req, (rows) => {
      console.log('myTurn callback', rows, rows.gameOver);
      //socket call to update other players on the changes

      //we need to grab all players Ids and scores to pass into completeGame
      //we probably need to call

      //if the game is over, update user scores
      if (rows.gameOver === true) {
        //need to update for all players
        // gameModel.updateScore();
      }
      ws.send(JSON.stringify(rows));
    });
  },
// ------ USER FUNCTIONS FROM CONTROLLER ------- //
  signin: (ws, data) => {
    userController.signin(ws, data);
    console.log('sent to ws route signin');
  },

  signup: (ws, data) => {
    userController.signup(ws, data);
    console.log('sent to ws route signup');
  },

};


//--------------- ESTABLISH WEBSOCKET CONNECTION --------------------//


module.exports = (server) => {

  const wss = new WebSocketServer({ server: server });

  wss.on('connection', (ws) => {
    var location = url.parse(ws.upgradeReq.url, true);
    console.log(location);

    ws.on('message', (data) => {
      console.log('received data', data);
      const parsed = JSON.parse(data);
      const route = parsed.route;

      if (wsRoutes[route]) {
        wsRoutes[route](ws, parsed);
      } else {
        console.log('Error -------- route does not exist', route);
      }

    });

    console.log('websocket client connected to server');
  });
};
