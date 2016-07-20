'use strict';

var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var db = require('./dbStart.js');
var __SALT = 10;

module.exports = {
  verifyPassword: function(username, password, callback) {
    db.query(
      `
      SELECT
        password
      FROM
        users
      WHERE
        username = '${username}';
      `, function(err, rows) {
        if (err) {
          console.log('err on hash retrieval query', err);
        } else {
          console.log(rows, ' hash retrieval success');
          bcrypt.compare(password, rows[0].password, function(err, res) {
            if (err) {
              console.log('err on bcryptCompare', err);
            } else {
              callback(res)
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

  retrieveScore: function (username) {
    db.query(
      `
      SELECT
        score
      FROM
        users
      WHERE
        username = ${username};
      `, function (err, rows) {
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

  newUser: function(username, password, callback) {
    bcrypt.genSalt(__SALT, function(err, salt) {
      bcrypt.hash(password, salt, null, function(err, hash) {
        if (err) {
          console.log(err, ' hash/salt error');
        } else {
          db.query(
            `
            INSERT INTO
              users (username, password, salt, score)
            VALUES
              ('${username}', '${hash}', '${salt}', 0);
            `,
            function (err, rows) {
              if (err) {
                console.log('error on DB insert' + err);
              } else {
                console.log(rows + ' write success');
                callback(rows);
              }
            }
          );
        }
      });
    });

    // function to store new user with raw sql
    // presumably, this is for the initial signup to store a given pass
  },

  doesUserExist: function (username, callback) {
    db.query(
      `
      SELECT
        *
      FROM
        users
      WHERE
        username = '${username}';
      `, function (err, rows) {
        if (err) {
          console.log('err on user retrieval query', err);
        } else {
          console.log(rows, ' user retrieval success');
          callback(rows[0]); // should be a boolean
        }
      });

    // array would be empty if username doesn't have any records
  },

  retrieveTopTenScores: function (callback) {
    db.query(
      `
      SELECT
        username, scoring
      FROM
        users
      ORDER BY scoring desc
      limit 10;
      `, function (err, rows) {
      if (err) {
        console.log('err on retrieveScore query', err);
      } else {
        console.log(rows, ' score retrieval success');
        callback(rows);
      }
    });

    // simple score retrieval
    // for simplicity, no pass check to retrieve score since we'll use for leaderboards
  },

};
