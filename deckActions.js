const _ = require('lodash');

class Card {
  constructor(val, color) {
    this.val = val;
    this.color = color;
  }
}

// -------------------- start of game actions -------------------- //

// create a new deck for the game
let makeNewDeck = () => {
	let deck = [];

	let colors = ['red', 'green', 'blue', 'yellow'];

	let deckBreakdown = {
		0: 1,
		1: 2,
		2: 2,
		3: 2,
		4: 2,
		5: 2,
		6: 2,
		7: 2,
		8: 2,
		9: 2,
		skip: 2,
		reverse: 2,
		takeTwo: 2,
	};

	let colorless = {
		wild: 4,
		takeFour: 4
	};

	for (let color of colors) {
		for (let type in deckBreakdown) {
			for (let i=0; i < deckBreakdown[type]; i++) {
				deck.push(new Card(type, color));
			}
		}
	}

	for (let each in colorless) {
		for (let i=0; i < colorless[each]; i++) {
			deck.push(new Card(each, true));
		}
	}

	deck = _.shuffle(deck);

  return deck;
};

let dealCards = (deck, players) => {
  // deals each player 7 cards
  for (let i=0; i<7; i++) {
    for (let player of players) {
      //the 'top' of the deck will be the card at the highest index
      player.hand.push(deck.pop());
    }
  }
  // add a card to the discardPile

  discardPile.push(deck.pop());
  return true;
}

// --------------------- turn by turn actions -------------------- //

// player pickup
let takeCard = (player, numberOfCards) => {
  numberOfCards = numberOfCards || 1;
  for (var card = 0; card < numberOfCards; card++) {
    player.hand.push(deck.pop());
  }
  return true;
}

// player discard
let layDownCard = (player, cardIndex) => {
  if (player.hand.length === 0) {
    console.log(('...but you won...'));
  }

  let discard = player.hand.splice(cardIndex, 1);

  discardPile.push(discard);

  return true;
}

// reshuffle the deck when necessary (could automate this...)
let shuffleDiscardPile = () => {
  deck = _.shuffle(discardPile);

  discardPile = [];

  discardPile.push(deck.pop());

  return true
}

// check if discard is valid, then discard
let isCardValid = (card) => {
  let lastCard = discardPile[discardPile.length-1];

  if (card.color === lastCard.color || card.val === lastCard.val) {
    return true;
  }
  return false;
}

module.exports = {
  makeNewDeck: makeNewDeck,
  dealCards: dealCards,
  takeCard: takeCard,
  shuffleDiscardPile: shuffleDiscardPile,
  isValidCard: isValidCard,
}
