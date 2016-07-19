'use strict';

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var userModel = require('../db/userModel.js');
var mysql = require('mysql');
var db = require('../db/dbStart.js');

passport.use(new LocalStrategy(
  (username, password, done) => {
    db.query(
      `
      SELECT
        username
      FROM
        users
      WHERE
        username = '${username}';
      `, (err, rows) => {
        if (err) {
          console.log(err, "error with strategy");
        } else {
          return done(null, rows[0]);
        }
      });
  }
));

passport.serializeUser((username, done) => {
  // passed from logIn
  // it's what we passed into login
  // mysql returns an array of objects as a results
  // each index is an object with the results
  done(null, username);
});

passport.deserializeUser(function(username, done) {
  // passport passes in a serial
  db.query(
    `
    SELECT
      username
    FROM
      users
    WHERE
      username = '${username}';
    `, (err, rows) => {
      if (err) {
        console.log(err, "error with strategy");
      } else {
        return done(null, rows[0]);
      }
    });
});
