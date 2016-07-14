var mysql = require('mysql');
var db = require('./dbStart.js');

module.exports = {
  // no errors, test again with join table
  getGame: function(gameId, res) {
    db.query(
      `
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
      `, function(err, rows) {
      if (err) {
        console.log('err on getGame query', err);
      } else {
        console.log(rows, 'getGame success');
        res.send(rows);
        res.end();
      }
    });

    // game retrieval
  },

  getMyGames: function(userId, res) {
    // no errors, test again when we have data in the join table
    db.query(
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
        games.gameComplete = '${false}';
      `, function(err, rows) {
      if (err) {
        console.log('err on getMyGames query', err);
      } else {
        console.log(rows, 'getMyGames success');
        res.send('temp');
        res.end();
      }
    });
    // retrieve all of a users ongoing games
    // can we assume the client will pass us the userId (or from session) and does not need other user info
    // also means that games screen will not show names of other players
  },

  updateGame: function(userId, gameId, playDeck, drawDeck, userHand, userPosition, currentPlayer, direction, complete) {
    // NOT TESTED YET
    db.query(
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
      `, function(err, rows) {
      if (err) {
        console.log('err on updateGame', err);
      } else {
        console.log(rows, 'updateGame success');
      }
    });
    // assumes client will have access to gameId, drawDeck, and userPosition (i.e. p0, p1, p2, p3)
  },

  completeGame: function(userId, score, res) {
    // tested, not assigned to an endpoint
    db.query(
      `
      UPDATE
        users
      SET
        score = (score + ${score})
      WHERE
        userId = ${userId};
      `, function(err, rows) {
      if (err) {
        console.log('err on completeGame', err);
      } else {
        console.log(rows, 'completeGame success');
        res.send('complete');
        res.end();
      }
    });
  }
};
