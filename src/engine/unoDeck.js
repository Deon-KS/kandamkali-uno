export const COLORS = ['RED', 'YELLOW', 'GREEN', 'BLUE'];
export const VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'SKIP', 'REVERSE', 'DRAW_TWO'];
export const WILDS = ['WILD', 'WILD_DRAW_FOUR'];

export function generateDeck() {
  const deck = [];
  let idCounter = 1;

  // Generate colored cards
  COLORS.forEach(color => {
    // One '0' card per color
    deck.push({ id: `c${idCounter++}`, color, value: '0' });

    // Two of each 1-9 and Action cards per color
    for (let i = 1; i < VALUES.length; i++) {
      deck.push({ id: `c${idCounter++}`, color, value: VALUES[i] });
      deck.push({ id: `c${idCounter++}`, color, value: VALUES[i] });
    }
  });

  // Generate Wild cards (4 of each)
  WILDS.forEach(value => {
    for (let i = 0; i < 4; i++) {
      deck.push({ id: `c${idCounter++}`, color: 'BLACK', value });
    }
  });

  return deck;
}

export function shuffleDeck(deck) {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
}

export function dealCards(deck, numPlayers, cardsPerPlayer = 7) {
  const hands = Array.from({ length: numPlayers }, () => []);
  const currentDeck = [...deck];
  
  for (let i = 0; i < cardsPerPlayer; i++) {
    for (let p = 0; p < numPlayers; p++) {
      hands[p].push(currentDeck.pop());
    }
  }

  // Draw first card for discard pile, cannot be a wild or action card usually,
  // but for simplicity let's just draw until we get a number card.
  let topCard = null;
  while (true) {
    topCard = currentDeck.pop();
    if (topCard.color !== 'BLACK' && !['SKIP', 'REVERSE', 'DRAW_TWO'].includes(topCard.value)) {
      break;
    }
    // If it's an action/wild, put it at the bottom of the deck
    currentDeck.unshift(topCard);
  }

  return { hands, remainingDeck: currentDeck, topCard };
}
