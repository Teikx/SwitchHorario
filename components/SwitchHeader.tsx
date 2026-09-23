'use client';

import React from 'react';
import { Users, BookOpen, Plus } from 'lucide-react';

interface SwitchHeaderProps {
  onOpenBooking: () => void;
  onOpenPlayers: () => void;
  onOpenRules: () => void;
  playersCount: number;
}

export const SwitchHeader: React.FC<SwitchHeaderProps> = ({
  onOpenBooking,
  onOpenPlayers,
  onOpenRules,
  playersCount,
}) => {
  return (
    <header className="relative border-b border-[#222433] bg-[#111219]/90 backdrop-blur sticky top-0 z-30">
      {/* Joy-Con minimal color line */}
      <div className="h-[2px] w-full flex">
        <div className="w-1/2 bg-[#00C3E3]" />
        <div className="w-1/2 bg-[#FF3C28]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-2.5">
          {/* Minimal Switch Joy-Con icon */}
          <div className="flex items-center space-x-0.5 bg-[#1b1c26] p-1.5 rounded-lg border border-[#2b2d3d]">
            <div className="w-2 h-4 bg-[#00C3E3] rounded-l-sm" />
            <div className="w-3.5 h-4 bg-[#111219] flex items-center justify-center">
              <span className="text-[8px] font-black text-gray-300">SW</span>
            </div>
            <div className="w-2 h-4 bg-[#FF3C28] rounded-r-sm" />
          </div>

          <span className="text-base sm:text-lg font-black tracking-tight text-white flex items-center">
            Switch<span className="text-[#FF3C28]">Horario</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onOpenRules}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white bg-[#1a1b26] hover:bg-[#232535] border border-[#282a3a] rounded-lg transition-colors"
            title="Reglas familiares"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Reglas</span>
          </button>

          <button
            onClick={onOpenPlayers}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white bg-[#1a1b26] hover:bg-[#232535] border border-[#282a3a] rounded-lg transition-colors"
            title="Ver primos registrados"
          >
            <Users className="w-3.5 h-3.5 text-[#00C3E3]" />
            <span>Primos ({playersCount})</span>
          </button>

          <button
            onClick={onOpenBooking}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-white bg-[#FF3C28] hover:bg-[#ff4e3c] rounded-lg shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Reservar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
