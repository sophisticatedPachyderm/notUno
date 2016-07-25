var request = require('request');
var expect = require('chai').expect;

const postRequest = (route, body, callback) => {
  var params = {
    method: 'POST',
    uri: 'http://127.0.0.1:3000/api/' + route,
    json: body
  };

  request(params, callback);
};

describe('server', () => {
  it('should be a test', (done) => {

    done();
  });

  //create a game first then input the gameId here
  xit('should respond to the game/getgame POST route', (done) => {
    postRequest('game/getgame', { gameId: 21 }, (error, response, body) => {
      expect(body).to.be.an('object');
      expect(body.gameId).to.equal(21);
      done();
    });
  });

});