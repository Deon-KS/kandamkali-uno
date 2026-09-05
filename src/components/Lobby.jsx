import React, { useState } from 'react';
import { useGameState } from '../store/GameStateContext';
import { createRoom, joinRoom } from '../services/firebase';

export default function Lobby() {
  const { setRoomCode, setPlayerId, setIsOffline, updateState } = useGameState();
  const [activeTab, setActiveTab] = useState('create');
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleHost = async () => {
    if (!name.trim()) return setError("Enter your Call-sign first!");
    setLoading(true);
    setError('');
    try {
      const pId = crypto.randomUUID();
      const code = await createRoom(pId, name);
      setPlayerId(pId);
      setRoomCode(code);
      setIsOffline(false);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!name.trim()) return setError("Enter your Call-sign first!");
    if (!joinCode.trim()) return setError("Enter a room code!");
    setLoading(true);
    setError('');
    try {
      const pId = crypto.randomUUID();
      const code = joinCode.toUpperCase();
      await joinRoom(code, pId, name);
      setPlayerId(pId);
      setRoomCode(code);
      setIsOffline(false);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handlePractice = () => {
    if (!name.trim()) return setError("Enter your Call-sign first!");
    const pId = crypto.randomUUID();
    setPlayerId(pId);
    setRoomCode('OFFLINE'); 
    setIsOffline(true);

    const dummyState = {
      meta: { status: 'PLAYING' },
      players: {
        [pId]: { name, isHost: true, hand: [
          { color: 'green', value: '4' },
          { color: 'red', value: 'skip' },
          { color: 'blue', value: 'reverse' },
          { color: 'wild', value: '+4' },
          { color: 'red', value: '2' }
        ], cardCount: 5 },
        'bot1': { name: 'Davi (AI)', isBot: true, hand: [], cardCount: 5 },
        'bot2': { name: 'Salim (Bot)', isBot: true, hand: [], cardCount: 4 },
        'bot3': { name: 'Jagathy (Bot)', isBot: true, hand: [], cardCount: 6 }
      },
      gameState: {
        currentTurnPlayerId: pId,
        activeColor: 'yellow',
        topDiscardCard: { color: 'yellow', value: '7' },
      },
      chat: {}
    };

    updateState(dummyState);
  };

  return (
    <div className="bg-surface font-mono text-on-surface flex flex-col min-h-screen relative selection:bg-primary-container selection:text-on-primary-container max-w-md mx-auto border-x border-white/5">
      <div className="fixed inset-0 scanlines z-40 max-w-md mx-auto"></div>
      
      {/* HEADER */}
      <header className="sticky top-0 w-full z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-4 flex items-center justify-between gap-1">
          <div className="flex flex-col truncate">
            <span className="text-[12px] text-primary-fixed tracking-wider uppercase font-space font-bold truncate">ROGUE UNO // CHAOS ENGINE</span>
            <div className="flex items-center gap-1">
              <span className="text-[26px] font-space font-bold text-on-surface leading-tight">Lobby</span>
              <span className="px-1 py-0.5 bg-surface-container-high text-primary-container text-[10px] uppercase tracking-wider shrink-0 font-bold">24ms // OFFLINE</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full pb-24 bg-surface px-4 mt-4">
        
        {/* Error Banner */}
        {error && (
          <div className="bg-rose-500/20 border border-rose-500/50 p-2 text-rose-300 text-xs font-bold mb-4 uppercase">
            {error}
          </div>
        )}

        {/* Hero Visual */}
        <div className="relative bg-surface-container-high p-4 shadow-xl overflow-hidden mb-4">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary-container/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center gap-1 mb-2">
             <span className="bg-primary-container text-on-primary-container text-[10px] px-1 py-0.5 font-bold tracking-wider">VERSION 2.4.0</span>
             <span className="bg-tertiary-container text-on-tertiary-container text-[10px] px-1 py-0.5 font-bold tracking-wider">MALAYALAM ENGINE</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="min-w-0">
               <h1 className="text-[38px] font-space font-bold uppercase text-on-surface tracking-tight leading-none truncate">ROGUE UNO</h1>
               <p className="text-[12px] text-primary-fixed uppercase tracking-widest leading-tight mt-0.5">THE MALAYALAM CHAOS ENGINE</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ENTER YOUR CALL-SIGN"
              className="w-full bg-surface-container-lowest p-2 text-[14px] text-on-surface placeholder:text-on-surface-variant focus:outline-none shadow-inner border border-white/5 uppercase"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-1 mb-4">
          <button 
            className={`py-2 px-4 flex items-center justify-center gap-1 shadow-md transition-transform active:translate-y-0.5 ${activeTab === 'create' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container text-on-surface-variant hover:text-on-surface'}`}
            onClick={() => setActiveTab('create')}
          >
            <span className="material-symbols-outlined text-[18px]">add_box</span>
            <span className="text-[14px] font-bold uppercase tracking-wider">CREATE</span>
          </button>
          <button 
            className={`py-2 px-4 flex items-center justify-center gap-1 shadow-md transition-transform active:translate-y-0.5 ${activeTab === 'join' ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-surface-container text-on-surface-variant hover:text-on-surface'}`}
            onClick={() => setActiveTab('join')}
          >
            <span className="material-symbols-outlined text-[18px]">meeting_room</span>
            <span className="text-[14px] font-bold uppercase tracking-wider">JOIN</span>
          </button>
        </div>

        {/* CREATE SECTION */}
        {activeTab === 'create' && (
          <div className="flex flex-col gap-4">
            {/* Practice CTA */}
             <button 
                onClick={handlePractice}
                className="w-full py-4 bg-primary-container text-on-primary-container shadow-xl active:translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[24px]">local_fire_department</span>
                <span className="text-[22px] font-space uppercase tracking-wider font-bold">PRACTICE (BOTS)</span>
              </button>

             <button 
                onClick={handleHost}
                disabled={loading}
                className="w-full py-4 bg-secondary-container text-on-secondary-container shadow-xl active:translate-y-1 transition-all flex items-center justify-center gap-2 mt-4"
              >
                <span className="material-symbols-outlined text-[24px]">language</span>
                <span className="text-[22px] font-space uppercase tracking-wider font-bold">HOST ONLINE</span>
              </button>
          </div>
        )}

        {/* JOIN SECTION */}
        {activeTab === 'join' && (
          <div className="bg-surface-container p-4 shadow-md flex flex-col gap-4">
             <div>
               <span className="text-[10px] uppercase tracking-wider text-on-surface-variant">ENTER ENCRYPTED 6-CHAR PIN</span>
               <input 
                  type="text" 
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value)}
                  maxLength={6}
                  placeholder="------"
                  className="w-full h-12 mt-2 text-center bg-surface-container-lowest text-tertiary-fixed text-[22px] font-space uppercase focus:outline-none focus:bg-surface-container-high shadow-inner tracking-[1em]"
               />
             </div>
             
             <button 
                onClick={handleJoin}
                disabled={loading}
                className="w-full py-4 bg-tertiary-container text-on-tertiary-container shadow-xl active:translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[22px]">login</span>
                <span className="text-[22px] font-space uppercase tracking-wider font-bold">ENTER ARENA</span>
              </button>
          </div>
        )}

      </main>
    </div>
  );
}
