/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var server = __webpack_require__(1).createServer();
	var express = __webpack_require__(2);
	var parser = __webpack_require__(3);
	var morgan = __webpack_require__(4);
	var bcrypt = __webpack_require__(5);
	var passport = __webpack_require__(6);

	var LocalStrategy = __webpack_require__(7).Strategy;
	var userRoutes = __webpack_require__(8);
	var gameRoutes = __webpack_require__(14);

	var database = __webpack_require__(12);

	var app = express();
	//--------- SETUP MIDDLEWARE ----------------------//
	app.use(morgan('dev'));
	app.use(parser.json());
	app.use(passport.initialize());
	app.use(passport.session());
	app.use('/api/user', userRoutes);
	app.use('/api/game', gameRoutes);

	//--------- SETUP WEBSOCKETS ----------------------//
	__webpack_require__(23)(server);

	var port = 3000;

	server.on('request', app);
	server.listen(port, function () {
	  console.log('Listening to port:', port);
	});

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = require("http");

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("express");

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("body-parser");

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("morgan");

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("bcrypt-nodejs");

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("passport");

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = require("passport-local");

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var router = __webpack_require__(2).Router();
	var db = __webpack_require__(9);

	router.get('/chat', function (req, res) {
	  console.log('GET request for /api/user/chat');
	  //not yet tested
	  res.end();
	});

	router.post('/chat', function (req, res) {
	  console.log('POST request for /api/user/chat');
	  // not yet tested
	  res.end();
	});

	router.get('/auth', function (req, res) {
	  console.log('GET request for /api/user/auth');
	  db.verifyPassword('docBrown', 'crazy', res);
	});

	router.post('/auth', function (req, res) {
	  console.log('POST request for /api/user/auth');
	  // this will create a new user in the database
	  db.newUser(req.body.username, req.body.password, res);
	});

	module.exports = router;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var userModel = __webpack_require__(10);

	module.exports = {
	  signin: function signin(req, res) {
	    var username = req.body.username; // bodyParser
	    var password = req.body.password;

	    /* we should remember this structure when when we have the
	    API calls from the client
	    verifyPassword: function (username, password)
	    */

	    userModel.doesUserExist(username, function (bool) {
	      if (!bool) {
	        // user does not exist
	        console.log('Username/Password combination does not exist');
	        res.redirect('/');
	      } else {
	        userModel.verifyPassword(username, password, function (user) {
	          if (!user) {
	            console.log('invalid username/password');
	          } else {
	            // this needs to be tested, but this is a part of passport auth
	            // that needs to happen upon signin!
	            // req.logIn() for passport
	            req.logIn(username, function (err) {
	              // we pass USERNAME to the req.logIn method from passport
	              if (err) {
	                console.log(err);
	              } else {
	                res.redirect('/');
	              }
	            });
	          }
	        });

	        // evan abstracted the req/res into the model (Steven thinks);
	      }
	    });
	  },

	  signup: function signup(req, res) {
	    // see if node enjoys arrow es6
	    var username = req.body.username;
	    var password = req.body.password;

	    userModel.doesUserExist(username, function (bool) {
	      if (bool) {
	        console.log('Username in use!');
	        res.redirect('/');
	        return;
	      } else {
	        userModel.newUser(username, password);
	        res.redirect('/');
	        console.log('new user created');
	        res.end();
	      }
	    });
	  },

	  singleUserScore: function singleUserScore(req, res) {
	    var username = req.body.username;

	    if (!userModel.doesUserExist(username)) {
	      // user does not exist
	      console.log('Username does not exist!');
	      res.redirect('/');
	      return;
	    };

	    userModel.retrieveScore(username, function (val) {
	      // res.end(JSON.stringify(val[0]));
	      res.json(val[0]);
	    });
	  },

	  topTenScores: function topTenScores(req, res) {
	    userModel.retrieveTopTenScores(function (arr) {
	      res.end(arr);
	    });
	  }
	};

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var mysql = __webpack_require__(11);
	var bcrypt = __webpack_require__(5);
	var db = __webpack_require__(12);
	var __SALT = 10;

	module.exports = {
	  verifyPassword: function verifyPassword(username, password, callback) {
	    db.query('\n      SELECT\n        password\n      FROM\n        users\n      WHERE\n        username = \'' + username + '\';\n      ', function (err, rows) {
	      if (err) {
	        console.log('err on hash retrieval query', err);
	      } else {
	        console.log(rows, ' hash retrieval success');
	        bcrypt.compare(password, rows[0].password, function (err, res) {
	          if (err) {
	            console.log('err on bcryptCompare', err);
	          } else {
	            callback(res);
	            // callback on the boolean returned;
	          }
	        });
	      }
	    });
	    // reminder to verify that mysql returns an array of results
	    // this should be a 1x1 array

	    /*
	    UserSchema.methods.comparepasswords = function(password, cb) {
	      bcrypt.compare(password, this.password, function(err, res) {
	        if (res) {
	          cb(res);
	        } else {
	          cb(res);
	        }
	      });
	    };
	    */
	  },

	  retrieveScore: function retrieveScore(username) {
	    db.query('\n      SELECT\n        score\n      FROM\n        users\n      WHERE\n        username = ' + username + ';\n      ', function (err, rows) {
	      if (err) {
	        console.log('err on retrieveScore query', err);
	      } else {
	        console.log(rows, ' score retrieval success');
	        callback(rows);

	        // array
	      }
	    });

	    // simple score retrieval
	    // for simplicity, no pass check to retrieve score since we'll use for leaderboards
	  },

	  newUser: function newUser(username, password, res) {
	    bcrypt.genSalt(__SALT, function (err, salt) {
	      bcrypt.hash(password, salt, null, function (err, hash) {
	        if (err) {
	          console.log(err, ' hash/salt error');
	        } else {
	          db.query('\n            INSERT INTO\n              users (username, password, salt, score)\n            VALUES\n              (\'' + username + '\', \'' + hash + '\', \'' + salt + '\', 0);\n            ', function (err, rows) {
	            if (err) {
	              console.log('error on DB insert' + err);
	            } else {
	              console.log(rows + ' write success');
	              res.send('success');
	              res.sendStatus(201);
	              res.end();
	            }
	          });
	        }
	      });
	    });

	    // function to store new user with raw sql
	    // presumably, this is for the initial signup to store a given pass
	  },

	  doesUserExist: function doesUserExist(username, callback) {
	    db.query('\n      SELECT\n        *\n      FROM\n        users\n      WHERE\n        username = ' + username + ';\n      ', function (err, rows) {
	      if (err) {
	        console.log('err on user retrieval query', err);
	      } else {
	        console.log(rows, ' user retrieval success');
	        callback(rows[0]); // should be a boolean
	      }
	    });

	    // array would be empty if username doesn't have any records
	  },

	  retrieveTopTenScores: function retrieveTopTenScores(callback) {
	    db.query('\n      SELECT\n        username, scoring\n      FROM\n        users\n      ORDER BY scoring desc\n      limit 10;\n      ', function (err, rows) {
	      if (err) {
	        console.log('err on retrieveScore query', err);
	      } else {
	        console.log(rows, ' score retrieval success');
	        callback(rows);
	      }
	    });

	    // simple score retrieval
	    // for simplicity, no pass check to retrieve score since we'll use for leaderboards
	  }

	};

/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = require("mysql");

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var mysql = __webpack_require__(11);
	var secrets = __webpack_require__(13);

	var connection = mysql.createConnection({
	  host: secrets.url, // could be Docker if we figure it out
	  port: secrets.port,
	  user: secrets.username,
	  password: secrets.password,
	  database: 'notUno'
	});

	connection.connect(function (err) {
	  if (err) {
	    console.log('err ' + err);
	    return;
	  } else {
	    console.log('connected as id ' + connection.threadId);
	  }
	});

	module.exports = connection;

/***/ },
/* 13 */
/***/ function(module, exports) {

	'use strict';

	module.exports = {
	  url: 'notuno.cuqnddpc2icd.us-west-1.rds.amazonaws.com',
	  port: 8765,
	  username: 'notUnoMaster',
	  password: 'sophisticatedPachyderm'
	};

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var router = __webpack_require__(2).Router();
	var gameController = __webpack_require__(15);

	//--------------- GAME RETRIEVAL --------------------//

	router.post('/getgame', function (req, res) {
	  console.log('POST request for /api/game/getgame');
	  gameController.getGame(req, res);
	});

	router.post('/allgames', function (req, res) {
	  console.log('POST request for /api/game/allgames');
	  gameController.allGames(req, res);
	});

	//--------------- GAME ACTIONS --------------------//

	//create a new game, user will be the first player in the game
	router.post('/creategame', function (req, res) {
	  console.log('POST request for /api/game/creategame');
	  gameController.createGame(req, res);
	});

	//join game, for joining a game created by another player
	// will auto-initialize the game if you are the final (4th) player to join
	router.post('/joingame', function (req, res) {
	  console.log('POST request for /api/game/joingame');
	  gameController.joinGame(req, res);
	});

	//start game is for initializing a game early (i.e. with only 2 or 3 players) 
	//if the game creator does not want to wait for 4 players.  
	router.post('/startgame', function (req, res) {
	  console.log('POST request for /api/game/startgame');
	  gameController.createGame(req, res);
	});

	//drawcard for drawing a single card
	router.post('/drawcard', function (req, res) {
	  console.log('POST request for /api/game/drawcard');
	  gameController.drawCard(req, res);
	});

	//for playing a card to end a turn
	router.post('/myturn', function (req, res) {
	  console.log('POST request for /api/game/myturn');
	  res.end();
	});

	module.exports = router;

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var gameModel = __webpack_require__(16);

	module.exports = {

	  //--------------- GAME RETRIEVAL --------------------//

	  getGame: function getGame(req, res) {
	    gameModel.getGame(req.body.gameId, function (rows) {
	      console.log('getGame callback', req.body.gameId, rows);
	      res.json(rows);
	    });
	  },

	  allGames: function allGames(req, res) {
	    gameModel.allGames(req.body.userId, function (rows) {
	      console.log('allGames callback', req.body.userId, rows);
	      res.json(rows);
	    });
	  },

	  //--------------- GAME ACTIONS --------------------//
	  //see routes for high-level descriptions on each action

	  createGame: function createGame(req, res) {
	    gameModel.createGame(req.body.userId, function (rows) {
	      console.log('createGame callback');
	      //should we do a socket call to other players to make this new game auto-show?
	      res.json(rows); // make this a boolean?
	    });
	  },

	  joinGame: function joinGame(req, res) {
	    var _req$body = req.body;
	    var userId = _req$body.userId;
	    var gameId = _req$body.gameId;

	    console.log('joinGame in controller', req.body);
	    gameModel.joinGame(userId, gameId, function (rows) {
	      console.log('joinGame complete');
	      //socket call to players in this game showing that username has joined!
	      res.json(rows); // boolean?
	    });
	  },

	  startGame: function startGame(req, res) {
	    var _req$body2 = req.body;
	    var userId = _req$body2.userId;
	    var gameId = _req$body2.gameId;


	    gameModel.startGame(userId, gameId, function () {
	      console.log('startGame complete');
	      //socket call to players in this game showing that game has started
	      res.redirect('/');
	    });
	  },

	  drawCard: function drawCard(req, res) {
	    var _req$body3 = req.body;
	    var userId = _req$body3.userId;
	    var gameId = _req$body3.gameId;


	    gameModel.drawCard(userId, gameId, function () {
	      console.log('drawCard complete');
	      //socket call to players in this game showing draw card
	      res.redirect('/');
	    });
	  },

	  myTurn: function myTurn(req, res) {
	    //cardIndex is the index of the card to be played
	    // var {userId, gameId, cardIndex, wildColor} = req.body;

	    gameModel.myTurn(req.body, function (rows) {
	      console.log('myTurn callback');
	      //socket call to update other players on the changes

	      //we need to grab all players Ids and scores to pass into completeGame
	      //we probably need to call 

	      //if the game is over, update user scores
	      if (parameters.complete === 2) {
	        //need to update for all players
	        // gameModel.updateScore();
	      }
	      res.redirect('/');
	    });
	  }
	};

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var promiseQuery = __webpack_require__(17);
	var gameInit = __webpack_require__(19);

	var _require = __webpack_require__(22);

	var convertCardsToTuples = _require.convertCardsToTuples;
	var getNextPlayer = _require.getNextPlayer;

	//--------------- GAME HELPER FUNCTIONS --------------------------------------//

	//get the new currentPlayer based on the current direction
	// const getNextPlayer = (currentPlayer, direction, playerCount) => {
	//   direction === 1 ? currentPlayer++ : currentPlayer --;

	//   if (currentPlayer >= playerCount) { currentPlayer = 0; }
	//   if (currentPlayer < 0) { currentPlayer = playerCount - 1; }
	//   return currentPlayer;
	// };

	var insertIntoGamesByUser = function insertIntoGamesByUser(userId, gameId, position) {
	  return promiseQuery('\n    INSERT\n    INTO\n      gamesByUser\n      ( gameId, userId, position )\n    VALUES\n      ( \'' + gameId + '\', \'' + userId + '\', \'' + position + '\' );\n    ', true);
	};

	// get the current state of the game from the dataase and parse / format it
	var getGameState = function getGameState(userId, gameId) {
	  return promiseQuery('\n    SELECT\n      games.*,\n      gamesByUser.position\n    FROM\n      games\n    INNER JOIN\n      gamesByUser\n    WHERE\n      games.gameId = \'' + gameId + '\'\n    AND\n      games.gameId = gamesByUser.gameId\n    AND\n      gamesByUser.userId = \'' + userId + '\'\n      ;\n    ', true).then(function (rows) {
	    var unplayedCards = JSON.parse(rows[0].unplayedCards);
	    var playedCards = JSON.parse(rows[0].playedCards);
	    var handName = 'p' + rows[0].position + 'Hand';
	    var myHand = JSON.parse(rows[0][handName]);

	    //look at p#Hand to determine how many players
	    var playerCount = rows[0].p2Hand === null ? 2 : rows[0].p3Hand === null ? 3 : 4;

	    //we need to get the next Hand to handle takeTwo / takeFour cards played at myTurn
	    var nextHandName = 'p' + getNextPlayer(rows[0].currentPlayer, rows[0].direction, playerCount) + 'Hand';
	    var nextHand = JSON.parse(rows[0][nextHandName]);

	    return {
	      unplayedCards: unplayedCards,
	      playedCards: playedCards,
	      handName: handName,
	      myHand: myHand,
	      currentPlayer: rows[0].currentPlayer,
	      direction: rows[0].direction,
	      playerCount: playerCount,
	      nextHandName: nextHandName,
	      nextHand: nextHand,
	      myPosition: rows[0].position
	    };
	  });
	};

	// update the state of the game in the database after making a move like drawing a card or playing a card.
	var updateGameState = function updateGameState(_ref) {
	  var handName = _ref.handName;
	  var myHand = _ref.myHand;
	  var gameId = _ref.gameId;
	  var options = _ref.options;
	  var next = _ref.next;


	  //players own hand is always changed on any move (i.e. drawing a card or playing a card)
	  //so we expect to always update the playersHand
	  var queryString = '\n    UPDATE\n      games\n    SET\n      ' + handName + ' = \'' + JSON.stringify(myHand) + '\'\n    ';

	  // then, concatenate any other gameState change that are passed in through options
	  for (var key in options) {
	    if (Array.isArray(options[key])) {
	      queryString += ', ' + key + ' = \'' + JSON.stringify(options[key]) + '\''; //stringify unplayedCards and playedCards
	    } else {
	      queryString += ', ' + key + ' = \'' + options[key] + '\'';
	    }
	  }

	  if (next) {
	    queryString += ', ' + next.handName + ' = \'' + JSON.stringify(next.hand) + '\'';
	  }

	  // lastly concatenate the WHERE condition
	  queryString += ' WHERE gameId = \'' + gameId + '\';';

	  return promiseQuery(queryString, true);
	};

	module.exports = {

	  //--------------- GAME RETRIEVAL --------------------------------------//

	  getGame: function getGame(gameId, callback) {
	    console.log('getGame model:', gameId);
	    promiseQuery('\n      SELECT\n        games.*,\n        users.username,\n        users.userId,\n        gamesByUser.position\n      FROM\n        games\n      INNER JOIN\n        gamesByUser\n      INNER JOIN\n        users\n      WHERE\n        games.gameId = \'' + gameId + '\'\n      AND\n        games.gameId = gamesByUser.gameId\n      AND\n        users.userId = gamesByUser.userId;\n      ').then(function (rows) {

	      // this cleans up / reformats the json sent back to client to make easier to work with
	      var players = rows.map(function (row) {
	        return {
	          username: row.username,
	          userId: row.userId,
	          position: row.position,
	          positionName: 'p' + row.position + 'Hand',
	          hand: row['p' + row.position + 'Hand']
	        };
	      });

	      var object = {
	        gameId: rows[0].gameId,
	        unplayedCards: rows[0].unplayedCards,
	        playedCards: rows[0].playedCards,
	        currentPlayer: rows[0].currentPlayer,
	        direction: rows[0].direction,
	        gameComplete: rows[0].gameComplete,
	        players: players
	      };

	      callback(object);
	    }).catch(function (err) {
	      console.log('Caught error:', err);
	    });

	    // game retrieval
	  },

	  allGames: function allGames(userId, callback) {
	    promiseQuery('\n      SELECT\n        games.*\n      FROM\n        games\n      INNER JOIN\n        gamesByUser\n      WHERE\n        gamesByUser.userId = \'' + userId + '\'\n      AND\n        games.gameId = gamesByUser.gameId\n      AND\n        (games.gameComplete = 0 OR 1);\n      ', true).then(function (rows) {
	      console.log(rows, 'getMyGames success');
	      callback(rows);
	    });
	    // retrieve all of a users ongoing games
	  },

	  //--------------- GAME ACTIONS --------------------------------------//

	  createGame: function createGame(userId, callback) {
	    userId = Number(userId);

	    //First insert in to games table...
	    // When the game hasn't started, we store the userId at the p#Hand field
	    // as a convenience method to keep track of how many players have joined
	    promiseQuery('\n      INSERT\n      INTO\n        games\n        ( gameComplete, p0Hand )\n      VALUES\n        ( 0, \'' + userId + '\');\n      ', true).then(function (rows) {

	      // ...then use insertId to insert into gamesByUser table
	      // player position is set based on join order
	      var gameId = Number(rows.insertId);
	      return insertIntoGamesByUser(userId, gameId, position);
	      // return promiseQuery(
	      //   `
	      //   INSERT
	      //   INTO
	      //     gamesByUser
	      //     ( gameId, userId, position )
	      //   VALUES
	      //     ( '${insertId}', '${userId}', 0 );
	      //   `, true);
	      // .then((rows) => {
	      //   console.log('createGame success!');
	      //   callback(rows);
	      // });
	    }).then(function (rows) {
	      console.log('createGame success!');
	      callback(rows);
	    }).catch(function (err) {
	      console.log('Caught error', err);
	    });
	  },

	  joinGame: function joinGame(userId, gameId, callback) {
	    userId = Number(userId);
	    gameId = Number(gameId);

	    //it could be useful to first check if userId exists, before creating any rows

	    //select the requested row from games
	    promiseQuery('\n      SELECT\n        *\n      FROM\n        games\n      WHERE\n        gameId = \'' + gameId + '\'\n      LIMIT 1;\n      ', true).then(function (rows) {

	      //check the positions from 1 to 3 to see if any are null
	      var position = !rows[0].p1Hand ? 1 : !rows[0].p2Hand ? 2 : !rows[0].p3Hand ? 3 : 'gameFull';
	      var positionName = 'p' + position + 'Hand';
	      console.log('myPosition:', position, positionName);

	      // -------------- Errors -----------------------//
	      if (position === 'gameFull') {
	        throw 'Error -> gameFull';
	      }

	      var queryString = '\n        UPDATE\n          games\n        SET\n          ' + positionName + ' = ' + userId + '\n        WHERE\n          gameId = ' + gameId + ';\n        ';

	      //if this player just took up the last spot, then initialize the game
	      if (position === 3) {

	        // call gameInit(4) to initialize with 4 players

	        var _gameInit = gameInit(4);

	        var unplayedCards = _gameInit.unplayedCards;
	        var playedCards = _gameInit.playedCards;
	        var currentPlayer = _gameInit.currentPlayer;
	        var p0Hand = _gameInit.p0Hand;
	        var p1Hand = _gameInit.p1Hand;
	        var p2Hand = _gameInit.p2Hand;
	        var p3Hand = _gameInit.p3Hand;

	        //convertCardsToTuples formats an array of cards so that it is more terse (tuples)
	        // making it easier to read in the database

	        queryString = '\n          UPDATE\n            games\n          SET\n            ' + positionName + ' = ' + userId + ',\n            unplayedCards = \'' + JSON.stringify(convertCardsToTuples(unplayedCards)) + '\',\n            playedCards = \'' + JSON.stringify(convertCardsToTuples(playedCards)) + '\',\n            currentPlayer = \'' + currentPlayer + '\',\n            p0Hand = \'' + JSON.stringify(convertCardsToTuples(p0Hand)) + '\',\n            p1Hand = \'' + JSON.stringify(convertCardsToTuples(p1Hand)) + '\',\n            p2Hand = \'' + JSON.stringify(convertCardsToTuples(p2Hand)) + '\',\n            p3Hand = \'' + JSON.stringify(convertCardsToTuples(p3Hand)) + '\',\n            direction = 1,\n            gameComplete = 1\n          WHERE\n            gameId = ' + gameId + ';\n          ';
	      }

	      //then update the position in games table...
	      return promiseQuery(queryString, true);
	      // .then((rows) => {
	      //   return insertIntoGamesByUser(userId, gameId, position);

	      // promiseQuery(
	      //   `
	      //   INSERT
	      //   INTO
	      //     gamesByUser
	      //     ( gameId, userId, position )
	      //   VALUES
	      //     ( '${gameId}', '${userId}', '${position}' );
	      //   `, true)
	      // .then((rows) => {
	      //   callback();
	      // });
	      // });
	      // }
	    }).then(insertIntoGamesByUser(userId, gameId, position)).then(callback).catch(function (err) {
	      console.log('Caught error:', err);
	    });
	  },

	  startGame: function startGame(userId, gameId, callback) {
	    userId = Number(userId);
	    gameId = Number(gameId);

	    var _gameInit2 = gameInit(4);

	    var unplayedCards = _gameInit2.unplayedCards;
	    var playedCards = _gameInit2.playedCards;
	    var currentPlayer = _gameInit2.currentPlayer;
	    var p0Hand = _gameInit2.p0Hand;
	    var p1Hand = _gameInit2.p1Hand;
	    var p2Hand = _gameInit2.p2Hand;
	    var p3Hand = _gameInit2.p3Hand;
	  },

	  drawCard: function drawCard(userId, gameId, callback) {
	    userId = Number(userId);
	    gameId = Number(gameId);

	    getGameState(userId, gameId).then(function (_ref2) {
	      var unplayedCards = _ref2.unplayedCards;
	      var handName = _ref2.handName;
	      var myHand = _ref2.myHand;
	      var myPosition = _ref2.myPosition;
	      var currentPlayer = _ref2.currentPlayer;


	      // Handle erros and cheating
	      if (currentPlayer !== myPosition) {
	        throw 'Not your turn to play! ' + currentPlayer + ' !== ' + myPosition;
	      }

	      myHand.push(unplayedCards.pop());
	      return {
	        handName: handName,
	        myHand: myHand,
	        gameId: gameId,
	        options: {
	          unplayedCards: unplayedCards
	        }
	      };
	    }).then(updateGameState).then(function (rows) {
	      callback(rows);
	    }).catch(function (err) {
	      console.log('Caught error', err);
	    });
	  },

	  myTurn: function myTurn(_ref3, callback) {
	    var userId = _ref3.userId;
	    var gameId = _ref3.gameId;
	    var cardIndex = _ref3.cardIndex;
	    var wildColor = _ref3.wildColor;

	    userId = Number(userId);
	    gameId = Number(gameId);
	    cardIndex = Number(cardIndex);
	    var gameOver = false;

	    getGameState(userId, gameId).then(function (_ref4) {
	      var unplayedCards = _ref4.unplayedCards;
	      var playedCards = _ref4.playedCards;
	      var handName = _ref4.handName;
	      var myHand = _ref4.myHand;
	      var myPosition = _ref4.myPosition;
	      var currentPlayer = _ref4.currentPlayer;
	      var direction = _ref4.direction;
	      var playerCount = _ref4.playerCount;
	      var nextHandName = _ref4.nextHandName;
	      var nextHand = _ref4.nextHand;


	      // Handle errors and cheating
	      if (currentPlayer !== myPosition) {
	        throw 'Not your turn to play! ' + currentPlayer + ' !== ' + myPosition;
	      }
	      if (!myHand[cardIndex]) {
	        throw 'Card does not exist at index: ' + cardIndex;
	      }
	      if (myHand[cardIndex][0] !== playedCards[playedCards.length - 1][0] && myHand[cardIndex][1] !== playedCards[playedCards.length - 1][1] && myHand[cardIndex][1] !== 1) {
	        throw 'Illegal card play, colors or numbers must match, or wild card: ' + cardIndex;
	      }

	      // --------- helpers for special cards ---------------------------

	      var take = function take(count) {
	        while (count > 0) {
	          nextHand.push(unplayedCards.pop());
	          count--;
	        }
	      };

	      var setWildColor = function setWildColor(card, wildColor) {
	        var colors = { r: 1, g: 1, b: 1, y: 1 };

	        //confirm if the wildColor is legit
	        if (!colors[wildColor]) {
	          throw 'Invalid wildColor,' + wildColor;
	        }
	        card[1] = wildColor;
	        return card;
	      };

	      var specials = {
	        'reverse': function reverse() {
	          direction = direction === 0 ? 1 : 0;
	        },
	        'skip': function skip() {
	          currentPlayer = getNextPlayer(currentPlayer, direction, playerCount);
	        },
	        'takeTwo': function takeTwo() {
	          take(2);
	        },
	        'wild': function wild() {
	          card = setWildColor(card, wildColor);
	        },
	        'takeFour': function takeFour() {
	          card = setWildColor(card, wildColor);
	          take(4);
	        }
	      };

	      //------------------------------------------------------------------

	      //card that is to be played -- remove from the players hand and put it on the playedCards deck
	      var spliced = myHand.splice(cardIndex, 1);
	      var card = spliced[0];
	      playedCards.push(card);
	      console.log('Player wants to play', card);

	      //play special cards
	      if (isNaN(card[0])) {
	        specials[card[0]]();
	      }

	      //then set currentPlayer 
	      currentPlayer = getNextPlayer(currentPlayer, direction, playerCount);

	      var object = {
	        handName: handName,
	        myHand: myHand,
	        gameId: gameId,
	        options: {
	          unplayedCards: unplayedCards,
	          playedCards: playedCards,
	          currentPlayer: currentPlayer,
	          direction: direction
	        }
	      };

	      if (card[0] === 'takeTwo' || card[0] === 'takeFour') {
	        object.next = {
	          handName: nextHandName,
	          hand: nextHand
	        };
	      }

	      if (myHand.length === 0) {
	        gameOver = true;
	      }
	      return object;
	    }).then(updateGameState).then(function (rows) {
	      rows.gameOver = gameOver;
	      callback(rows);
	    }).catch(function (err) {
	      console.log('Caught error', err);
	    });
	  },

	  updateScore: function updateScore(userId, score, callback) {
	    // tested, not assigned to an endpoint
	    promiseQuery('\n      UPDATE\n        users\n      SET\n        score = (score + ' + score + ')\n      WHERE\n        userId = ' + userId + ';\n      ', true).then(function (rows) {
	      callback(rows);
	    });
	  }

	};

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var db = __webpack_require__(12);
	var Promise = __webpack_require__(18);

	// use this in lieu of db.query to prevent callback hell

	// pass in any truthy value as the 2nd (debug) argument to console.log queryStrings on server
	module.exports = function (queryString, debug) {
	  return new Promise(function (resolve, reject) {
	    if (debug) {
	      console.log(queryString);
	    } //set debug to true to log queries;

	    db.query(queryString, function (err, rows) {
	      if (err) {
	        reject(err);
	      } else {
	        resolve(rows);
	      }
	    });
	  });
	};

/***/ },
/* 18 */
/***/ function(module, exports) {

	module.exports = require("bluebird");

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _require = __webpack_require__(20);

	var makeNewDeck = _require.makeNewDeck;
	var dealCards = _require.dealCards;


	module.exports = function (numPlayers) {
	  //create a shuffled deck
	  var deck = makeNewDeck();

	  //create a placeholder array for the players
	  var players = Array(numPlayers).fill(1).map(function (val, i) {
	    return {
	      position: i,
	      positionName: 'p' + i + 'Hand',
	      hand: []
	    };
	  });

	  //deal cards to the players and start the discard pile
	  var discardPile = dealCards(deck, players);

	  //pick a random first player
	  var currentPlayer = Math.floor(Math.random() * numPlayers);

	  //return an object with keys/properties needed for database
	  return {

	    unplayedCards: deck,
	    playedCards: discardPile,
	    currentPlayer: currentPlayer,
	    p0Hand: players[0].hand,
	    p1Hand: players[1].hand,
	    //p0 and p1 are in every game, p2 & p3 -> check if they exist, otherwise set to null
	    p2Hand: players[2] ? players[2].hand : null,
	    p3Hand: players[3] ? players[3].hand : null
	  };
	};

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var _ = __webpack_require__(21);

	var Card = function Card(val, color) {
	  _classCallCheck(this, Card);

	  this.val = val;
	  this.color = color;
	};

	// -------------------- start of game actions -------------------- //

	// create a new deck for the game


	var makeNewDeck = function makeNewDeck() {
	  var deck = [];

	  var colors = ['red', 'green', 'blue', 'yellow'];

	  var deckBreakdown = {
	    0: 1,
	    1: 2,
	    2: 2,
	    3: 2,
	    4: 2,
	    5: 2,
	    6: 2,
	    7: 2,
	    8: 2,
	    9: 2,
	    skip: 2,
	    reverse: 2,
	    takeTwo: 2
	  };

	  var colorless = {
	    wild: 4,
	    takeFour: 4
	  };

	  var _iteratorNormalCompletion = true;
	  var _didIteratorError = false;
	  var _iteratorError = undefined;

	  try {
	    for (var _iterator = colors[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	      var color = _step.value;

	      for (var cardType in deckBreakdown) {
	        for (var _i = 0; _i < deckBreakdown[cardType]; _i++) {
	          deck.push(new Card(cardType, color));
	        }
	      }
	    }
	  } catch (err) {
	    _didIteratorError = true;
	    _iteratorError = err;
	  } finally {
	    try {
	      if (!_iteratorNormalCompletion && _iterator.return) {
	        _iterator.return();
	      }
	    } finally {
	      if (_didIteratorError) {
	        throw _iteratorError;
	      }
	    }
	  }

	  for (var each in colorless) {
	    for (var i = 0; i < colorless[each]; i++) {
	      deck.push(new Card(each, true));
	    }
	  }

	  deck = _.shuffle(deck);

	  return deck;
	};

	var dealCards = function dealCards(deck, players) {
	  // deals each player 7 cards
	  for (var i = 0; i < 7; i++) {
	    var _iteratorNormalCompletion2 = true;
	    var _didIteratorError2 = false;
	    var _iteratorError2 = undefined;

	    try {
	      for (var _iterator2 = players[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	        var player = _step2.value;

	        //the 'top' of the deck will be the card at the highest index
	        player.hand.push(deck.pop());
	      }
	    } catch (err) {
	      _didIteratorError2 = true;
	      _iteratorError2 = err;
	    } finally {
	      try {
	        if (!_iteratorNormalCompletion2 && _iterator2.return) {
	          _iterator2.return();
	        }
	      } finally {
	        if (_didIteratorError2) {
	          throw _iteratorError2;
	        }
	      }
	    }
	  }

	  // add a card to the discardPile
	  var discardPile = [deck.pop()];
	  return discardPile;
	};

	// --------------------- turn by turn actions -------------------- //

	// player pickup
	var takeCard = function takeCard(player, numberOfCards) {
	  numberOfCards = numberOfCards || 1;
	  for (var card = 0; card < numberOfCards; card++) {
	    player.hand.push(deck.pop());
	  }

	  return true;
	};

	// player discard
	var layDownCard = function layDownCard(player, cardIndex) {
	  if (player.hand.length === 0) {
	    console.log('...but you won...');
	  }

	  var discard = player.hand.splice(cardIndex, 1);

	  discardPile.push(discard);

	  return true;
	};

	// reshuffle the deck when necessary (could automate this...)
	var shuffleDiscardPile = function shuffleDiscardPile() {
	  deck = _.shuffle(discardPile);

	  discardPile = [];

	  discardPile.push(deck.pop());

	  return true;
	};

	// check if discard is valid, then discard
	var isCardValid = function isCardValid(card) {
	  var lastCard = discardPile[discardPile.length - 1];

	  if (card.color === lastCard.color || card.val === lastCard.val) {
	    return true;
	  }

	  return false;
	};

	module.exports = {
	  makeNewDeck: makeNewDeck,
	  dealCards: dealCards,
	  takeCard: takeCard,
	  shuffleDiscardPile: shuffleDiscardPile,
	  isCardValid: isCardValid
	};

/***/ },
/* 21 */
/***/ function(module, exports) {

	module.exports = require("lodash");

/***/ },
/* 22 */
/***/ function(module, exports) {

	'use strict';

	module.exports = {
	  convertCardsToTuples: function convertCardsToTuples(cards) {
	    return cards.map(function (card) {
	      var val = isNaN(card.val) ? card.val : Number(card.val);
	      var color = card.color === true ? 1 : card.color[0];
	      return [val, color];
	    });
	  },

	  getNextPlayer: function getNextPlayer(currentPlayer, direction, playerCount) {
	    direction === 1 ? currentPlayer++ : currentPlayer--;

	    if (currentPlayer >= playerCount) {
	      currentPlayer = 0;
	    }
	    if (currentPlayer < 0) {
	      currentPlayer = playerCount - 1;
	    }
	    return currentPlayer;
	  }
	};

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var url = __webpack_require__(24);
	var WebSocketServer = __webpack_require__(25).Server;
	var gameModel = __webpack_require__(16);

	var wsRoutes = {

	  //--------------- GAME RETRIEVAL --------------------//

	  getGame: function getGame(ws, req) {

	    gameModel.getGame(req.gameId, function (rows) {
	      console.log('getGame callback', rows);
	      ws.send(JSON.stringify(rows));
	    });
	  },

	  allGames: function allGames(ws, req) {
	    gameModel.allGames(req.userId, function (rows) {
	      console.log('allGames callback', req.userId, rows);
	      ws.send(JSON.stringify(rows));
	    });
	  },

	  //--------------- GAME ACTIONS --------------------//

	  createGame: function createGame(ws, req) {
	    gameModel.createGame(req.userId, function (rows) {
	      console.log('createGame callback');
	      ws.send(JSON.stringify(rows)); // make this a boolean?
	    });
	  },

	  joinGame: function joinGame(ws, req) {
	    var userId = req.userId;
	    var gameId = req.gameId;

	    console.log('joinGame in controller', req);
	    gameModel.joinGame(userId, gameId, function (rows) {
	      console.log('joinGame complete');
	      //socket call to players in this game showing that username has joined!
	      ws.send(JSON.stringify(rows)); // boolean?
	    });
	  },

	  startGame: function startGame(ws, req) {
	    var userId = req.userId;
	    var gameId = req.gameId;


	    gameModel.startGame(userId, gameId, function () {
	      console.log('startGame complete');
	      //socket call to players in this game showing that game has started
	      ws.send(JSON.stringify(rows));
	    });
	  },

	  drawCard: function drawCard(ws, req) {
	    var userId = req.userId;
	    var gameId = req.gameId;


	    gameModel.drawCard(userId, gameId, function (rows) {
	      console.log('drawCard complete');
	      //socket call to players in this game showing draw card
	      ws.send(JSON.stringify(rows));
	    });
	  },

	  myTurn: function myTurn(ws, req) {
	    //cardIndex is the index of the card to be played
	    // var {userId, gameId, cardIndex, wildColor} = req;

	    gameModel.myTurn(req, function (rows) {
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
	  }
	};

	//--------------- ESTABLISH WEBSOCKET CONNECTION --------------------//

	module.exports = function (server) {

	  var wss = new WebSocketServer({ server: server });

	  wss.on('connection', function (ws) {
	    var location = url.parse(ws.upgradeReq.url, true);

	    ws.on('message', function (data) {
	      console.log('received data', data);
	      var parsed = JSON.parse(data);
	      var route = parsed.route;

	      if (wsRoutes[route]) {
	        wsRoutes[route](ws, parsed);
	      } else {
	        console.log('Error -------- route does not exist', route);
	      }
	    });

	    console.log('websocket client connected to server');
	  });
	};

/***/ },
/* 24 */
/***/ function(module, exports) {

	module.exports = require("url");

/***/ },
/* 25 */
/***/ function(module, exports) {

	module.exports = require("ws");

/***/ }
/******/ ]);