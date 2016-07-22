'use strict';

var userModel = require('./userModel.js');

module.exports = {
  signin: (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let userId = null;
    userModel.doesUserExist(username, (bool) => {
      if (!bool) {
        console.log('Username/Password combination does not exist');
        res.json('Username/Password combination does not exist');
      } else {
        userId = bool.userId;
        console.log('user exists');
        userModel.verifyPassword(username, password, (user) => {
          if (!user) {
            let response = {
              response: 'negative',
            };
            res.json(response);
          } else {
            // auth/passport stuff for later
            let response = {
              response: 'affirmative',
              username: username,
              userId: userId,
            };
            res.json(response);
            // @evan, I'm responding with the same route and the response if
            // username/password was valid
          }
        });
      }
    });
  },

  signup: (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    userModel.doesUserExist(username, (bool) => {
      if (bool) {
        console.log('Username in use!');
        res.json('Username in use!');
      } else {
        userModel.newUser(username, password, (rows) => {
          let response = {
            response: 'affirmative',
            username: username,
            userId: rows[0].userId,
          };
          res.json(response);
        });
      }
    });

  },

  singleUserScore: (req, res) => {
    let username = req.body.username;

    if (!userModel.doesUserExist(username)) {
      // user does not exist
      console.log('Username does not exist!');
      res.redirect('/');
      return;
    };

    userModel.retrieveScore(username, (val) => {
      // res.end(JSON.stringify(val[0]));
      res.json(val[0]);
    });
  },

  topTenScores: (req, res) => {
    userModel.retrieveTopTenScores((arr) => {
      res.end(arr);
    });
  },
};
