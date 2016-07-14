var sql = require('mysql');

var connection = mysql.createConnection({
  host: 'localhost', // could be Docker if we figure it out
  user: 'root',
  password: '',
  database: 'notUno',
});

connection.connect(function (err) {
  if (err) {
    console.log('err ' + err);
    return;
  } else {
    console.log('connected as id ' + connection.threadId);
  }
});

module.export = connection;
