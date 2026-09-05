import { COLORS } from './unoDeck';

const EVENTS = [
  'TAX_THE_LEADER',
  'KANDAM_EXILE',
  'ROBIN_HOOD',
  'COLOR_ANARCHY',
  'KUDUMBA_KODATHI',
  'UNO_REVOKED',
  'CHARITY_DONATION',
  'BLIND_GAMBLE',
  'VIP_PASS',
  'DEFECTIVE_DECK'
];

/**
 * Executes a random chaos event.
 * @param {Object} gameState - Current game state (must be a deep copy if treating as immutable)
 * @param {string} currentPlayerId - The player who just finished their turn
 * @returns {Object} { modifiedState, chaosLog }
 */
export function triggerChaosEvent(gameState, currentPlayerId) {
  // 30% chance for chaos on any turn to prevent it being TOO annoying, or we can do it 100% as requested:
  // "At the completion of EVERY valid card play or deck draw, the AI referee interrupts"
  // The spec says EVERY valid play. We'll do every time for maximum spite.

  const eventName = EVENTS[Math.floor(Math.random() * EVENTS.length)];
  let log = {
    name: eventName,
    targetPlayerId: null,
    dialogue: '',
    audioFile: '',
    timestamp: Date.now()
  };

  // Helper to find players
  const playerList = Object.values(gameState.players);
  const currentPlayer = gameState.players[currentPlayerId];
  
  // Sort players by card count
  const sortedPlayers = [...playerList].sort((a, b) => a.hand.length - b.hand.length);
  const lowestPlayer = sortedPlayers[0];
  const highestPlayer = sortedPlayers[sortedPlayers.length - 1];

  switch(eventName) {
    case 'TAX_THE_LEADER':
      // Lowest card count draws 3
      log.targetPlayerId = lowestPlayer.id;
      log.dialogue = "Aha, bhayangara plan aayirunnu alle? Draw 3!";
      log.audioFile = "enthokke";
      
      for(let i=0; i<3; i++) {
        if(gameState.deck.length > 0) {
          lowestPlayer.hand.push(gameState.deck.pop());
        }
      }
      break;

    case 'KANDAM_EXILE':
      // Current player discards all red cards
      log.targetPlayerId = currentPlayerId;
      log.dialogue = "Red is sus! Get rid of them.";
      log.audioFile = "scene_contra";
      
      const nonRed = currentPlayer.hand.filter(c => c.color !== 'RED');
      const redCards = currentPlayer.hand.filter(c => c.color === 'RED');
      currentPlayer.hand = nonRed;
      // Put reds at bottom of deck
      gameState.deck.unshift(...redCards);
      break;

    case 'ROBIN_HOOD':
      // Lowest and highest swap 1 random card
      log.targetPlayerId = lowestPlayer.id;
      log.dialogue = "Steal from the rich, give to the poor!";
      log.audioFile = "vidhikkan";

      if(lowestPlayer.hand.length > 0 && highestPlayer.hand.length > 0) {
        const p1CardIdx = Math.floor(Math.random() * lowestPlayer.hand.length);
        const p2CardIdx = Math.floor(Math.random() * highestPlayer.hand.length);
        
        const p1Card = lowestPlayer.hand.splice(p1CardIdx, 1)[0];
        const p2Card = highestPlayer.hand.splice(p2CardIdx, 1)[0];
        
        lowestPlayer.hand.push(p2Card);
        highestPlayer.hand.push(p1Card);
      }
      break;

    case 'COLOR_ANARCHY':
      // Top discard card morphs color
      log.targetPlayerId = 'global';
      log.dialogue = "Who likes rules? Color flipped!";
      log.audioFile = "dha_poyi";
      
      const newColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      if (gameState.topDiscardCard.color !== 'BLACK') {
        gameState.topDiscardCard.color = newColor;
      }
      gameState.activeColor = newColor;
      break;

    case 'KUDUMBA_KODATHI':
      // Hands shift one position in turn direction
      log.targetPlayerId = 'global';
      log.dialogue = "Musical chairs but for Uno cards!";
      log.audioFile = "pavanayi";
      
      // Get player IDs in order
      const playerIds = Object.keys(gameState.players);
      const hands = playerIds.map(id => [...gameState.players[id].hand]);
      
      playerIds.forEach((id, index) => {
        let nextIndex = (index + gameState.turnDirection) % playerIds.length;
        if (nextIndex < 0) nextIndex += playerIds.length;
        gameState.players[playerIds[nextIndex]].hand = hands[index];
      });
      break;

    case 'UNO_REVOKED':
      // Anyone with 1 card draws 2
      log.targetPlayerId = 'global';
      let caught = false;
      playerList.forEach(p => {
        if(p.hand.length === 1) {
          caught = true;
          for(let i=0; i<2; i++) {
            if(gameState.deck.length > 0) p.hand.push(gameState.deck.pop());
          }
        }
      });
      if(caught) {
        log.dialogue = "Nice try! UNO revoked.";
        log.audioFile = "scene_contra";
      } else {
        log.dialogue = "No one is close to winning anyway.";
        log.audioFile = "sadhanam";
      }
      break;

    case 'CHARITY_DONATION':
      // Current gives 1 card to random opponent
      const opponents = playerList.filter(p => p.id !== currentPlayerId);
      const randomOpp = opponents[Math.floor(Math.random() * opponents.length)];
      log.targetPlayerId = currentPlayerId;
      log.dialogue = `Sharing is caring! You donated a card to ${randomOpp.name}.`;
      log.audioFile = "sadhanam";

      if(currentPlayer.hand.length > 0) {
        const cardIdx = Math.floor(Math.random() * currentPlayer.hand.length);
        const card = currentPlayer.hand.splice(cardIdx, 1)[0];
        randomOpp.hand.push(card);
      }
      break;

    case 'BLIND_GAMBLE':
      // Random player draws until action card
      const gamblePlayer = playerList[Math.floor(Math.random() * playerList.length)];
      log.targetPlayerId = gamblePlayer.id;
      log.dialogue = "Keep drawing until you hit an Action card!";
      log.audioFile = "enthokke";

      let drewAction = false;
      while(!drewAction && gameState.deck.length > 0) {
        const card = gameState.deck.pop();
        gamblePlayer.hand.push(card);
        if(['SKIP', 'REVERSE', 'DRAW_TWO', 'WILD_DRAW_FOUR'].includes(card.value)) {
          drewAction = true;
        }
      }
      break;

    case 'VIP_PASS':
      // Current player gets immediate second turn
      log.targetPlayerId = currentPlayerId;
      log.dialogue = "VIP access granted. Go again!";
      log.audioFile = "vidhikkan";
      // This is handled in state transition (skip counting)
      gameState.nextTurnOverride = currentPlayerId;
      break;

    case 'DEFECTIVE_DECK':
      // All Draw Two turn into 5s
      log.targetPlayerId = 'global';
      log.dialogue = "Draw Twos are broken. They are 5s now.";
      log.audioFile = "pavanayi";

      playerList.forEach(p => {
        p.hand.forEach(c => {
          if(c.value === 'DRAW_TWO') {
            c.value = '5';
          }
        });
      });
      break;
  }

  // Update card counts
  Object.values(gameState.players).forEach(p => p.cardCount = p.hand.length);
  
  return { modifiedState: gameState, chaosLog: log };
}
