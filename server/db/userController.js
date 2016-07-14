var userModel = require('./userModel.js');

module.exports = {
  signin: function (req, res) {
    var username = req.body.username;  // bodyParser
    var password = req.body.password;

    /* we should remember this structure when when we have the
    API calls from the client
    verifyPassword: function (username, password)
    */

    if (!userModel.doesUserExist(username)) {
      console.log('Username/Password combination does not exist');
      res.redirect('/');
    }

    if (userModel.verifyPassword(username, password)) {
      console.log('valid username/password combo');
      res.redirect('/');
    } else {
      console.log('Password/Username combination does not exist');
      res.redirect('/');
    }
  },

};
