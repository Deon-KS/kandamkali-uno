import React from 'react';
import { GameStateProvider, useGameState } from './store/GameStateContext';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';
import './index.css';

function GameRouter() {
  const { roomCode } = useGameState();
  
  if (!roomCode) {
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
