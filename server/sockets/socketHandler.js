'use strict';

const url = require('url');
const WebSocketServer = require('ws').Server;
const gameModel = require('./../db/gameModel.js');
const userController = require('../db/userController.js');

//--------------- ESTABLISH WEBSOCKET CONNECTION --------------------//

var wss;

module.exports = {
  init: (server) => {
    wss = new WebSocketServer({server: server});

    wss.on('connection', (ws) => {
      var location = url.parse(ws.upgradeReq.url, true);
      console.log(location);

      ws.on('message', (data) => {
        console.log('received data', data);

        try {
          const parsed = JSON.parse(data);
          const route = parsed.route;

          if (wsRoutes[route]) {
            wsRoutes[route](ws, parsed);
          } else {
            console.log('Error -------- route does not exist', route);
            // wss.broadcast(['Broadcast to all clients! -------- Whassup!!!', 'yup']);
            // ws.send('Route does not exist');
          }
          
        } catch (e) {
          console.log('CANNOT PARSE DATA!');
          return;
        }

      });

      console.log('websocket client connected to server');
    });
  }
};

//--------------- WEBSOCKET ROUTING --------------------//

const wsRoutes = {

  //--------------- GAME RETRIEVAL --------------------//

  getGame: (ws, req) => {

    gameModel.getGame(req.gameId, (rows) => {
      console.log('getGame callback', rows);

      //can we send the specific card to the person 
      wsSend(ws, 'getGameResponse', rows);
    });
  },

  allGames: (ws, req) => {
    gameModel.allGames(req.userId, (rows) => {
      console.log('allGames callback', req.userId);
      //we need to wrap arrays in an object so we can assign a route: allGamesResponse
      var object = {
        results: rows,
        response: 'affirmative',
      };
      wsSend(ws, 'allGamesResponse', object);
    });
  },


//--------------- GAME ACTIONS --------------------//

  createGame: (ws, req) => {
    gameModel.createGame(req.userId, (rows) => {
      console.log('createGame callback');
      wsSend(ws, 'createGameResponse', rows);  // make this a boolean?
    });
  },

  joinGame: (ws, req) => {
    var {userId, gameId} = req;
    console.log('joinGame in controller', req);
    gameModel.joinGame(userId, gameId, (rows) => {
      console.log('joinGame complete');
      //socket call to players in this game showing that username has joined!
      wsSend(ws, 'joinGameResponse', rows);  // boolean?
    });
  },

  startGame: (ws, req) => {
    var {userId, gameId} = req;

    gameModel.startGame(userId, gameId, () => {
      console.log('startGame complete');
      //socket call to players in this game showing that game has started
      wsSend(ws, 'startGameResponse', rows);
    });
  },

  drawCard: (ws, req) => {
    var {userId, gameId} = req;

    gameModel.drawCard(userId, gameId, (rows) => {
      console.log('drawCard complete');
      //socket call to players in this game showing draw card
      wsSend(ws, 'drawCardResponse', rows);
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
      wsSend(ws, 'drawCardResponse', rows);
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

//--------------- USE COUNTER TO CREATE AUTO-INCREMENT MSGID (for each reboot of server) --------------------//

var msgId = 1;

const wsSend = (ws, route, rows) => {
  rows.msgId = msgId;
  rows.route = route;
  ws.send(JSON.stringify(rows));
  msgId++;
};


const broadcast = (data, route) => {
  data.msgId = msgId;
  data.route = route;
  var json = JSON.stringify(data);

  msgId++;
  console.log('stringify:', json);
  wss.clients.forEach((client) => {
    client.send(json);
  });

};