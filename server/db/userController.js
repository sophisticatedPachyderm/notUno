var userModel = require('./userModel.js');

module.exports = {
  signin: function (req, res) {
    var username = req.body.username;  // bodyParser
    var password = req.body.password;

    /* we should remember this structure when when we have the
    API calls from the client
    verifyPassword: function (username, password)
    */

    userModel.doesUserExist(username, (bool) => {
      if (!bool) {
        // user does not exist
        console.log('Username/Password combination does not exist');
        res.redirect('/');
      } else {
        userModel.verifyPassword(username, password, (user) => {
          if (!user) {
            console.log('invalid username/password');
          } else {
            // this needs to be tested, but this is a part of passport auth
            // that needs to happen upon signin!
            // req.logIn() for passport
            req.logIn(username, (err) => {
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

  signup: (req, res) => {
    // see if node enjoys arrow es6
    var username = req.body.username;
    var password = req.body.password;

    userModel.doesUserExist(username, (bool) => {
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
