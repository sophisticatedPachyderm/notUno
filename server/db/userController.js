'use strict';

var userModel = require('./userModel.js');

module.exports = {
  signin: function (ws, data) {
    var username = data.username;
    var password = data.password;
    userModel.doesUserExist(username, (bool) => {
      if (!bool) {
        // user does not exist
        console.log('Username/Password combination does not exist');
        ws.send(JSON.stringify('Username/Password combination does not exist'));
      } else {
        userModel.verifyPassword(username, password, (user) => {
          if (!user) {
            let response = {
              route: 'signInResponse',
              response: 'negative',
            };
            ws.send(JSON.stringify(response));
          } else {
            // auth/passport stuff for later
            let response = {
              route: 'signInResponse',
              response: 'affirmative',
              username: username,
            };

            // @evan, I'm responding with the same route and the response if
            // username/password was valid
            ws.send(JSON.stringify(response));
          }
        });
      }
    });
  },

  signup: (ws, data) => {
    // see if node enjoys arrow es6
    var username = data.username;
    var password = data.password;

    userModel.doesUserExist(username, (bool) => {
      if (bool) {
        console.log('Username in use!');
        ws.send(JSON.stringify('username in use!'));
        return;
      } else {
        userModel.newUser(username, password, (rows) => {
          ws.send(JSON.stringify('user created!'));
          ws.send(JSON.stringify(rows));
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
