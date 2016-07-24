'use strict';

const { promiseQuery, initPromise } = require('./promiseQuery.js');
const gameInit = require('./../gameLogic/gameInit.js');
const { convertCardsToTuples, getNextPlayer } = require('./../gameLogic/gameTools.js');


//--------------- GAME HELPER FUNCTIONS --------------------------------------//


const insertIntoGamesByUser = (userId, gameId, position) => {
  return promiseQuery(
    `
    INSERT
    INTO
      gamesByUser
      ( gameId, userId, position )
    VALUES
      ( '${gameId}', '${userId}', '${position}' );
    `, true);
};

const verifyUser = (userId) => {
  return promiseQuery(
    `
    SELECT
      username
    FROM
      users
    WHERE
      userId = '${userId}'
      ;
    `, true)
  .then((rows) => {
    if (!rows[0]) {
      throw 'UserId does not exist';
    }
  });
};

const gameQueryBasic = (rows) => {
  return promiseQuery(
  `
  SELECT
    *
  FROM
    games
  WHERE
    gameId = '${rows.gameId}'
  LIMIT 1;
  `, true);
};

const getStartGameQueryString = (gameId, numPlayers) => {
  var {unplayedCards, playedCards, currentPlayer, p0Hand, p1Hand, p2Hand, p3Hand} = gameInit(numPlayers);
  if (p2Hand) { p2Hand = JSON.stringify( convertCardsToTuples(p2Hand) ); }
  if (p3Hand) { p3Hand = JSON.stringify( convertCardsToTuples(p3Hand) ); }

  var queryString = `
    UPDATE
      games
    SET
      unplayedCards = '${JSON.stringify( convertCardsToTuples(unplayedCards) )}',
      playedCards = '${JSON.stringify( convertCardsToTuples(playedCards) )}',
      currentPlayer = '${ currentPlayer }',
      p0Hand = '${JSON.stringify( convertCardsToTuples(p0Hand) )}',
      p1Hand = '${JSON.stringify( convertCardsToTuples(p1Hand) )}',
      p2Hand = '${p2Hand}',
      p3Hand = '${p3Hand}',
      direction = 1,
      gameComplete = 1
    WHERE
      gameId = ${gameId};
    `;

  return {
    queryString: queryString,
    gameState: { 
      currentPlayer: currentPlayer,
      unplayedCards: unplayedCards,
      playedCards: playedCards,
      p0Hand: p0Hand,
      p1Hand: p1Hand,
      p2Hand: p2Hand,
      p3Hand: p3Hand,
    }
  };
};

const getPlayerCount = (rows) => {
  var playerCount = rows[0].p1Hand === null ? 1 : rows[0].p2Hand === null ? 2 : rows[0].p3Hand === null ? 3 : 4;
  return playerCount;
};
// get the current state of the game from the dataase and parse / format it
const getGameState = (userId, gameId) => {
  return promiseQuery(
    `
    SELECT
      games.*,
      gamesByUser.position
    FROM
      games
    INNER JOIN
      gamesByUser
    WHERE
      games.gameId = '${gameId}'
    AND
      games.gameId = gamesByUser.gameId
    AND
      gamesByUser.userId = '${userId}'
      ;
    `, true)
  .then((rows) => {
    var unplayedCards = JSON.parse(rows[0].unplayedCards);
    var playedCards = JSON.parse(rows[0].playedCards);
    var handName = 'p' + rows[0].position + 'Hand';
    var myHand = JSON.parse(rows[0][handName]);

    //look at p#Hand to determine how many players
    var playerCount = rows[0].p2Hand === 'null' ? 2 : rows[0].p3Hand === 'null' ? 3 : 4;

    //we need to get the next Hand to handle takeTwo / takeFour cards played at myTurn
    var nextPosition = getNextPlayer(rows[0].currentPlayer, rows[0].direction, playerCount);
    var nextHandName = 'p' + nextPosition + 'Hand';
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
      nextPosition: nextPosition,
      myPosition: rows[0].position
    };
  });
};


// update the state of the game in the database after making a move like drawing a card or playing a card.
const updateGameState = ({handName, myHand, gameId, options, next}) => {

  //players own hand is always changed on any move (i.e. drawing a card or playing a card)
  //so we expect to always update the playersHand
  var queryString = `
    UPDATE
      games
    SET
      ${handName} = '${JSON.stringify(myHand)}'
    `;

  // then, concatenate any other gameState change that are passed in through options
  for (let key in options) {
    if (Array.isArray(options[key])) {
      queryString += `, ${key} = '${JSON.stringify(options[key])}'`;  //stringify unplayedCards and playedCards
    } else {
      queryString += `, ${key} = '${options[key]}'`;
    }
  }

  if (next) {
    queryString += `, ${next.handName} = '${JSON.stringify(next.hand)}'`;
  }

  // lastly concatenate the WHERE condition
  queryString += ` WHERE gameId = '${gameId}';`;

  return promiseQuery(queryString, true);
};

//consistently format errors
const createError = (err) => {
  console.log('Error:', err);
  return {
    response: 'negative',
    error: err
  };
};





module.exports = {

//--------------- GAME RETRIEVAL --------------------------------------//

  getGame: (gameId, callback) => {
    initPromise({gameId: gameId})
    .then(() => { 
      return promiseQuery(`
      SELECT
        games.*,
        users.username,
        users.userId,
        gamesByUser.position
      FROM
        games
      INNER JOIN
        gamesByUser
      INNER JOIN
        users
      WHERE
        games.gameId = '${gameId}'
      AND
        games.gameId = gamesByUser.gameId
      AND
        users.userId = gamesByUser.userId;
      `);
    })
    .then((rows) => {

      // this cleans up / reformats the json sent back to client to make easier to work with
      var players = rows.map((row) => {
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
        players: players,
        response: 'affirmative',
      };

      callback(object);
    })
    .catch((err) => {
      callback(createError(err));
    });

    // game retrieval
  },

  //get all games that are 'joinable' that i haven't already joined
  getOpenGames: (userId, callback) => {
    initPromise({userId: userId})
    .then(() => { 
      return promiseQuery(
      `
      SELECT
        *
      FROM
        games
      WHERE
        gameComplete = 0
      AND
        (p0Hand != ${userId} OR p0Hand IS NULL)
      AND
        (p1Hand != ${userId} OR p1Hand IS NULL)
      AND
        (p2Hand != ${userId} OR p2Hand IS NULL)
        ;
      `, true);
    })
    .then((rows) => {
      callback(rows);
    })
    .catch((err) => {
      callback(createError(err));
    });

  },

  allGames: (userId, callback) => {

    initPromise({userId: userId})
    .then(() => { 
      return promiseQuery(
      `
      SELECT
        gu.gameId,
        gu.userId,
        u.username,
        g.gameComplete
      FROM
        gamesByUser gu join users u
          on (gu.userId = u.userId)
          join games g
          on (g.gameId = gu.gameId)
      WHERE
        gu.gameId in (SELECT
          gameId
        FROM
          gamesByUser
        WHERE
          userId = ${userId});
      `, true);
    })
    .then((rows) => {
      console.log('retrieval success');
      let formatted = rows.reduce((output, row) => {
        if (output[row.gameId]) {
          output[row.gameId].usernameList.push(row.username);
          output[row.gameId].userIdList.push(row.userId);
        } else {
          output[row.gameId] = {
            usernameList: [row.username],
            userIdList: [row.userId],
            gameComplete: row.gameComplete
          };
        }
        return output;
      }, {});
      callback(formatted);
    })
    .catch((err) => {
      callback(createError(err));
    });
    // retrieve all of a users ongoing games
  },


//--------------- GAME ACTIONS --------------------------------------//


  createGame: (userId, callback) => {
    userId = Number(userId);
    var gameId;
    //First insert in to games table...
    // When the game hasn't started, we store the userId at the p#Hand field
    // as a convenience method to keep track of how many players have joined
    initPromise({userId: userId})
    // .then(() => {
    //   return verifyUser(userId);
    // })
    .then(() => { 
      return promiseQuery(`
      INSERT
      INTO
        games
        ( gameComplete, p0Hand )
      VALUES
        ( 0, '${userId}');
      `, true);
    })
    .then((rows) => {

      // ...then use insertId to insert into gamesByUser table
      // player position is set based on join order
      gameId = Number(rows.insertId);
      return insertIntoGamesByUser(userId, gameId, 0);
    })
    .then((rows) => {
      console.log('createGame success!');
      rows.response = 'affirmative',
      rows.gameId = gameId;
      callback(rows);
    })
    .catch((err) => {
      callback(createError(err));
    });
  },

  joinGame: (userId, gameId, callback) => {
    userId = Number(userId);
    gameId = Number(gameId);
    //it could be useful to first check if userId exists, before creating any rows
    var currentPlayer = null;
    var gameStarted = false;

    //select the requested row from games
    initPromise({userId: userId, gameId: gameId})
    .then(() => { 
      return promiseQuery(
      `
      SELECT
        *
      FROM
        games
      WHERE
        gameId = '${gameId}'
      LIMIT 1;
      `, true);
    })
    .then((rows) => {


      //check the positions from 1 to 3 to see if any are null
      var position = !rows[0].p1Hand ? 1 : !rows[0].p2Hand ? 2 : !rows[0].p3Hand ? 3 : 'gameFull';
      var positionName = 'p' + position + 'Hand';
      console.log('myPosition:', position, positionName);

      // -------------- Errors -----------------------//
      if (rows[0].gameComplete !== 0) { throw 'gameStarted'; }

      if (userId === Number(rows[0].p0Hand) || userId === Number(rows[0].p1Hand) || userId === Number(rows[0].p2Hand) || userId === Number(rows[0].p3Hand)) { throw 'alreadyJoined'; }

      if (position === 'gameFull') { throw 'gameFull'; }


      var queryString = `
        UPDATE
          games
        SET
          ${positionName} = ${userId}
        WHERE
          gameId = ${gameId};
        `;

      //if this player just took up the last spot, then initialize the game
      if (position === 3) {

        // call gameInit(4) to initialize with 4 players
        var {unplayedCards, playedCards, currentPlayer, p0Hand, p1Hand, p2Hand, p3Hand} = gameInit(4);

        //convertCardsToTuples formats an array of cards so that it is more concise (tuples)
        // making it easier to read in the database
        queryString = `
          UPDATE
            games
          SET
            unplayedCards = '${JSON.stringify( convertCardsToTuples(unplayedCards) )}',
            playedCards = '${JSON.stringify( convertCardsToTuples(playedCards) )}',
            currentPlayer = '${ currentPlayer }',
            p0Hand = '${JSON.stringify( convertCardsToTuples(p0Hand) )}',
            p1Hand = '${JSON.stringify( convertCardsToTuples(p1Hand) )}',
            p2Hand = '${JSON.stringify( convertCardsToTuples(p2Hand) )}',
            p3Hand = '${JSON.stringify( convertCardsToTuples(p3Hand) )}',
            direction = 1,
            gameComplete = 1
          WHERE
            gameId = ${gameId};
          `;
      }

        //then update the position in games table...
      return promiseQuery(queryString, true, {position: position});
    })
    .then((rows) => { return insertIntoGamesByUser(userId, gameId, rows.options.position); })
    .then((rows) => { 
      rows.response = 'affirmative',
      callback(rows); 
    })
    .catch((err) => {
      callback(createError(err));
    });
  },

  startGame: (userId, gameId, callback) => {
    userId = Number(userId);
    gameId = Number(gameId);

    initPromise({userId: userId, gameId: gameId})
    .then(gameQueryBasic)
    .then((rows) => {
      if (!rows[0]) { throw 'gameId not found!'; }
      if (rows[0].gameComplete !== 0) { throw 'Game has already started!'; }
      if (Number( rows[0].p0Hand ) !== userId) { throw 'You did not create this game!'; }

      console.log('rows:', rows[0]);
      var playerCount = getPlayerCount(rows);  
      if (playerCount < 2) { throw 'Cannot start a game with less than 2 players'; }

      var {queryString, gameState} = getStartGameQueryString(gameId, playerCount);
      console.log('query/gameState:', queryString, gameState);
      return promiseQuery(queryString, true, {gameState: gameState});
    })
    .then((rows) => {
      callback(rows.options.gameState);
    })
    .catch((err) => {
      callback(createError(err));
    });
  },

  drawCard: (userId, gameId, callback) => {
    userId = Number(userId);
    gameId = Number(gameId);
    var cardDrawn;

    initPromise({userId: userId, gameId: gameId})
    .then(() => { 
      return getGameState(userId, gameId);
    })
    .then(({unplayedCards, handName, myHand, myPosition, currentPlayer}) => {

      // Handle erros and cheating
      if (currentPlayer !== myPosition) { throw `Not your turn to play! ${currentPlayer} !== ${myPosition}`; }
      cardDrawn = unplayedCards.pop();
      myHand.push(cardDrawn);
      return {
        handName: handName,
        myHand: myHand,
        gameId: gameId,
        options: {
          unplayedCards: unplayedCards,
        }
      };
    })
    .then(updateGameState)
    .then((rows) => {
      rows.cardDrawn = cardDrawn;
      rows.userId = userId;
      rows.response = 'affirmative',
      callback(rows);
    })
    .catch((err) => {
      callback(createError(err));
    });
  },

  myTurn: ({userId, gameId, cardIndex, wildColor}, callback) => {
    userId = Number(userId);
    gameId = Number(gameId);
    cardIndex = Number(cardIndex);

    var response = {};

    initPromise({userId: userId, gameId: gameId})
    .then(() => { 
      return getGameState(userId, gameId);
    })
    .then(({unplayedCards, playedCards, handName, myHand, myPosition, currentPlayer, direction, playerCount, nextHandName, nextHand}) => {

      // Handle errors and cheating
      if (currentPlayer !== myPosition) { throw `Not your turn to play! ${currentPlayer} !== ${myPosition}`; }
      if (!myHand[cardIndex]) { throw `Card does not exist at index: ${cardIndex}`; }
      if (myHand[cardIndex][0] !== playedCards[playedCards.length - 1][0]
        && myHand[cardIndex][1] !== playedCards[playedCards.length - 1][1]
        && myHand[cardIndex][1] !== 1) { throw 'Illegal card play, colors or numbers must match, or wild card: ' + cardIndex; }


        // --------- helpers for special cards ---------------------------

      const take = (count) => {
        while (count > 0) {
          nextHand.push(unplayedCards.pop());
          count--;
        }
      };

      const setWildColor = (card, wildColor) => {
        const colors = {r: 1, g: 1, b: 1, y: 1};

        //confirm if the wildColor is legit
        if (!colors[wildColor]) { throw 'Invalid wildColor,' + wildColor; }
        card[1] = wildColor;
        return card;
      };

      const specials = {
        'reverse': () => { direction = direction === 0 ? 1 : 0; },
        'skip': () => { currentPlayer = getNextPlayer(currentPlayer, direction, playerCount); },
        'takeTwo': () => { take(2); },
        'wild': () => { card = setWildColor(card, wildColor); },
        'takeFour': () => {
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
      if (isNaN(card[0]) ) {
        specials[card[0]]();
      }

      //then set currentPlayer
      currentPlayer = getNextPlayer(currentPlayer, direction, playerCount);

      //object is sent to updateGameState for the db
      var object = {
        handName: handName,
        myHand: myHand,
        gameId: gameId,
        options: {
          unplayedCards: unplayedCards,
          playedCards: playedCards,
          currentPlayer: currentPlayer,
          direction: direction,
        },
      };

      //response is sent back to client
      response = {
        gameId: gameId,
        unplayedCards: unplayedCards,
        playedCards: playedCards,
        currentPlayer: currentPlayer,
        direction: direction,
        cardPlayed: card,
        userId: userId,
        gameOver: false
      };

      if (card[0] === 'takeTwo' || card[0] === 'takeFour') {
        object.next = {
          handName: nextHandName,
          hand: nextHand
        };
        response.nextHand = nextHand;
      }

      if (myHand.length === 0) { 
        object.options.gameComplete = 2;
        response.gameOver = true; 
      }
      return object;

    })
    .then(updateGameState)
    .then(() => {
      response.response = 'affirmative',
      callback(response);
    })
    .catch((err) => {
      callback(createError(err));
    });
  },

  updateScore: (userId, score, callback) => {
    // tested, not assigned to an endpoint
    promiseQuery(
      `
      UPDATE
        users
      SET
        score = (score + ${score})
      WHERE
        userId = ${userId};
      `, true)
    .then((rows) => {
      rows.response = 'affirmative',
      callback(rows);
    })
    .catch((err) => {
      callback(createError(err));
    });
  },

};
