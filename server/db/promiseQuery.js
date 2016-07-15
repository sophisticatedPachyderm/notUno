const db = require('./dbStart.js');
const Promise = require('bluebird');

// use this in lieu of db.query to prevent callback hell

// pass in any truthy value as the 2nd (debug) argument to console.log queryStrings on server
module.exports = (queryString, debug) => {
  return new Promise((resolve, reject) => {
    if (debug) { console.log(queryString); }  //set debug to true to log queries;

    db.query(queryString, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};