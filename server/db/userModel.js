var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var db = require('./dbStart.js');
var __SALT = 10;

module.exports = {
  verifyPassword: function (username, password) {
    var hashToCheck = db.query(
      `
      SELECT
        password
      FROM
        users
      WHERE
        username = ${username};
      `, function (err, rows) {
        if (err) {
          console.log('err on hash retrieval query', err);
        } else {
          console.log(rows, ' hash retrieval success');
        }
      })[0];

      // reminder to verify that mysql returns an array of results
      // this should be a 1x1 array

      return bcrypt.compare(password, hashToCheck, function (err, res) {
        if (err) {
          console.log('err on bcryptCompare', err);
        } else {
          return res;

          // boolean
        }
      });
  },

  retrieveScore: function (username) {
    db.query(
      `
      SELECT
        scoring
      FROM
        users
      WHERE
        username = ${username};
      `, function(err, rows) {
      if (err) {
        console.log('err on retrieveScore query', err);
      } else {
        console.log(rows, ' score retrieval success');
      }
    });

    // simple score retrieval
    // for simplicity, no pass check to retrieve score since we'll use for leaderboards
  },

  newUser: function (username, password) {
    bcrypt.genSalt(__SALT, function (err, salt) {
      bcrypt.hash(password, salt, function (err, hash) {
        if (err) {
          console.log(err, ' hash/salt error');
        } else {
          db.query(
            `
            INSERT INTO
              users (username, password, scoring)
            VALUES
              (${username}, ${hash}, 0);
            `,
            function (err, rows) {
              if (err) {
                console.log('error on DB insert' + err);
              } else {
                console.log(rows + ' write success');
              }
            });
        }
      });
    });

    // function to store new user with raw sql
    // presumably, this is for the initial signup to store a given pass
  },

  doesUserExist: function (username) {
    var userNameExistence = db.query(
      `
      SELECT
        *
      FROM
        users
      WHERE
        username = ${username};
      `, function (err, rows) {
        if (err) {
          console.log('err on hash retrieval query', err);
        } else {
          console.log(rows, ' hash retrieval success');
        }
      });

    return (userNameExistence.length < 1) ? false : true;

    // array would be empty if username doesn't have any records
  },

};
