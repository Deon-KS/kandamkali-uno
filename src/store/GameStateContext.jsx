import React, { createContext, useContext, useState, useEffect } from 'react';
import { database, ref, set, onValue } from '../services/firebase';

const GameStateContext = createContext();

export function useGameState() {
  return useContext(GameStateContext);
}

export function GameStateProvider({ children }) {
  const [roomCode, setRoomCode] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Sync with Firebase if online
  useEffect(() => {
    if (!isOffline && roomCode) {
      const roomRef = ref(database, `rooms/${roomCode}`);
      const unsubscribe = onValue(roomRef, (snapshot) => {
        if (snapshot.exists()) {
          setGameState(snapshot.val());
        } else {
          setGameState(null); // Room closed/deleted
        }
      });
      return () => unsubscribe();
    }
  }, [roomCode, isOffline]);

  // Method to push state updates (local or remote)
  const updateState = async (newState) => {
    if (isOffline) {
      setGameState(newState);
    } else if (roomCode) {
      // In a real production app we'd use transactions for race conditions.
      // For this hackathon, replacing the whole object or deep merging is fine.
      const roomRef = ref(database, `rooms/${roomCode}`);
      await set(roomRef, newState);
    }
  };

  const value = {
    roomCode, setRoomCode,
    playerId, setPlayerId,
    gameState, setGameState,
    isOffline, setIsOffline,
    isMuted, setIsMuted,
    updateState
  };

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
}
