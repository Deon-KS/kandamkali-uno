import React, { useState, useEffect } from 'react';
import { useGameState } from '../store/GameStateContext';
import { playCardEngine, drawCardEngine } from '../services/gameEngine';
import Card from './Card';
import MemeModal from './MemeModal';

export default function GameBoard() {
  const { gameState: room, playerId, updateState } = useGameState();
  const [isMemeOpen, setIsMemeOpen] = useState(false);
  const [pendingWildCardIndex, setPendingWildCardIndex] = useState(null);
  const [showDavi, setShowDavi] = useState(false);
  const [daviEvent, setDaviEvent] = useState(null);
  const [isLogOpen, setIsLogOpen] = useState(false);

  if (!room || !room.players || !room.gameState) return null;

  const gs = room.gameState;
  const playersMap = room.players;

  const myHand = playersMap[playerId]?.hand || [];
  const activeCard = gs.topDiscardCard;
  const activeColor = gs.activeColor;
  const isMyTurn = gs.currentTurnPlayerId === playerId;

  const playerIds = Object.keys(playersMap);
  const myIndex = playerIds.indexOf(playerId);
  
  const otherIds = [];
  if (myIndex !== -1) {
    for (let i = 1; i < playerIds.length; i++) {
      otherIds.push(playerIds[(myIndex + i) % playerIds.length]);
    }
  }

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

  // Bot Logic
  useEffect(() => {
    if (!room || !gs.currentTurnPlayerId || gs.winnerId || showDavi) return;
    
    const currentPlayer = playersMap[gs.currentTurnPlayerId];
    if (currentPlayer?.isBot) {
      // It's a bot's turn! Set a small delay for realism
      const timer = setTimeout(() => {
        const hand = currentPlayer.hand || [];
        
        // Find a valid card
        const validIndex = hand.findIndex(card => 
          card.color === 'wild' || 
          card.color === gs.activeColor || 
          card.value === gs.topDiscardCard.value
        );

        if (validIndex !== -1) {
          const cardToPlay = hand[validIndex];
          let selectedColor = null;
          if (cardToPlay.color === 'wild') {
            const colors = ['red', 'blue', 'green', 'yellow'];
            selectedColor = colors[Math.floor(Math.random() * colors.length)];
          }
          
          try {
            const newState = playCardEngine(room, gs.currentTurnPlayerId, validIndex, selectedColor);
            updateState(newState);
          } catch (e) {
            console.error("Bot failed to play:", e);
          }
        } else {
          // Draw a card
          try {
            const newState = drawCardEngine(room, gs.currentTurnPlayerId);
            updateState(newState);
          } catch (e) {
            console.error("Bot failed to draw:", e);
          }
        }
      }, 2000); // 2 second delay

      return () => clearTimeout(timer);
    }
  }, [gs.currentTurnPlayerId, room, playersMap, gs.activeColor, gs.topDiscardCard, gs.winnerId, updateState, showDavi]);

  // DAVI Dialog Listener
  useEffect(() => {
    if (gs.daviEvent && gs.daviEvent.id !== daviEvent?.id) {
      setDaviEvent(gs.daviEvent);
      setShowDavi(true);
    }
  }, [gs.daviEvent?.id]);

  const handleDraw = () => {
    if (!isMyTurn) return;
    try {
      const newState = drawCardEngine(room, playerId);
      updateState(newState);
    } catch (e) {
      console.error(e.message);
    }
  };

  const handlePlay = (card, index) => {
    if (!isMyTurn) return;
    const canPlay = card.color === 'wild' || card.color === activeColor || card.value === activeCard.value;
    if (canPlay) {
      if (card.color === 'wild') {
        setPendingWildCardIndex(index);
      } else {
        try {
          const newState = playCardEngine(room, playerId, index);
          updateState(newState);
        } catch (e) {
          console.error(e.message);
        }
      }
    }
  };

  const handleColorSelect = (color) => {
    if (pendingWildCardIndex === null) return;
    try {
      const newState = playCardEngine(room, playerId, pendingWildCardIndex, color);
      updateState(newState);
    } catch (e) {
      console.error(e.message);
    }
    setPendingWildCardIndex(null);
  };

  // Helper to render top opponent exactly like HTML
  const renderTopOpponent = (oppId) => {
    if (!oppId) return <div className="h-[90px]" />;
    const p = playersMap[oppId];
    const cardCount = p.cardCount || 0;
    const isBot = p.isBot;
    return (
      <div className="relative z-20 flex flex-col items-center mb-1">
        <div className="relative group flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-950/90 border border-emerald-500/40 shadow-[0_0_15px_rgba(0,229,91,0.25)] backdrop-blur-md">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-emerald-400/80 shadow-[0_0_8px_rgba(0,255,102,0.5)] bg-black flex items-center justify-center">
            {isBot ? (
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmq6_HF7D3C81cL9aDLbW277QfYLzwRCKOIm-DdHFZL97Ot3Ly8kvJrIYbYIBr1lcUNTSDOGDFpaFALw2sOpgpCtbN1ZYA4Dpx0Uc9RuF5l9jZSLpwjjZhialno_Fn_TjkmheZfingZx7OjfJiDsL4c8i43E0lO-ftfM7f404cs4NaHCB2WLVfdompxsttdJz1CO9rKJrwensQX6zVdgiwy8QYmG6pku-J2o_9Ps6AMkmKHIDc4rE" alt="Bot avatar" className="w-full h-full object-cover" />
            ) : (
               <div className="w-full h-full bg-rose-500 flex items-center justify-center font-bold text-[10px] text-white">
                {p.name.charAt(0).toUpperCase()}
               </div>
            )}
            <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none mix-blend-screen"></div>
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-black text-emerald-400 tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                {p.name.substring(0, 8).toUpperCase()}
              </span>
              {isBot && (
                <span className="text-[8px] font-mono font-bold px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">ROGUE AI</span>
              )}
            </div>
            <span className="text-[8px] font-mono text-emerald-400/80 uppercase tracking-tight">[WATCHING ARENA]</span>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center mt-1">
          <div className="flex items-center -space-x-4 mb-1">
            <div className="w-6 h-9 rounded bg-red-600 border border-white shadow-md transform -rotate-12 flex items-center justify-center">
              <span className="text-[7px] text-white font-extrabold italic">UNO</span>
            </div>
            <div className="w-6 h-9 rounded bg-red-600 border border-white shadow-md transform rotate-6 flex items-center justify-center">
              <span className="text-[7px] text-white font-extrabold italic">UNO</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/85 backdrop-blur-md border border-rose-500/50 shadow-lg">
            <div className="relative">
              <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center font-bold text-[10px] text-white">
                {p.name.charAt(0).toUpperCase()}
              </div>
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            </div>
            <span className="text-xs font-bold text-slate-100 truncate max-w-[60px]">{p.name}</span>
            <span className="text-[10px] font-mono font-bold bg-rose-600 text-white px-1.5 py-0.5 rounded-full uppercase animate-pulse">
              {cardCount} CARD{cardCount !== 1 ? 'S' : ''}!
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Helper to render side opponent exactly like HTML
  const renderSideOpponent = (oppId, side) => {
    if (!oppId) return <div className="w-[80px]" />;
    const p = playersMap[oppId];
    const cardCount = p.cardCount || 0;
    
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center -space-x-3">
          <div className={`w-5 h-8 rounded bg-red-600 border border-white shadow ${side === 'left' ? '-rotate-12' : '-rotate-6'}`}></div>
          <div className="w-5 h-8 rounded bg-red-600 border border-white shadow rotate-0"></div>
          <div className="w-5 h-8 rounded bg-red-600 border border-white shadow rotate-12 flex items-center justify-center">
            <span className="text-[6px] text-white font-black italic">UNO</span>
          </div>
        </div>
        <div className="flex flex-col items-center px-2 py-1 rounded-lg bg-slate-900/85 border border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-1">
            <div className={`w-4 h-4 rounded-full ${side === 'left' ? 'bg-sky-500' : 'bg-purple-500'} text-[9px] font-bold text-white flex items-center justify-center`}>{p.name.charAt(0).toUpperCase()}</div>
            <span className="text-[11px] font-bold text-slate-200 truncate max-w-[50px]">{p.name}</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-semibold">{cardCount} Cards</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#0b0e14] font-space text-on-surface flex flex-col min-h-screen relative selection:bg-emerald-500 selection:text-black antialiased overflow-hidden">
      
      {/* TOP HEADER */}
      <header className="fixed top-0 w-full z-40 pt-safe bg-[#111319]/90 backdrop-blur-md border-b border-white/5 left-0 right-0">
        <div className="h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-base shadow-sm">
              🃏
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-wider uppercase text-white">KANDAMKALI UNO</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  ARENA 04
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">CLASSIC 4-PLAYER • 24ms</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsMemeOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/40 text-amber-300 active:scale-95 transition-all text-xs font-mono font-bold hover:bg-amber-400/20 shadow-sm">
              <span className="material-symbols-outlined text-[16px]">campaign</span>
              <span>MEME AUDIO</span>
            </button>
            <button aria-label="Audio Mute" className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700 active:scale-95">
              <span className="material-symbols-outlined text-[18px]">volume_up</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN ARENA CANVAS */}
      <main className="flex-1 flex flex-col pt-16 pb-20 px-3 w-full h-[100dvh] max-w-5xl mx-auto justify-between relative select-none">
        
        {/* DAVI LOG DROPDOWN */}
        {gs.daviLogs && gs.daviLogs.length > 0 && (
          <div className="w-full flex flex-col relative z-30 mb-1">
            <button 
              onClick={() => setIsLogOpen(!isLogOpen)}
              className="flex items-center justify-between bg-red-950/80 border border-red-500/40 px-4 py-2 rounded-lg hover:bg-red-900/80 transition-colors shadow-md backdrop-blur-md"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500 text-lg animate-pulse">warning</span>
                <span className="text-xs font-mono text-red-100 font-bold tracking-widest uppercase">DAVI Punishment Log</span>
                <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{gs.daviLogs.length}</span>
              </div>
              <span className={`material-symbols-outlined text-red-400 transition-transform ${isLogOpen ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            
            {isLogOpen && (
              <div className="absolute top-full left-0 w-full mt-1 bg-black/90 border-2 border-red-500/50 rounded-lg shadow-[0_4px_20px_rgba(220,38,38,0.3)] max-h-[200px] overflow-y-auto backdrop-blur-xl">
                <div className="p-2 flex flex-col gap-2">
                  {gs.daviLogs.map(log => (
                    <div key={log.id} className="bg-red-950/40 p-2 rounded border border-red-500/20 flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-mono text-red-300 font-bold uppercase">[{log.title}]</span>
                        <span className="text-[9px] font-mono text-slate-500">{new Date(log.id).toLocaleTimeString()}</span>
                      </div>
                      <span className="text-[11px] font-bold text-white uppercase">{log.punishment}</span>
                      <span className="text-[10px] font-mono text-red-400/80 mt-0.5">TARGET: {log.target}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIRTUAL UNO GAME TABLE */}
        <div className="relative w-full flex-1 my-1 rounded-[36px] bg-gradient-to-b from-[#143224] via-[#0d2319] to-[#0a1811] border-[5px] border-[#224f38]/50 shadow-[inset_0_0_60px_rgba(0,0,0,0.8),0_12px_32px_rgba(0,0,0,0.6)] flex flex-col items-center justify-between p-3 overflow-hidden">
          
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none"></div>
          
          <div className={`absolute inset-x-8 top-16 bottom-20 rounded-full border border-emerald-500/20 ${gs.turnDirection === 1 ? 'direction-spin' : 'direction-spin-reverse'} pointer-events-none flex items-center justify-between px-2`}>
            <span className="material-symbols-outlined text-emerald-400/40 text-xs">arrow_forward</span>
            <span className="material-symbols-outlined text-emerald-400/40 text-xs">arrow_back</span>
          </div>

          {/* TOP PLAYER */}
          {renderTopOpponent(topOpponent)}

          {/* MID ROW */}
          <div className="relative z-10 w-full flex items-center justify-between px-1">
            {/* LEFT PLAYER */}
            {renderSideOpponent(leftOpponent, 'left')}

            {/* CENTER TABLE */}
            <div className="flex items-center justify-center gap-4">
              {/* DRAW DECK */}
              <button onClick={handleDraw} disabled={!isMyTurn} className="group relative flex flex-col items-center active:scale-95 transition-transform" title="Draw Card">
                <div className="absolute w-16 h-24 rounded-xl bg-slate-950/80 translate-y-1.5 translate-x-1 shadow-md"></div>
                <div className="absolute w-16 h-24 rounded-xl bg-slate-900/90 translate-y-0.5 translate-x-0.5 border border-white/20"></div>
                <div className={`uno-card uno-black w-16 h-24 flex items-center justify-center relative cursor-pointer ${isMyTurn ? 'shadow-[0_0_20px_rgba(255,215,0,0.6)] border-amber-400 border-[3px]' : 'group-hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]'}`}>
                  <div className="w-14 h-20 bg-black rounded-lg flex items-center justify-center border border-white/40 overflow-hidden">
                    <div className="w-12 h-16 bg-red-600 rounded-full rotate-[-30deg] flex items-center justify-center shadow-inner">
                      <span className="text-[#facc15] font-black italic text-xs tracking-tighter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">UNO</span>
                    </div>
                  </div>
                  <span className="absolute bottom-1 right-1 font-mono text-[8px] text-white/70 font-normal">{gs.deck?.length || 0}</span>
                </div>
                <span className={`text-[9px] font-mono font-bold mt-1 uppercase tracking-wider ${isMyTurn ? 'text-amber-400 animate-pulse' : 'text-emerald-300/80'}`}>DRAW</span>
              </button>

              {/* ACTIVE DISCARD PILE */}
              <div className="relative flex flex-col items-center">
                <div className="absolute w-[72px] h-[104px] rounded-xl bg-black/40 rotate-6 translate-y-1 blur-sm"></div>
                <div className="rotate-[-2deg] transition-transform hover:rotate-0 shadow-2xl relative z-10">
                  <Card card={{...activeCard, color: activeCard.color === 'wild' ? activeColor : activeCard.color}} className="w-[72px] h-[104px]" />
                </div>
                <div className={`flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full border relative z-20 ${
                  activeColor === 'red' ? 'bg-rose-500/20 border-rose-400/40' :
                  activeColor === 'blue' ? 'bg-sky-500/20 border-sky-400/40' :
                  activeColor === 'green' ? 'bg-emerald-500/20 border-emerald-400/40' :
                  activeColor === 'yellow' ? 'bg-amber-500/20 border-amber-400/40' : 'bg-slate-500/20 border-slate-400/40'
                }`}>
                  <span className={`w-2 h-2 rounded-full animate-pulse ${
                    activeColor === 'red' ? 'bg-rose-400' :
                    activeColor === 'blue' ? 'bg-sky-400' :
                    activeColor === 'green' ? 'bg-emerald-400' :
                    activeColor === 'yellow' ? 'bg-amber-400' : 'bg-slate-400'
                  }`}></span>
                  <span className={`text-[9px] font-mono font-bold uppercase ${
                    activeColor === 'red' ? 'text-rose-300' :
                    activeColor === 'blue' ? 'text-sky-300' :
                    activeColor === 'green' ? 'text-emerald-300' :
                    activeColor === 'yellow' ? 'text-amber-300' : 'text-slate-300'
                  }`}>SUIT: {activeColor}</span>
                </div>
              </div>
            </div>

            {/* RIGHT PLAYER */}
            {renderSideOpponent(rightOpponent, 'right')}
          </div>

          {/* TURN STATUS BANNER */}
          <div className="relative z-10 w-full flex items-center justify-between bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 mt-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                {isMyTurn && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isMyTurn ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              </span>
              <span className={`text-xs font-black tracking-wide uppercase ${isMyTurn ? 'text-emerald-400' : 'text-slate-300'}`}>
                {isMyTurn ? 'YOUR TURN' : `${playersMap[gs.currentTurnPlayerId]?.name}'S TURN`}
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
              <span className="text-[10px] text-slate-400 uppercase">{gs.turnDirection === 1 ? 'CLOCKWISE ↻' : 'REVERSE ↺'}</span>
            </div>
          </div>
        </div>

        {/* PLAYER'S HAND */}
        <div className="w-full flex flex-col gap-2 pt-1 relative z-20">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              YOUR HAND <span className="text-white">({myHand.length} CARDS)</span>
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold">
              TAP A MATCHING CARD TO PLAY
            </span>
          </div>
          
          <div className="w-full flex items-end justify-center py-2 px-1 relative min-h-[140px] overflow-visible">
            {myHand.map((card, idx) => {
              // Exact fan angles from HTML
              const angles = ['-rotate-12 translate-y-1', '-rotate-6 -translate-y-1', 'rotate-0 -translate-y-2', 'rotate-6 -translate-y-1', 'rotate-12 translate-y-1'];
              const angleClass = angles[idx % angles.length];
              
              const canPlay = isMyTurn && (card.color === 'wild' || card.color === activeColor || card.value === activeCard.value);

              return (
                <div key={idx} className={`transform ${angleClass} hover:-translate-y-6 hover:rotate-0 hover:z-30 hover:scale-105 active:translate-y-0 transition-all duration-200 ${canPlay ? 'drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]' : 'opacity-60 saturate-50'}`} style={{ marginRight: idx === myHand.length - 1 ? '0' : '-24px' }}>
                  <Card card={card} onClick={() => handlePlay(card, idx)} />
                </div>
              );
            })}
          </div>

          {/* DOCK BUTTONS */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button onClick={handleDraw} disabled={!isMyTurn} className="h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 flex items-center justify-center gap-2 text-white font-mono font-bold text-sm shadow-md transition-all disabled:opacity-50">
              <span className="material-symbols-outlined text-emerald-400 text-xl">add_circle</span>
              <span>DRAW CARD</span>
            </button>
            <button className="h-12 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:brightness-110 active:scale-95 flex items-center justify-center gap-2 text-white font-black text-lg tracking-wider shadow-[0_0_20px_rgba(244,63,94,0.5)] transition-all animate-pulse">
              <span className="material-symbols-outlined text-white text-2xl font-black">campaign</span>
              <span>UNO!</span>
            </button>
          </div>
        </div>
      </main>

      {/* FLOATING MEME FAB */}
      <div className="fixed bottom-20 right-4 md:right-8 z-40 flex items-center justify-center pointer-events-none">
        <div className="w-full flex justify-end pr-4 pointer-events-auto">
          <button onClick={() => setIsMemeOpen(true)} className="group flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-xs font-mono tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.55)] border-2 border-white/80 active:scale-95 hover:scale-105 transition-all duration-200 cursor-pointer">
            <span className="material-symbols-outlined text-[18px] text-black font-black animate-pulse">campaign</span>
            <span>MEMES</span>
            <span className="px-1 py-0.5 rounded bg-black text-amber-400 text-[9px] font-mono font-extrabold">ROAST</span>
          </button>
        </div>
      </div>

      {/* CLEAN BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 w-full z-40 pb-safe bg-[#111319]/95 backdrop-blur-md border-t border-white/5 left-0 right-0">
        <div className="flex items-center justify-around h-16 px-4">
          <a className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-white transition-colors" href="#">
            <span className="material-symbols-outlined text-[20px]">grid_view</span>
            <span className="text-[10px] font-mono tracking-wider">LOBBY</span>
          </a>
          <a className="flex flex-col items-center justify-center gap-1 text-emerald-400 font-bold" href="#">
            <span className="material-symbols-outlined text-[20px]">sports_esports</span>
            <span className="text-[10px] font-mono tracking-wider">ARENA</span>
          </a>
          <button onClick={() => setIsMemeOpen(true)} className="flex flex-col items-center justify-center gap-1 text-amber-300 hover:text-amber-200 transition-colors">
            <span className="material-symbols-outlined text-[20px]">graphic_eq</span>
            <span className="text-[10px] font-mono tracking-wider">SOUNDS</span>
          </button>
          <a className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-white transition-colors" href="#">
            <span className="material-symbols-outlined text-[20px]">menu_book</span>
            <span className="text-[10px] font-mono tracking-wider">RULES</span>
          </a>
        </div>
      </nav>

      {/* MEME MODAL */}
      <MemeModal isOpen={isMemeOpen} onClose={() => setIsMemeOpen(false)} />

      {/* COLOR PICKER POPUP */}
      {pendingWildCardIndex !== null && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-slate-700 p-5 rounded-2xl shadow-2xl w-full max-w-[280px] animate-in zoom-in-95 duration-200">
            <div className="text-center mb-4">
              <h3 className="font-extrabold text-white text-lg uppercase tracking-wide">Select Color</h3>
              <p className="text-slate-400 text-xs font-mono">Choose the new active suit</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleColorSelect('red')} className="aspect-square rounded-xl bg-rose-600 border-[3px] border-rose-400 shadow-[0_0_15px_rgba(225,29,72,0.5)] active:scale-95 transition-transform"></button>
              <button onClick={() => handleColorSelect('blue')} className="aspect-square rounded-xl bg-blue-600 border-[3px] border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.5)] active:scale-95 transition-transform"></button>
              <button onClick={() => handleColorSelect('green')} className="aspect-square rounded-xl bg-emerald-600 border-[3px] border-emerald-400 shadow-[0_0_15px_rgba(5,150,105,0.5)] active:scale-95 transition-transform"></button>
              <button onClick={() => handleColorSelect('yellow')} className="aspect-square rounded-xl bg-amber-500 border-[3px] border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] active:scale-95 transition-transform"></button>
            </div>
            <button onClick={() => setPendingWildCardIndex(null)} className="mt-4 w-full py-2 bg-slate-800 text-slate-300 rounded-lg text-sm font-bold uppercase active:scale-95">Cancel</button>
          </div>
        </div>
      )}

      {/* DAVI DIALOG POPUP */}
      {showDavi && daviEvent && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden">
          <div className="relative bg-[#200505]/95 border-4 border-red-600 p-6 shadow-[0_0_60px_rgba(220,38,38,0.4)] w-full max-w-md flex flex-col items-center animate-in zoom-in-95 duration-200">
            {/* GLITCH EFFECTS */}
            <div className="absolute inset-0 bg-[repeating-linear-gradient(transparent,transparent_2px,rgba(220,38,38,0.1)_2px,rgba(220,38,38,0.1)_4px)] pointer-events-none mix-blend-overlay"></div>
            
            <h2 className="text-2xl font-black text-red-500 uppercase tracking-widest mb-4 animate-pulse drop-shadow-[0_0_10px_rgba(220,38,38,0.8)] flex items-center gap-2">
              <span className="material-symbols-outlined text-[28px]">warning</span>
              SYSTEM OVERRIDE
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </h2>
            
            <div className="w-28 h-28 bg-black border-2 border-red-500 rounded-full overflow-hidden mb-4 shadow-[0_0_20px_rgba(220,38,38,0.5)] flex items-center justify-center relative">
               <div className="absolute inset-0 bg-red-500/20 mix-blend-color-burn animate-pulse z-10 pointer-events-none"></div>
               <img src="/davi-avatar.png" alt="DAVI AI Avatar" className="w-full h-full object-cover" />
            </div>

            <div className="text-center relative z-10 w-full mb-6">
              <span className="inline-block bg-red-600 text-white font-mono text-[10px] px-2 py-0.5 rounded-sm mb-2 font-bold uppercase tracking-widest">
                D.A.V.I PROTOCOL: {daviEvent.title}
              </span>
              <p className="text-lg font-mono font-bold text-red-50 bg-red-950/60 p-4 border border-red-500/30 leading-snug">"{daviEvent.message}"</p>
              
              <div className="mt-3 bg-black/80 border-l-4 border-red-500 p-2 text-left">
                <p className="text-[10px] font-mono text-red-400 uppercase tracking-widest mb-1">PUNISHMENT EXECUTED:</p>
                <p className="text-sm font-bold text-white uppercase">{daviEvent.punishment}</p>
                {daviEvent.target && daviEvent.target !== 'Global' && (
                  <p className="text-xs font-mono text-red-300 mt-1">TARGET LOCK: {daviEvent.target}</p>
                )}
              </div>
            </div>

            <button onClick={() => setShowDavi(false)} className="relative z-10 bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-3 rounded-lg uppercase tracking-widest shadow-[0_4px_15px_rgba(220,38,38,0.4)] active:scale-95 transition-all w-full flex items-center justify-center gap-2">
              <span>SKIP PROTOCOL</span>
              <span className="material-symbols-outlined text-[20px]">fast_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* GAME OVER MODAL */}
      {gs.winnerId && (
        <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="flex flex-col items-center">
            <h1 className="text-5xl font-black text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.8)] uppercase mb-2 animate-bounce">Winner!</h1>
            <p className="text-xl text-white font-mono font-bold bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
              {playersMap[gs.winnerId]?.name} DOMINATED
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
