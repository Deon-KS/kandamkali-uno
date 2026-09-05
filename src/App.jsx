import React from 'react';
import { GameStateProvider, useGameState } from './store/GameStateContext';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';
import './index.css';

function GameRouter() {
  const { roomCode, gameState } = useGameState();
  
  // Show lobby if no room code, or if room is created but game hasn't started
  if (!roomCode || !gameState || gameState.meta?.status === 'LOBBY') {
    return <Lobby />;
  }
  
  return <GameBoard />;
}

export default function App() {
  return (
    <GameStateProvider>
      <GameRouter />
    </GameStateProvider>
  );
}
