import React, { useState, useEffect } from 'react';
import { useGameState } from '../store/GameStateContext';
import { drawCard, playCard } from '../services/firebase';
import Card from './Card';
import MemeModal from './MemeModal';

export default function GameBoard() {
  const { gameState: room, playerId, roomCode } = useGameState();
  const [isMemeOpen, setIsMemeOpen] = useState(false);

  if (!room || !room.players || !room.gameState) return null;

  const players = room.players;
  
  // Bridge the data schema gap
  const gameState = {
    hands: {},
    discardPile: room.gameState.topDiscardCard ? [room.gameState.topDiscardCard] : [{ color: 'red', value: '0' }],
    currentTurn: room.gameState.currentTurnPlayerId,
    currentColor: room.gameState.activeColor || 'red'
  };
  for (const pid in players) {
    gameState.hands[pid] = players[pid].hand || [];
  }

  const playerIds = Object.keys(players);
  const myIndex = playerIds.indexOf(playerId);
  
  // Arrange opponents based on our position
  const otherIds = [];
  for (let i = 1; i < playerIds.length; i++) {
    otherIds.push(playerIds[(myIndex + i) % playerIds.length]);
  }

  // Map to slots: Top, Left, Right
  let topOpponent = null;
  let leftOpponent = null;
  let rightOpponent = null;

  if (otherIds.length === 1) {
    topOpponent = otherIds[0];
  } else if (otherIds.length === 2) {
    leftOpponent = otherIds[0];
    rightOpponent = otherIds[1];
  } else if (otherIds.length === 3) {
    leftOpponent = otherIds[0];
    topOpponent = otherIds[1];
    rightOpponent = otherIds[2];
  }

  const myHand = gameState.hands[playerId] || [];
  const activeCard = gameState.discardPile[gameState.discardPile.length - 1];
  const isMyTurn = gameState.currentTurn === playerId;

  const handleDraw = () => {
    if (isMyTurn) drawCard(roomCode, playerId);
  };

  const handlePlay = (card, index) => {
    if (!isMyTurn) return;
    const canPlay = card.color === 'wild' || card.color === activeCard.color || card.value === activeCard.value;
    if (canPlay) {
      playCard(roomCode, playerId, index);
    }
  };

  // Helper to render mini opponent stack
  const renderOpponentStack = (oppId, position) => {
    if (!oppId) return null;
    const p = players[oppId];
    const handCount = gameState.hands[oppId]?.length || 0;
    
    return (
      <div className={`flex flex-col items-center gap-1 ${position === 'top' ? 'mb-1' : ''}`}>
        <div className="flex items-center -space-x-3">
           <div className="w-5 h-8 rounded bg-red-600 border border-white shadow -rotate-12"></div>
           <div className="w-5 h-8 rounded bg-red-600 border border-white shadow rotate-0"></div>
           <div className="w-5 h-8 rounded bg-red-600 border border-white shadow rotate-12 flex items-center justify-center">
             <span className="text-[6px] text-white font-black italic">UNO</span>
           </div>
        </div>
        <div className="flex flex-col items-center px-2 py-1 rounded-lg bg-slate-900/85 border border-white/10 backdrop-blur-md">
           <div className="flex items-center gap-1">
             <div className="w-4 h-4 rounded-full bg-sky-500 text-[9px] font-bold text-white flex items-center justify-center">{p.name.charAt(0).toUpperCase()}</div>
             <span className="text-[11px] font-bold text-slate-200 truncate max-w-[80px]">{p.name}</span>
           </div>
           <span className="text-[10px] font-mono text-emerald-400 font-semibold">{handCount} Cards</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#0b0e14] font-space text-on-surface flex flex-col min-h-screen relative selection:bg-emerald-500 selection:text-black antialiased overflow-hidden">
      
      {/* TOP HEADER */}
      <header className="fixed top-0 w-full z-40 pt-safe bg-[#111319]/90 backdrop-blur-md border-b border-white/5">
        <div className="h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-base shadow-sm">🃏</div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-wider uppercase text-white">ROGUE UNO</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {roomCode}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">CLASSIC 4-PLAYER • 24ms</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMemeOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/40 text-amber-300 active:scale-95 transition-all text-xs font-mono font-bold hover:bg-amber-400/20 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">campaign</span>
              <span>MEME AUDIO</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN ARENA CANVAS */}
      <main className="flex-1 flex flex-col pt-16 pb-20 px-3 w-full h-[100dvh] max-w-md mx-auto justify-between relative select-none">
        
        {/* VIRTUAL UNO GAME TABLE */}
        <div className="relative w-full flex-1 my-1 rounded-[36px] bg-gradient-to-b from-[#143224] via-[#0d2319] to-[#0a1811] border-[5px] border-[#224f38]/50 shadow-[inset_0_0_60px_rgba(0,0,0,0.8),0_12px_32px_rgba(0,0,0,0.6)] flex flex-col items-center justify-between p-3 overflow-hidden">
          
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none"></div>
          
          <div className="absolute inset-x-8 top-16 bottom-20 rounded-full border border-emerald-500/20 direction-spin pointer-events-none flex items-center justify-between px-2">
            <span className="material-symbols-outlined text-emerald-400/40 text-xs">arrow_forward</span>
            <span className="material-symbols-outlined text-emerald-400/40 text-xs">arrow_back</span>
          </div>

          {/* TOP PLAYER */}
          <div className="relative z-10 flex flex-col items-center">
             {renderOpponentStack(topOpponent, 'top')}
          </div>

          {/* MID ROW */}
          <div className="relative z-10 w-full flex items-center justify-between px-1">
             {/* LEFT PLAYER */}
             {renderOpponentStack(leftOpponent, 'left')}

             {/* CENTER TABLE */}
             <div className="flex items-center justify-center gap-4">
                
                {/* DRAW DECK STACK */}
                <button 
                  onClick={handleDraw}
                  className="group relative flex flex-col items-center active:scale-95 transition-transform"
                >
                  <div className="absolute w-16 h-24 rounded-xl bg-slate-950/80 translate-y-1.5 translate-x-1 shadow-md"></div>
                  <div className="absolute w-16 h-24 rounded-xl bg-slate-900/90 translate-y-0.5 translate-x-0.5 border border-white/20"></div>
                  <Card isFaceDown={true} />
                  <span className="text-[9px] font-mono font-bold text-emerald-300/80 mt-1 uppercase tracking-wider">DRAW</span>
                </button>

                {/* ACTIVE DISCARD PILE */}
                <div className="relative flex flex-col items-center">
                  <div className="absolute w-18 h-26 rounded-xl bg-black/40 rotate-6 translate-y-1 blur-sm"></div>
                  <div className="rotate-[-2deg] transition-transform hover:rotate-0 z-10">
                     <Card card={activeCard} />
                  </div>
                  <div className="flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40">
                    <span className={`w-2 h-2 rounded-full bg-${activeCard?.color === 'wild' ? 'white' : activeCard?.color}-400 animate-pulse`}></span>
                    <span className="text-[9px] font-mono font-bold text-amber-300 uppercase">SUIT: {gameState.currentColor}</span>
                  </div>
                </div>

             </div>

             {/* RIGHT PLAYER */}
             {renderOpponentStack(rightOpponent, 'right')}
          </div>

          {/* TURN STATUS BANNER */}
          <div className="relative z-10 w-full flex items-center justify-between bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                {isMyTurn && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isMyTurn ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
              </span>
              <span className={`text-xs font-black tracking-wide uppercase ${isMyTurn ? 'text-emerald-400' : 'text-slate-400'}`}>
                {isMyTurn ? 'YOUR TURN' : `${players[gameState.currentTurn]?.name}'S TURN`}
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
              <span className="text-[10px] text-slate-400 uppercase">CLOCKWISE ↻</span>
            </div>
          </div>

        </div>

        {/* PLAYER'S HAND */}
        <div className="w-full flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              YOUR HAND <span className="text-white">({myHand.length} CARDS)</span>
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">
              TAP A MATCHING CARD TO PLAY
            </span>
          </div>
          
          <div className="w-full flex items-end justify-center py-2 px-1 relative min-h-[140px] overflow-visible">
            {myHand.map((c, i) => {
              // Calculate fan curve
              const mid = (myHand.length - 1) / 2;
              const offset = i - mid;
              const angle = offset * 6; // max +-24 degrees
              const yOffset = Math.abs(offset) * 2;
              
              const canPlay = isMyTurn && (c.color === 'wild' || c.color === activeCard.color || c.value === activeCard.value);
              
              return (
                <div 
                  key={i}
                  style={{
                    transform: `rotate(${angle}deg) translateY(${yOffset}px)`,
                    marginRight: '-24px',
                    zIndex: i
                  }}
                  className={`transition-all duration-200 ${canPlay ? 'hover:-translate-y-6 hover:rotate-0 hover:z-30 hover:scale-105 cursor-pointer' : 'opacity-80'}`}
                >
                  <Card card={c} onClick={() => handlePlay(c, i)} />
                </div>
              );
            })}
          </div>
          
          {/* DOCK BUTTONS */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button 
              onClick={handleDraw}
              disabled={!isMyTurn}
              className={`h-12 rounded-xl flex items-center justify-center gap-2 text-white font-mono font-bold text-sm shadow-md transition-all ${isMyTurn ? 'bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700' : 'bg-slate-900 border-slate-800 opacity-50'}`}
            >
              <span className="material-symbols-outlined text-emerald-400 text-xl">add_circle</span>
              <span>DRAW CARD</span>
            </button>
            <button 
              className="h-12 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:brightness-110 active:scale-95 flex items-center justify-center gap-2 text-white font-black text-lg tracking-wider shadow-[0_0_20px_rgba(244,63,94,0.5)] transition-all animate-pulse"
            >
              <span className="material-symbols-outlined text-white text-2xl font-black">campaign</span>
              <span>UNO!</span>
            </button>
          </div>
        </div>
      </main>

      {/* FLOATING MEME FAB */}
      <div className="fixed bottom-20 right-4 z-40 flex items-center justify-center">
        <button 
          onClick={() => setIsMemeOpen(true)}
          className="group flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-xs font-mono tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.55)] border-2 border-white/80 active:scale-95 hover:scale-105 transition-all duration-200 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px] text-black font-black animate-pulse">campaign</span>
          <span>MEMES</span>
          <span className="px-1 rounded bg-black text-amber-400 text-[9px] font-mono font-extrabold">ROAST</span>
        </button>
      </div>

      <MemeModal isOpen={isMemeOpen} onClose={() => setIsMemeOpen(false)} />

    </div>
  );
}
