import React, { useState } from 'react';
import { useGameState } from '../store/GameStateContext';
import { createRoom, joinRoom } from '../services/firebase';
import { initializeGame } from '../services/gameEngine';

export default function Lobby() {
  const { roomCode, setRoomCode, playerId, setPlayerId, setIsOffline, updateState, gameState } = useGameState();
  const [activeTab, setActiveTab] = useState('create');
  const [name, setName] = useState('Parakkum_Thalika_Hero');
  const [joinCode, setJoinCode] = useState('KRL');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [referee, setReferee] = useState('Salim Kumar');
  const [chaosMode, setChaosMode] = useState('100%');

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
    if (!joinCode.trim() || joinCode.length !== 6) return setError("Enter a valid 6-char room code!");
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

  const handleStartRealGame = () => {
    if (!gameState) return;
    const newState = initializeGame(gameState);
    updateState(newState);
  };

  const handlePractice = () => {
    if (!name.trim()) return setError("Enter your Call-sign first!");
    const pId = crypto.randomUUID();
    setPlayerId(pId);
    setRoomCode('KRL-420'); 
    setIsOffline(true);

    const dummyState = {
      meta: { status: 'LOBBY', hostId: pId },
      players: {
        [pId]: { name, isHost: true, hand: [], cardCount: 0, isOnline: true },
        'bot1': { name: 'Mallu_Cyberpunk', isBot: true, hand: [], cardCount: 0, isOnline: true },
        'bot2': { name: 'Appukuttan_99', isBot: true, hand: [], cardCount: 0, isOnline: true },
        'bot3': { name: 'Kozhikode_King', isBot: true, hand: [], cardCount: 0, isOnline: true }
      },
      gameState: {},
      chat: {}
    };

    updateState(dummyState);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode || 'KRL-420');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHost = gameState && gameState.meta && gameState.meta.hostId === playerId;
  const playersList = gameState && gameState.players ? Object.values(gameState.players) : [];
  const joinedCount = playersList.length;

  return (
    <div className="bg-surface font-body-md text-on-surface flex flex-col min-h-screen relative selection:bg-primary-container selection:text-on-primary-container w-full mx-auto">
      <div className="fixed inset-0 scanlines z-40 w-full pointer-events-none"></div>
      
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] mx-auto border-b border-white/5">
        <div className="h-16 px-gutter-mobile flex items-center justify-between gap-space-xs">
          <div className="flex items-center gap-space-xs min-w-0">
            <img alt="Rogue Uno Arcade Logo" className="h-8 w-auto object-contain shrink-0" src="https://lh3.googleusercontent.com/aida/AEtjO1XrwV3KLZ23OLhbXxQOBP69A8N1NdFKlGXwoCIUIqPEp_GSNiqGJggWc3iXS3JOxj9x7kI1M9WvB4Tjgn9yNhz5HrhaelBCNPD1rzIgxghukuOI8GLehuzEtD-qSMF6i0Pq-vRYKKEZhVPAxV9gyk95eTCVisTv8ka3uCAzcPytjfwLnKiJT9whs1AqRU6KGw76JNHTa1--81pRF_DVirPhZ2l1cJYduxC75IHTi4JDEFprAGnPjpgo" />
            <div className="flex flex-col truncate">
              <span className="font-headline-md text-label-md text-primary-fixed tracking-wider uppercase truncate">KANDAMKALI UNO // CHAOS ENGINE</span>
              <div className="flex items-center gap-space-xs">
                <span className="font-headline-lg-mobile text-headline-md text-on-surface truncate leading-tight">Lobby</span>
                <span className="px-space-xs py-0.5 bg-surface-container-high text-primary-container font-label-sm text-label-sm uppercase tracking-wider shrink-0">24ms // KERALA SERVER</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <button aria-label="Soundbite Toggle" className="w-11 h-11 flex items-center justify-center bg-surface-container text-primary-container active:translate-y-0.5 transition-transform">
              <span className="material-symbols-outlined text-[20px]">volume_up</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full max-w-5xl mx-auto pt-16 pb-24 bg-surface px-4 md:px-8 mt-4">
        {error && (
          <div className="bg-rose-500/20 border border-rose-500/50 p-2 text-rose-300 text-xs font-bold mb-4 uppercase w-full">
            {error}
          </div>
        )}

        <div className="flex flex-col w-full gap-space-md">
          {/* Status Live Banner */}
          <div className="flex items-center justify-between bg-surface-container px-space-md py-space-xs shadow-md mt-2">
            <div className="flex items-center gap-space-xs">
              <span className="w-2.5 h-2.5 bg-primary-container shadow-[0_0_8px_#00ff66] animate-pulse"></span>
              <span className="font-label-sm text-label-sm uppercase text-primary-container tracking-wider">NETWORK NODE: KOCHI-IX</span>
            </div>
            <div className="bg-secondary-container px-space-xs py-0.5 shadow-sm">
              <span className="font-label-sm text-label-sm uppercase text-on-secondary font-bold tracking-widest">{gameState ? joinedCount : '0'}/4 CONNECTED</span>
            </div>
          </div>

          {/* Hero Header Visual Card */}
          <div className="relative bg-surface-container-high p-space-md shadow-xl overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary-container/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center gap-space-xs mb-space-xs">
              <span className="bg-primary-container text-on-primary-container font-label-sm text-label-sm px-space-xs py-0.5 font-bold tracking-wider">VERSION 2.4.0</span>
              <span className="bg-tertiary-container text-on-tertiary-container font-label-sm text-label-sm px-space-xs py-0.5 font-bold tracking-wider">MALAYALAM ENGINE</span>
            </div>
            <div className="flex items-center gap-space-sm mb-space-xs">
              <div className="relative w-12 h-12 bg-surface-container shrink-0 overflow-hidden shadow-md flex items-center justify-center">
                <img className="w-full h-full object-cover" data-alt="Cyberpunk pixel art arcade icon of a grinning golden cat wearing holographic neon green visor with retro glitch artifacts on dark metallic chassis" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhkiQ038ioqdH7F4bp_J6DACzb_RgzxjABh8mV0tR8N2NOIjTuDVfMpjkC1kUT_EfwAzp3mmF4VFN-FGMZ0Ii6C3d1AhbwnVLJwyeQNDlvR_IPfu-htdo4szEW-UA_MMfe03DsbkPtiF_0I0KgYJvGGZ48C9QaQ7SCT0VhN0cGGw-LyeB_3bMMeToJjUa577HLW5GRsFv6W7ziyJTiqv2yMvZyvuX4XGQxDhmXoGQ_BHKYkSXHOQI" />
                <div className="absolute inset-0 bg-primary-container/15 mix-blend-overlay"></div>
              </div>
              <div className="min-w-0">
                <h1 className="font-headline-lg-mobile text-headline-lg-mobile uppercase text-on-surface tracking-tight leading-none truncate">KANDAMKALI UNO</h1>
                <p className="font-label-md text-label-md text-primary-fixed uppercase tracking-widest leading-tight mt-0.5">THE MALAYALAM CHAOS ENGINE</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-space-xs mt-space-xs bg-surface-container px-space-sm py-space-xs">
              <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-primary-container text-[16px]">bolt</span>
                HIGH STAKES ROAST MODE
              </span>
              <span className="font-label-sm text-label-sm text-tertiary-fixed font-bold tracking-wider uppercase">PING: 18MS</span>
            </div>
          </div>

          {!gameState ? (
            <>
              {/* Interactive Mode Tabs */}
              <div className="grid grid-cols-2 gap-space-xs" id="lobby-tabs">
                <button 
                  className={`py-space-sm px-space-md flex items-center justify-center gap-space-xs shadow-md active:translate-y-0.5 transition-transform ${activeTab === 'create' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container text-on-surface-variant hover:text-on-surface'}`} 
                  onClick={() => setActiveTab('create')}
                >
                  <span className="material-symbols-outlined text-[18px]">add_box</span>
                  <span className="font-label-lg text-label-lg uppercase tracking-wider">CREATE</span>
                </button>
                <button 
                  className={`py-space-sm px-space-md flex items-center justify-center gap-space-xs shadow-sm active:translate-y-0.5 transition-transform ${activeTab === 'join' ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-surface-container text-on-surface-variant hover:text-on-surface'}`} 
                  onClick={() => setActiveTab('join')}
                >
                  <span className="material-symbols-outlined text-[18px]">meeting_room</span>
                  <span className="font-label-lg text-label-lg uppercase tracking-wider">JOIN</span>
                </button>
              </div>

              {/* Shared Input: Call Sign */}
              <div className="flex flex-col gap-space-xs">
                <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">PLAYER IDENTITY CALLSIGN</label>
                <div className="relative">
                  <input 
                    className="w-full bg-surface-container-lowest p-space-sm font-label-md text-label-md text-on-surface placeholder:text-on-surface-variant focus:outline-none shadow-inner" 
                    placeholder="Enter Your Kallaperu" 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <span className="absolute right-3 top-3 material-symbols-outlined text-primary-container text-[20px]">badge</span>
                </div>
              </div>

              {/* SECTION: CREATE GAME */}
              {activeTab === 'create' && (
                <div className="flex flex-col gap-space-md">
                  <button onClick={handleHost} disabled={loading} className="w-full py-space-md bg-primary-container text-on-primary-container shadow-xl active:translate-y-1 transition-all flex items-center justify-center gap-space-xs">
                    <span className="material-symbols-outlined text-[24px]">rocket_launch</span>
                    <span className="font-headline-md text-headline-md uppercase tracking-wider font-bold">HOST NEW ROOM</span>
                  </button>
                  <button onClick={handlePractice} disabled={loading} className="w-full py-space-sm bg-surface-container text-primary-container shadow-md active:translate-y-1 transition-all flex items-center justify-center gap-space-xs">
                    <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                    <span className="font-label-lg text-label-lg uppercase tracking-wider font-bold">PRACTICE OFFLINE WITH BOTS</span>
                  </button>
                </div>
              )}

              {/* SECTION: JOIN GAME */}
              {activeTab === 'join' && (
                <div className="flex flex-col gap-space-md">
                  <div className="bg-surface-container p-space-md shadow-md flex flex-col gap-space-md">
                    <div>
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">ENTER ENCRYPTED 6-CHAR PIN</span>
                      <div className="relative mt-space-xs">
                        <input 
                          className="w-full bg-surface-container-lowest p-space-sm font-headline-md text-headline-md text-center text-primary-container uppercase focus:outline-none shadow-inner tracking-[0.5em]" 
                          placeholder="XXXXXX" 
                          maxLength={6}
                          type="text" 
                          value={joinCode}
                          onChange={(e) => setJoinCode(e.target.value)}
                        />
                      </div>
                    </div>
                    <button onClick={handleJoin} disabled={loading} className="w-full py-space-md bg-tertiary-container text-on-tertiary-container shadow-xl active:translate-y-1 transition-all flex items-center justify-center gap-space-xs">
                      <span className="material-symbols-outlined text-[22px]">login</span>
                      <span className="font-headline-md text-headline-md uppercase tracking-wider font-bold">ENTER ARENA</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-space-md">
              <div className="bg-surface-container p-space-md shadow-md flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">LOBBY TRANSMISSION FREQUENCY</span>
                  <span className="bg-surface-container-high text-primary-container font-label-sm text-label-sm px-space-xs py-0.5 uppercase tracking-widest">PRIVATE ARENA</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <div className="flex-1 bg-surface-container-lowest p-space-sm flex items-center justify-between shadow-inner">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-primary-container text-[20px]">key</span>
                      <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary-container tracking-widest select-all font-bold">{roomCode}</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">6-SLOT CODE</span>
                  </div>
                  <button onClick={copyCode} className="bg-secondary-container text-on-secondary px-space-md py-space-sm flex items-center justify-center gap-1 shadow-md active:translate-y-0.5 transition-transform shrink-0 h-full">
                    <span className="material-symbols-outlined text-[18px]">{copied ? 'check' : 'content_copy'}</span>
                    <span className="font-label-md text-label-md uppercase tracking-wider">{copied ? 'COPIED!' : 'COPY'}</span>
                  </button>
                </div>
              </div>

              {/* 4-Player Slot Grid */}
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between px-space-xs">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">GLADIATORS IN CHAMBER</span>
                  <span className="font-label-sm text-label-sm text-primary-container tracking-widest">SLOTS: {joinedCount}/4 FILLED</span>
                </div>
                <div className="grid grid-cols-1 gap-space-xs">
                  {/* Map connected players */}
                  {Array.from({ length: 4 }).map((_, i) => {
                    const p = playersList[i];
                    if (p) {
                      return (
                        <div key={i} className="bg-surface-container p-space-sm flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-space-sm min-w-0">
                            <div className="relative w-12 h-12 bg-surface-container-high shrink-0 overflow-hidden shadow-sm flex items-center justify-center">
                              <span className="font-bold text-lg text-primary-container">{p.name.charAt(0).toUpperCase()}</span>
                              {p.isHost && (
                                <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-primary-container flex items-center justify-center">
                                  <span className="material-symbols-outlined text-on-primary-container text-[11px]" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex flex-col">
                              <div className="flex items-center gap-1">
                                <span className="font-label-lg text-label-lg text-on-surface truncate">{p.name}</span>
                                {p.isHost && (
                                  <span className="bg-tertiary-container text-on-tertiary font-label-sm text-label-sm px-1 py-0 font-bold uppercase tracking-tighter">HOST</span>
                                )}
                              </div>
                              <span className="font-body-sm text-body-sm text-on-surface-variant truncate">{p.isBot ? 'Rogue AI' : 'Human Player'}</span>
                            </div>
                          </div>
                          <div className="bg-primary-container/20 px-space-xs py-1 flex items-center gap-1 shrink-0">
                            <span className="w-2 h-2 bg-primary-container rounded-full animate-ping"></span>
                            <span className="font-label-sm text-label-sm text-primary-container uppercase font-bold tracking-wider">READY</span>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div key={i} className="bg-surface-container-low p-space-sm flex items-center justify-between shadow-inner">
                          <div className="flex items-center gap-space-sm min-w-0">
                            <div className="w-12 h-12 bg-surface-container flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-secondary text-[24px] animate-spin">hourglass_top</span>
                            </div>
                            <div className="min-w-0 flex flex-col">
                              <span className="font-label-md text-label-md text-secondary uppercase tracking-wide truncate animate-pulse">WAITING FOR SACRIFICE...</span>
                              <span className="font-body-sm text-body-sm text-on-surface-variant truncate">Invite via link or code</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>

              {/* Big Hot Action CTA for Host */}
              {isHost ? (
                <button onClick={handleStartRealGame} className="w-full py-space-md bg-primary-container text-on-primary-container shadow-xl active:translate-y-1 transition-all flex items-center justify-center gap-space-xs">
                  <span className="material-symbols-outlined text-[24px]">local_fire_department</span>
                  <span className="font-headline-md text-headline-md uppercase tracking-wider font-bold">START GAME [CHAOS UNLEASHED]</span>
                </button>
              ) : (
                <div className="w-full py-space-md bg-surface-container-high text-on-surface-variant shadow-inner flex items-center justify-center gap-space-xs">
                  <span className="material-symbols-outlined text-[24px] animate-spin">hourglass_empty</span>
                  <span className="font-headline-md text-headline-md uppercase tracking-wider font-bold">WAITING FOR HOST TO START</span>
                </div>
              )}
            </div>
          )}

          {/* Micro Telemetry Footer */}
          <div className="flex items-center justify-between px-space-xs py-space-xs text-on-surface-variant font-label-sm text-label-sm mb-4">
            <span>CHAOS PROTOCOL: ACTIVE</span>
            <span>ENCRYPT: MALAYALAM-256</span>
          </div>
        </div>
      </main>

      {/* Clean Bottom Navigation */}
      <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] mx-auto border-t border-white/5">
        <div className="flex items-stretch justify-around h-20 px-gutter-mobile py-space-xs gap-space-xs">
          <a className="flex-1 min-w-0 flex flex-col items-center justify-center gap-1 transition-all bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(0,255,102,0.4)]" href="#">
            <span className="material-symbols-outlined text-[20px]">grid_view</span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider truncate">LOBBY</span>
          </a>
          <a className="flex-1 min-w-0 flex flex-col items-center justify-center gap-1 bg-surface-container text-on-surface-variant transition-all" href="#">
            <span className="material-symbols-outlined text-[20px]">sports_esports</span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider truncate">ARENA</span>
          </a>
          <a className="flex-1 min-w-0 flex flex-col items-center justify-center gap-1 bg-surface-container text-on-surface-variant transition-all" href="#">
            <span className="material-symbols-outlined text-[20px]">graphic_eq</span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider truncate">SOUNDS</span>
          </a>
          <a className="flex-1 min-w-0 flex flex-col items-center justify-center gap-1 bg-surface-container text-on-surface-variant transition-all" href="#">
            <span className="material-symbols-outlined text-[20px]">menu_book</span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider truncate">RULES</span>
          </a>
        </div>
      </nav>
    </div>
  );
}
