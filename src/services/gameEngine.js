const COLORS = ['red', 'blue', 'green', 'yellow'];
const VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', '+2'];
const WILDS = ['wild', '+4'];

function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

function generateDeck() {
  const deck = [];
  // Colors
  COLORS.forEach(color => {
    VALUES.forEach(value => {
      deck.push({ color, value });
      if (value !== '0') { // 0 appears once, others appear twice
        deck.push({ color, value });
      }
    });
  });
  // Wilds
  WILDS.forEach(value => {
    for (let i = 0; i < 4; i++) {
      deck.push({ color: 'wild', value });
    }
  });
  return shuffle(deck);
}

function getNextTurn(playerIds, currentId, direction, steps = 1) {
  const currentIndex = playerIds.indexOf(currentId);
  if (currentIndex === -1) return playerIds[0];
  let nextIndex = (currentIndex + (direction * steps)) % playerIds.length;
  if (nextIndex < 0) nextIndex += playerIds.length;
  return playerIds[nextIndex];
}

export function initializeGame(roomData) {
  const deck = generateDeck();
  const players = { ...roomData.players };
  const playerIds = Object.keys(players);
  
  // Deal 7 cards
  playerIds.forEach(pId => {
    players[pId] = { ...players[pId], hand: [] };
    for (let i = 0; i < 7; i++) {
      players[pId].hand.push(deck.pop());
    }
    players[pId].cardCount = 7;
  });

  // First card
  let firstCard = deck.pop();
  while (firstCard.color === 'wild') {
    deck.unshift(firstCard); // put back at bottom
    firstCard = deck.pop();
  }

  const newState = {
    ...roomData,
    meta: { ...roomData.meta, status: 'PLAYING' },
    players,
    gameState: {
      deck,
      discardPile: [firstCard],
      currentTurnPlayerId: playerIds[0],
      turnDirection: 1, // 1 for clockwise, -1 for counter
      activeColor: firstCard.color,
      topDiscardCard: firstCard,
      winnerId: null
    }
  };

  return newState;
}

export function playCardEngine(roomData, playerId, cardIndex, selectedColor = null) {
  const gs = { ...roomData.gameState };
  const players = { ...roomData.players };
  const player = players[playerId];
  
  if (gs.currentTurnPlayerId !== playerId) throw new Error("Not your turn!");
  if (gs.winnerId) throw new Error("Game is over!");
  
  const card = player.hand[cardIndex];
  if (!card) throw new Error("Card not found");

  // Validate
  const isValid = card.color === 'wild' || card.color === gs.activeColor || card.value === gs.topDiscardCard.value;
  if (!isValid) throw new Error("Invalid move");

  // Remove card from hand
  player.hand = [...player.hand];
  player.hand.splice(cardIndex, 1);
  player.cardCount = player.hand.length;

  // Add to discard
  gs.discardPile = gs.discardPile ? [...gs.discardPile, card] : [card];
  gs.topDiscardCard = card;

  // Handle Win Condition
  if (player.cardCount === 0) {
    gs.winnerId = playerId;
    roomData.meta.status = 'FINISHED';
  } else {
    // Effects
    const playerIds = Object.keys(players);
    let steps = 1;

    if (card.value === 'reverse') {
      if (playerIds.length === 2) {
        steps = 2; // In 2-player, reverse acts as a skip
      } else {
        gs.turnDirection *= -1;
      }
      gs.activeColor = card.color;
    } else if (card.value === 'skip') {
      steps = 2;
      gs.activeColor = card.color;
    } else if (card.value === '+2') {
      const targetId = getNextTurn(playerIds, playerId, gs.turnDirection, 1);
      const target = players[targetId];
      target.hand = [...(target.hand || [])];
      for (let i = 0; i < 2; i++) {
        if (gs.deck.length > 0) target.hand.push(gs.deck.pop());
      }
      target.cardCount = target.hand.length;
      steps = 2; // Skip their turn
      gs.activeColor = card.color;
    } else if (card.color === 'wild') {
      gs.activeColor = selectedColor || 'red';
      if (card.value === '+4') {
        const targetId = getNextTurn(playerIds, playerId, gs.turnDirection, 1);
        const target = players[targetId];
        target.hand = [...(target.hand || [])];
        for (let i = 0; i < 4; i++) {
          if (gs.deck.length > 0) target.hand.push(gs.deck.pop());
        }
        target.cardCount = target.hand.length;
        steps = 2;
      }
    } else {
      gs.activeColor = card.color;
    }

    gs.currentTurnPlayerId = getNextTurn(playerIds, playerId, gs.turnDirection, steps);
  }

  // Refill deck if empty
  if (gs.deck.length < 5) {
    const newDeck = shuffle([...gs.discardPile.slice(0, -1)]);
    gs.deck = [...newDeck, ...gs.deck];
    gs.discardPile = [gs.topDiscardCard];
  }

  if (!gs.winnerId) {
    applyDaviChaos(gs, players);
  }

  return { ...roomData, players, gameState: gs };
}

export function drawCardEngine(roomData, playerId) {
  const gs = { ...roomData.gameState };
  const players = { ...roomData.players };
  const player = players[playerId];
  
  if (gs.currentTurnPlayerId !== playerId) throw new Error("Not your turn!");
  if (gs.winnerId) throw new Error("Game is over!");

  if (gs.deck.length > 0) {
    const drawn = gs.deck.pop();
    player.hand = [...(player.hand || []), drawn];
    player.cardCount = player.hand.length;
  }
  
  // Advance turn
  const playerIds = Object.keys(players);
  gs.currentTurnPlayerId = getNextTurn(playerIds, playerId, gs.turnDirection, 1);

  if (!gs.winnerId) {
    applyDaviChaos(gs, players);
  }

  return { ...roomData, players, gameState: gs };
}

const DAVI_EVENTS = [
  'TAX_THE_LEADER',
  'KANDAM_EXILE',
  'ROBIN_HOOD',
  'COLOR_ANARCHY',
  'KUDUMBA_KODATHI',
  'UNO_REVOKED',
  'CHARITY_DONATION',
  'BLIND_GAMBLE',
  'DEFECTIVE_DECK'
];

function applyDaviChaos(gs, players) {
  // Lower chaos level: 20% chance to trigger to make it slightly easier
  if (Math.random() > 0.20) return;

  const eventName = DAVI_EVENTS[Math.floor(Math.random() * DAVI_EVENTS.length)];
  const playerList = Object.values(players);
  const sortedPlayers = [...playerList].sort((a, b) => a.hand.length - b.hand.length);
  const lowestPlayer = sortedPlayers[0];
  const highestPlayer = sortedPlayers[sortedPlayers.length - 1];
  const currentTurnPlayer = players[gs.currentTurnPlayerId];

  let message = "";
  let target = 'Global';
  let punishment = "";

  switch (eventName) {
    case 'TAX_THE_LEADER':
      message = "Aha, bhayangara plan aayirunnu alle?";
      punishment = "Draw 2 Cards";
      target = lowestPlayer.name;
      for (let i=0; i<2; i++) {
        if (gs.deck.length > 0) lowestPlayer.hand.push(gs.deck.pop());
      }
      break;

    case 'KANDAM_EXILE':
      message = "Red is sus! Get rid of them.";
      punishment = "All RED cards banished to the deck";
      target = currentTurnPlayer.name;
      const nonRed = currentTurnPlayer.hand.filter(c => c.color !== 'red');
      const redCards = currentTurnPlayer.hand.filter(c => c.color === 'red');
      currentTurnPlayer.hand = nonRed;
      gs.deck.unshift(...redCards);
      break;

    case 'ROBIN_HOOD':
      message = "Steal from the rich, give to the poor!";
      punishment = "Highest and Lowest players swap 1 random card";
      target = lowestPlayer.name;
      if (lowestPlayer.hand.length > 0 && highestPlayer.hand.length > 0) {
        const p1Card = lowestPlayer.hand.splice(Math.floor(Math.random() * lowestPlayer.hand.length), 1)[0];
        const p2Card = highestPlayer.hand.splice(Math.floor(Math.random() * highestPlayer.hand.length), 1)[0];
        lowestPlayer.hand.push(p2Card);
        highestPlayer.hand.push(p1Card);
      }
      break;

    case 'COLOR_ANARCHY':
      message = "Who likes rules? Color flipped!";
      const colors = ['red', 'blue', 'green', 'yellow'];
      gs.activeColor = colors[Math.floor(Math.random() * colors.length)];
      punishment = `Active color forcibly changed to ${gs.activeColor.toUpperCase()}`;
      break;

    case 'KUDUMBA_KODATHI':
      message = "Musical chairs but for Uno cards!";
      punishment = "Everyone passes their entire hand to the next player";
      const playerIds = Object.keys(players);
      const hands = playerIds.map(id => [...players[id].hand]);
      playerIds.forEach((id, index) => {
        let nextIndex = (index + gs.turnDirection) % playerIds.length;
        if (nextIndex < 0) nextIndex += playerIds.length;
        players[playerIds[nextIndex]].hand = hands[index];
      });
      break;

    case 'UNO_REVOKED':
      let caught = false;
      playerList.forEach(p => {
        if (p.hand.length === 1) {
          caught = true;
          for (let i=0; i<1; i++) {
            if (gs.deck.length > 0) p.hand.push(gs.deck.pop());
          }
        }
      });
      message = caught ? "Nice try! UNO revoked." : "No one is close to winning anyway.";
      punishment = caught ? "Players with 1 card are forced to Draw 1" : "Nothing happens (No one had UNO)";
      break;

    case 'CHARITY_DONATION':
      const opponents = playerList.filter(p => p !== currentTurnPlayer);
      const randomOpp = opponents[Math.floor(Math.random() * opponents.length)];
      message = `Sharing is caring! You donated a card.`;
      punishment = `Forced to give 1 random card to ${randomOpp.name}`;
      target = currentTurnPlayer.name;
      if (currentTurnPlayer.hand.length > 0) {
        const card = currentTurnPlayer.hand.splice(Math.floor(Math.random() * currentTurnPlayer.hand.length), 1)[0];
        randomOpp.hand.push(card);
      }
      break;

    case 'BLIND_GAMBLE':
      message = "Keep drawing until you hit an Action card!";
      punishment = "Draw cards continuously until finding an Action Card";
      target = currentTurnPlayer.name;
      let drewAction = false;
      while (!drewAction && gs.deck.length > 0) {
        const card = gs.deck.pop();
        currentTurnPlayer.hand.push(card);
        if (['skip', 'reverse', '+2', '+4'].includes(card.value)) {
          drewAction = true;
        }
      }
      break;

    case 'DEFECTIVE_DECK':
      message = "Draw Twos are broken. They are 5s now.";
      punishment = "All Draw Two cards in everyone's hands turned into 5s";
      playerList.forEach(p => {
        p.hand.forEach(c => {
          if (c.value === '+2') c.value = '5';
        });
      });
      break;
  }

  // Update card counts
  Object.values(players).forEach(p => p.cardCount = p.hand.length);
  
  if (!gs.daviLogs) gs.daviLogs = [];
  const logEntry = {
    id: Date.now(),
    title: eventName.replace(/_/g, ' '),
    target: target,
    punishment: punishment
  };
  gs.daviLogs.unshift(logEntry);
  if (gs.daviLogs.length > 20) gs.daviLogs.pop(); // keep last 20

  gs.daviEvent = {
    id: Date.now(),
    title: eventName.replace(/_/g, ' '),
    message: message,
    punishment: punishment,
    target: target
  };
}
