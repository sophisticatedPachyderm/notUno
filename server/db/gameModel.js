var mysql = require('mysql');
var db = require('./dbStart.js');

module.exports = {
  getGame: function(gameId) {
    db.query(
      `
      SELECT
        games.*
        users.username 
      FROM
        games
      INNER JOIN
        gamesByUsers
      INNER JOIN
        users
      WHERE
        games.id = '${gameId}';
      AND
        games.id = gamesByUsers.gameId
      AND
        users.id = gamesByUsers.userId
      `, function(err, rows) {
      if (err) {
        console.log('err on getGame query', err);
      } else {
        console.log(rows, 'getGame success');
      }
    });

    // game retrieval
  },

  getMyGames: function(userId) {
    db.query(
      `
      SELECT
        games.*
      FROM
        games
      INNER JOIN
        gamesByUsers
      WHERE
        gamesByUsers.userId = '${userId}';
      AND
        games.id = gamesByUsers.gameId
      AND
        games.complete = '${false}'
      `, function(err, rows) {
      if (err) {
        console.log('err on getMyGames query', err);
      } else {
        console.log(rows, 'getMyGames success');
      }
    });
    // retrieve all of a users ongoing games
    // can we assume the client will pass us the userId (or from session) and does not need other user info
    // also means that games screen will not show names of other players
  },

  updateGame: function(userId, gameId, playDeck, drawDeck, userHand, userPosition, currentPlayer, direction, complete) {
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
        id = '${gameId}';
      `, function(err, rows) {
      if (err) {
        console.log('err on updateGame', err);
      } else {
        console.log(rows, 'updateGame success');
      }
    });
    // assumes client will have access to gameId, drawDeck, and userPosition (i.e. p0, p1, p2, p3)
  },

  completeGame: function(userId, score) {
    db.query(
      `
      UPDATE
        users
      SET
        score = score + '${score}',
      WHERE
        userId = '${userId}';
      `, function(err, rows) {
      if (err) {
        console.log('err on completeGame', err);
      } else {
        console.log(rows, 'completeGame success');
      }
    });
  }
};
