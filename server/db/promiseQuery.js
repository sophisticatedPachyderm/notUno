'use strict';

const db = require('./dbStart.js');
const Promise = require('bluebird');

module.exports = {

  // use this in lieu of db.query to prevent callback hell

  // pass in any truthy value as the 2nd (debug) argument to console.log queryStrings on server
  // use optionsPassed as a way to pass a value "through" to the other side of the promiseQuery
  promiseQuery: (queryString, debug, optionsPassed) => {
    return new Promise((resolve, reject) => {
      if (debug) { console.log(queryString); }  //set debug to true to log queries;

      db.query(queryString, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          rows.options = optionsPassed;
          resolve(rows);
        }
      });
    });
  },

  //the thinking behind this is that it allows you to handle errors like not having userId / gameId properly 
  //submitted in the request before initiating the db query
  //the error would then be caught and handled consistenly with the rest of the Promise instead of having a separate error handler
  initPromise: (requirements) => {
    return new Promise((resolve, reject) => {
      for (let k in requirements) {
        console.log('checking', k, requirements[k]);
        if (!requirements[k]) {
          reject(k + ' undefined');
          break;
        }
      }
      resolve(requirements);
    });
  }
};