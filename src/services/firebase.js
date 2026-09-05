import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, update, onValue, onDisconnect, push } from 'firebase/database';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "dummy-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dummy.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://dummy-project-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dummy-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dummy.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, set, get, update, onValue, onDisconnect, push };

/**
 * Creates a new room in the Realtime Database.
 * @param {string} hostId - The UUID of the host player.
 * @param {string} hostName - The display name of the host.
 * @returns {string} The generated 6-character room code.
 */
export async function createRoom(hostId, hostName) {
  const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const roomRef = ref(database, `rooms/${roomCode}`);
  
  const initialRoomData = {
    meta: {
      createdAt: Date.now(),
      hostId: hostId,
      status: "LOBBY" // LOBBY, PLAYING, FINISHED
    },
    players: {
      [hostId]: {
        name: hostName,
        isHost: true,
        isBot: false,
        hand: [],
        cardCount: 0,
        isOnline: true,
        lastSeen: Date.now()
      }
    },
    gameState: {
      currentTurnPlayerId: hostId,
      turnDirection: 1,
      activeColor: null,
      topDiscardCard: null,
      deckCount: 0,
      turnTimeoutAt: 0,
      lastChaosEvent: null
    },
    chat: {}
  };

  await set(roomRef, initialRoomData);
  
  // Set up onDisconnect hook for the host
  const hostPlayerRef = ref(database, `rooms/${roomCode}/players/${hostId}`);
  onDisconnect(hostPlayerRef).update({ isOnline: false });
  
  return roomCode;
}

/**
 * Joins an existing room.
 * @param {string} roomCode - The room code to join.
 * @param {string} playerId - The joining player's UUID.
 * @param {string} playerName - The joining player's name.
 * @returns {boolean} True if successful, false if room not found or full.
 */
export async function joinRoom(roomCode, playerId, playerName) {
  const roomRef = ref(database, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);
  
  if (snapshot.exists()) {
    const roomData = snapshot.val();
    
    // Check if game already started
    if (roomData.meta.status !== 'LOBBY') {
        throw new Error("Game has already started.");
    }
    
    // Check max players (4)
    if (Object.keys(roomData.players || {}).length >= 4) {
        throw new Error("Room is full.");
    }

    const newPlayerRef = ref(database, `rooms/${roomCode}/players/${playerId}`);
    await set(newPlayerRef, {
      name: playerName,
      isHost: false,
      isBot: false,
      hand: [],
      cardCount: 0,
      isOnline: true,
      lastSeen: Date.now()
    });
    
    onDisconnect(newPlayerRef).update({ isOnline: false });
    return true;
  }
  
  throw new Error("Room not found.");
}

export async function drawCard(roomCode, playerId) {
  console.log("Draw card stub:", roomCode, playerId);
}

export async function playCard(roomCode, playerId, cardIndex) {
  console.log("Play card stub:", roomCode, playerId, cardIndex);
}
