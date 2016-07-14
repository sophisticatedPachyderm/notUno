var sql = require('mysql');
var secrets = require('./../secrets.js');

var connection = mysql.createConnection({
  host: secrets.url, // could be Docker if we figure it out
  port: secrets.port,
  user: secrets.username,
  password: secrets.password,
  database: 'notUno',
});

connection.connect(function(err) {
  if (err) {
    console.log('err ' + err);
    return;
  } else {
    console.log('connected as id ' + connection.threadId);
  }
});

module.export = connection;
