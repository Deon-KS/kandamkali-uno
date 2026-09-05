import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Card({ card, onClick, className, isFaceDown = false, small = false }) {
  if (!card && !isFaceDown) return null;

  // Render face-down card
  if (isFaceDown) {
    return (
      <div 
        className={cn(
          "uno-card uno-black flex items-center justify-center relative shadow-md",
          small ? "w-12 h-16 border-2" : "w-16 h-24 sm:w-20 sm:h-32",
          className
        )}
      >
        <div className={cn(
          "bg-black rounded-lg flex items-center justify-center border border-white/40 overflow-hidden",
          small ? "w-10 h-14" : "w-14 h-20 sm:w-16 sm:h-24"
        )}>
          <div className={cn(
            "bg-red-600 rounded-full rotate-[-30deg] flex items-center justify-center shadow-inner",
            small ? "w-8 h-12" : "w-12 h-16 sm:w-14 sm:h-20"
          )}>
            <span className={cn(
              "text-[#facc15] font-black italic tracking-tighter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]",
              small ? "text-[8px]" : "text-xs sm:text-sm"
            )}>
              UNO
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Parse card logic
  const isWild = card.color === 'wild';
  let colorClass = 'uno-black';
  if (card.color === 'red') colorClass = 'uno-red';
  if (card.color === 'blue') colorClass = 'uno-blue';
  if (card.color === 'green') colorClass = 'uno-green';
  if (card.color === 'yellow') colorClass = 'uno-yellow';

  let displayValue = card.value;
  let icon = null;
  if (card.value === 'skip') { displayValue = '⊘'; icon = 'block'; }
  if (card.value === 'reverse') { displayValue = '⇄'; icon = 'sync_alt'; }
  if (card.value === '+2') { displayValue = '+2'; }
  if (card.value === '+4') { displayValue = '+4'; }
  if (card.value === 'wild') { displayValue = 'W'; }

  return (
    <button 
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "uno-card p-1.5 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-xl",
        small ? "w-12 h-18 border-2 p-1" : "w-16 h-24 sm:w-20 sm:h-32",
        colorClass,
        className
      )}
    >
      {/* Top Left */}
      <div className={cn("flex items-center text-white font-black italic leading-none drop-shadow", small ? "text-[8px]" : "text-xs sm:text-sm")}>
        {displayValue}
      </div>
      
      {/* Center Oval */}
      <div className={cn("uno-oval self-center", small ? "w-8 h-12" : "w-12 h-16 sm:w-13 sm:h-18", isWild ? "p-1" : "")}>
        {isWild ? (
           <div className="wild-wheel shadow-inner flex items-center justify-center">
             <span className={cn("text-white font-black italic leading-none rotate-[28deg] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]", small ? "text-sm" : "text-lg sm:text-xl")}>
               {card.value === '+4' ? '+4' : 'W'}
             </span>
           </div>
        ) : icon ? (
           <span className={cn("material-symbols-outlined font-black rotate-[28deg] drop-shadow-sm", small ? "text-xl" : "text-3xl", `text-${card.color}-600`)}>
             {icon}
           </span>
        ) : (
           <span className={cn("font-black italic leading-none rotate-[28deg] drop-shadow-sm", small ? "text-xl" : "text-3xl", `text-${card.color}-600`)}>
             {displayValue}
           </span>
        )}
      </div>

      {/* Bottom Right */}
      <div className={cn("flex items-center self-end rotate-180 text-white font-black italic leading-none drop-shadow", small ? "text-[8px]" : "text-xs sm:text-sm")}>
        {displayValue}
      </div>
    </button>
  );
}
