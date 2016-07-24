'use strict';

module.exports = {
  convertCardsToTuples: (cards) => {
    return cards.map((card) => {
      var val = isNaN(card.val) ? card.val : Number(card.val);
      var color = card.color === true ? 1 : card.color[0];
      return [val, color];
    });
  },

  getNextPlayer: (currentPlayer, direction, playerCount) => {
  
    if (direction === 1) {  //clockwise, see if you went over
      currentPlayer++;
      if (currentPlayer >= playerCount) { currentPlayer = 0; }
    } else {  //counter clockwise, see if you went under
      currentPlayer--;
      if (currentPlayer < 0) { currentPlayer = playerCount - 1; }
    }
    return currentPlayer;
  }
};