import { isValidPlay } from './gameLogic';

/**
 * Determines the best move for a bot.
 * 
 * Evaluates valid playable cards against `topDiscardCard` and `activeColor`.
 * Priority: Action cards (Draw Two / Skip) > Matching Color > Matching Number > Wild.
 * 
 * @param {Array} hand - Bot's current hand.
 * @param {Object} topDiscardCard - The current top card on the discard pile.
 * @param {string} activeColor - The current active color.
 * @returns {Object|null} The chosen card to play, or null if it must draw.
 */
export function getBotMove(hand, topDiscardCard, activeColor) {
  const validCards = hand.filter(card => isValidPlay(card, topDiscardCard, activeColor));
  
  if (validCards.length === 0) return null; // Must draw

  // Score valid cards for prioritization
  // High score = better move
  const scoredCards = validCards.map(card => {
    let score = 0;
    
    // Wilds are last resort (score 1)
    if (card.color === 'BLACK') {
      score = 1;
      // Prefer standard wild over draw four if we just want to change color
      if (card.value === 'WILD_DRAW_FOUR') score = 0; 
    } else {
      // Matching color is good
      if (card.color === activeColor) score += 5;
      
      // Matching number is okay
      if (card.value === topDiscardCard.value) score += 3;
      
      // Action cards are best
      if (['SKIP', 'REVERSE', 'DRAW_TWO'].includes(card.value)) {
        score += 10;
      }
    }
    
    return { card, score };
  });

  // Sort by score descending
  scoredCards.sort((a, b) => b.score - a.score);
  
  return scoredCards[0].card;
}

/**
 * Simulates a bot's thinking delay and executes its move.
 * @param {Function} playCardCallback - Function to call to play a card.
 * @param {Function} drawCardCallback - Function to call to draw a card.
 * @param {Array} hand - Bot's hand.
 * @param {Object} topDiscardCard - Top card.
 * @param {string} activeColor - Active color.
 */
export function executeBotTurn(playCardCallback, drawCardCallback, hand, topDiscardCard, activeColor) {
  // Bot plays with a humanized 1.2s thinking delay
  setTimeout(() => {
    const cardToPlay = getBotMove(hand, topDiscardCard, activeColor);
    
    if (cardToPlay) {
      let chosenColor = null;
      if (cardToPlay.color === 'BLACK') {
        // Pick the color the bot has most of
        const colorCounts = { RED: 0, YELLOW: 0, GREEN: 0, BLUE: 0 };
        hand.forEach(c => {
          if (c.color !== 'BLACK') {
            colorCounts[c.color]++;
          }
        });
        chosenColor = Object.keys(colorCounts).reduce((a, b) => colorCounts[a] > colorCounts[b] ? a : b);
        // Default to red if hand only has wilds
        if (colorCounts[chosenColor] === 0) chosenColor = 'RED';
      }
      playCardCallback(cardToPlay, chosenColor);
    } else {
      drawCardCallback();
    }
  }, 1200);
}
