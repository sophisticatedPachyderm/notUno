const mysql = require('mysql');
const db = require('./dbStart.js');
const promiseQuery = ('./promiseQuery.js');

module.exports = {

//--------------- GAME RETRIEVAL --------------------//

  getGame: (gameId, callback) => {

    promiseQuery(`
      SELECT
        games.*,
        users.username
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
      `, true)
    .then((rows) => {
      console.log(rows, 'getGame success');
      callback(rows);  
    });

    // game retrieval
  },

  allGames: (userId, callback) => {
    promiseQuery(
      `
      SELECT
        games.*
      FROM
        games
      INNER JOIN
        gamesByUser
      WHERE
        gamesByUser.userId = '${userId}'
      AND
        games.gameId = gamesByUser.gameId
      AND
        (games.gameComplete = 0 OR 1);
      `, true)
    .then((rows) => {
      console.log(rows, 'getMyGames success');
      callback(rows);
    });
    // retrieve all of a users ongoing games
  },


//--------------- GAME ACTIONS --------------------//
//see routes for high-level descriptions on each action


  createGame: (userId, callback) => {
    userId = Number(userId);
    
    //First insert in to games table...
    // When the game hasn't started, we store the userId at the p#Hand field
    // as a convenience method to keep track of how many players have joined
    promiseQuery(`
      INSERT
      INTO
        games
        ( gameComplete, p0Hand )
      VALUES
        ( 0, '${userId}');
      `, true)
    .then((rows) => {

      // ...then use insertId to insert into gamesByUser table
      // player position is set based on join order
      var insertId = Number(rows.insertId);
      promiseQuery(
        `
        INSERT
        INTO
          gamesByUser
          ( gameId, userId, position )
        VALUES
          ( '${insertId}', '${userId}', 0 );
        `, true)
      .then((rows) => {
        console.log('createGame success!');
        callback(rows);
      });
    });
  },

  joinGame: (userId, gameId, callback) => {
    userId = Number(userId);
    gameId = Number(gameId);

    //select the requested row from games
    promiseQuery(
      `
      SELECT
        *
      FROM
        games
      WHERE
        gameId = '${gameId}'
      LIMIT 1;
      `, true)
    .then((rows) => {

      //check the positions from 1 to 3 to see if any are null
      var position = !rows[0].p1Hand ? 1 : !rows[0].p2Hand ? 2 : !rows[0].p3Hand ? 3 : 'gameFull';
      var positionName = 'p' + position + 'Hand';
      console.log('myPosition:', position, positionName);
      if (position === 'gameFull') {
        // do error

      } else {
        
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
          // return object with needed values for db

          var {unplayedCards, playedCards, currentPlayer, p0Hand, p1Hand, p2Hand, p3Hand} = gameInit(4);

          queryString = `
            UPDATE
              games
            SET
              ${positionName} = ${userId},
              unplayedCards = '${unplayedCards}',
              playedCards = '${playedCards}',
              currentPlayer = '${currentPlayer}',
              p0Hand = '${p0Hand}',
              p1Hand = '${p1Hand}',
              p2Hand = '${p2Hand}',
              p3Hand = '${p3Hand}',
              direction = 1,
              gameComplete = 1
            WHERE
              gameId = ${gameId};
            `;
        }

        //then update the position in games table...
        promiseQuery(queryString, true)
        .then((rows) => {
          promiseQuery(
            `
            INSERT
            INTO
              gamesByUser
              ( gameId, userId, position )
            VALUES
              ( '${gameId}', '${userId}', '${position}' );
            `, true)
          .then((rows) => {
            callback();
          });
        });
      }
    });
  },

  myTurn: (parameters, callback) => {
    // NOT TESTED YET
    var {userId, gameId, playDeck, drawDeck, userHand, userPosition, currentPlayer, direction, complete} = parameters;

    promiseQuery(
      `
      UPDATE
        games
      SET
        '${userPosition + 'Hand'}' = '${userHand}',
        playDeck = '${playDeck}',
        drawDeck = '${drawDeck}',
        currentPlayer = '${currentPlayer}',
        direction = '${direction}',
        complete = '${complete}'
      WHERE
        gameId = '${gameId}';
      `, true)
    .then((rows) => {
      console.log(rows, 'myTurn success');
      callback(rows);
    });

    // assumes client will have access to gameId, drawDeck, and userPosition (i.e. p0, p1, p2, p3)
  },

  updateScore: (userId, score, res) => {
    // tested, not assigned to an endpoint
    db.query(
      `
      UPDATE
        users
      SET
        score = (score + ${score})
      WHERE
        userId = ${userId};
      `, (err, rows) => {
      if (err) {
        console.log('err on completeGame', err);
      } else {
        console.log(rows, 'completeGame success');
        res.send('complete');
        res.end();
      }
    });
  },

};
