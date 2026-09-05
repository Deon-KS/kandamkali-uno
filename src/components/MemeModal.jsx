import React, { useState } from 'react';
import { audioManager } from '../services/audioManager';
import { useGameState } from '../store/GameStateContext';

export default function MemeModal({ isOpen, onClose }) {
  const [toastMsg, setToastMsg] = useState('');

  if (!isOpen) return null;

  const memes = [
    { title: 'Pavanayi Shavamayi', sub: '"Ippo ശവമായി!"', source: 'Nadodikkattu', emoji: '🔥', id: 'pavanayi' },
    { title: 'Sadhanam Kayyilundo?', sub: '"സാധനം കയ്യിലുണ്ടോ?"', source: 'Pattana Pravesham', emoji: '❓', id: 'sadhanam' },
    { title: 'Scene Contra!', sub: '"സീൻ കോൺട്രാ മോനേ!"', source: 'Premam Roast', emoji: '⚡', id: 'scene_contra' },
    { title: 'Vidhikkan Njan Aaru?', sub: '"വിധിക്കാൻ ഞാൻ ആര്?"', source: 'Salim Kumar Iconic', emoji: '⚖️', id: 'vidhikkan' },
    { title: 'Dha Dha Poyi!', sub: '"ദാ ദാ പോയി..."', source: 'Kalyanaraman', emoji: '💨', id: 'dha_poyi' },
    { title: 'Entharo Mahanubhavulu', sub: '"എന്തരോ മഹാനുഭാവുലു"', source: 'Jagathy Sarcasm', emoji: '🎶', id: 'enthokke' },
  ];

  const handlePlayMeme = (meme) => {
    audioManager.play(meme.id);
    setToastMsg(`Broadcasting: ${meme.title}`);
    setTimeout(() => {
      setToastMsg('');
      onClose();
    }, 1200);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end justify-center"
      onClick={(e) => { if(e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-[#161922] border-t-2 border-amber-400/40 rounded-t-3xl p-5 shadow-2xl flex flex-col gap-3 animate-in slide-in-from-bottom duration-200">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 text-xl shadow-sm">📢</div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white tracking-wide font-space">MALAYALAM MEME ROASTS</h3>
                <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[9px] font-mono font-bold border border-amber-400/30">AUDIO</span>
              </div>
              <p className="text-xs font-mono text-slate-400">Tap to blast audio roast to everyone</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
          {memes.map((meme, idx) => (
            <button 
              key={idx}
              onClick={() => handlePlayMeme(meme)}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-amber-400/20 active:scale-95 text-left transition-all group"
            >
              <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center text-sm group-hover:scale-110 transition-transform">{meme.emoji}</span>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-white block truncate">{meme.title}</span>
                <span className="text-[10px] font-mono text-amber-300/80 truncate block">{meme.sub}</span>
                <span className="text-[9px] font-mono text-slate-400 truncate">{meme.source}</span>
              </div>
            </button>
          ))}
        </div>

        {toastMsg && (
          <div className="text-center text-xs font-mono py-2 px-3 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg animate-pulse">
            🔊 {toastMsg}
          </div>
        )}

      </div>
    </div>
  );
}
