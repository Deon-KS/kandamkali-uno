/**
 * Checks if a card can be played on the current discard pile.
 * @param {Object} cardToPlay - The card being played.
 * @param {Object} topDiscardCard - The card on top of the discard pile.
 * @param {string} activeColor - The current active color (important for after Wilds).
 * @returns {boolean} True if the play is valid.
 */
export function isValidPlay(cardToPlay, topDiscardCard, activeColor) {
  if (cardToPlay.color === 'BLACK') return true; // Wilds are always valid
  if (cardToPlay.color === activeColor) return true; // Matches current color
  if (cardToPlay.value === topDiscardCard.value) return true; // Matches number/action
  return false;
}

/**
 * Calculates the next player's index.
 * @param {number} currentIndex - Current player's index.
 * @param {number} direction - 1 for clockwise, -1 for counter-clockwise.
 * @param {number} numPlayers - Total number of players.
 * @param {number} skipCount - Number of players to skip (default 1 for normal turn, 2 for Skip card).
 * @returns {number} The next player's index.
 */
export function getNextPlayerIndex(currentIndex, direction, numPlayers, skipCount = 1) {
  let nextIndex = (currentIndex + (direction * skipCount)) % numPlayers;
  if (nextIndex < 0) {
    nextIndex += numPlayers;
  }
  return nextIndex;
}

/**
 * Handles playing a card and determining the immediate state changes.
 * Does NOT apply chaos engine events.
 * 
 * @param {Object} gameState - The current game state.
 * @param {Object} cardToPlay - The card being played.
 * @param {string} chosenColor - The color chosen if a Wild card is played.
 * @returns {Object} A partial state update with turn modifiers.
 */
export function processCardPlay(gameState, cardToPlay, chosenColor = null) {
  let nextDirection = gameState.turnDirection;
  let skipCount = 1;
  let cardsToDraw = 0;
  
  const activeColor = cardToPlay.color === 'BLACK' ? chosenColor : cardToPlay.color;

  switch (cardToPlay.value) {
    case 'REVERSE':
      if (gameState.players.length === 2) {
        // In 2 player games, reverse acts as a skip
        skipCount = 2;
      } else {
        nextDirection = nextDirection * -1;
      }
      break;
    case 'SKIP':
      skipCount = 2;
      break;
    case 'DRAW_TWO':
      skipCount = 2; // Next player is skipped and must draw
      cardsToDraw = 2;
      break;
    case 'WILD_DRAW_FOUR':
      skipCount = 2; // Next player is skipped and must draw
      cardsToDraw = 4;
      break;
    default:
      break;
  }

  return {
    topDiscardCard: cardToPlay,
    activeColor,
    turnDirection: nextDirection,
    skipCount,
    cardsToDraw
  };
}
