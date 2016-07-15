'use strict';

const { makeNewDeck, dealCards } = require('./deckActions.js');

module.exports = (numPlayers) => {
  //create a shuffled deck
  var deck = makeNewDeck();

  //create a placeholder array for the players
  var players = Array(numPlayers).fill(1).map((val, i) => {
    return {
      position: i,
      positionName: 'p' + i + 'Hand',
      hand: []
    };
  });

  //deal cards to the players and start the discard pile
  var discardPile = dealCards(deck, players);

  //pick a random first player
  var currentPlayer = Math.floor( Math.random() * numPlayers);

  //return an object with keys/properties needed for database
  return {

    unplayedCards: deck, 
    playedCards: discardPile,
    currentPlayer: currentPlayer,
    p0Hand: players[0].hand,
    p1Hand: players[1].hand,
    //p0 and p1 are in every game, p2 & p3 -> check if they exist, otherwise set to null
    p2Hand: players[2] ? players[2].hand : null,
    p3Hand: players[3] ? players[3].hand : null,
  };
};