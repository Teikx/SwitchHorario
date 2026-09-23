'use client';

import React from 'react';
import { Users, BookOpen, Plus, Zap, Calendar } from 'lucide-react';

interface SwitchHeaderProps {
  onOpenBookingNow: () => void;
  onOpenBookingScheduled: () => void;
  onOpenPlayers: () => void;
  onOpenRules: () => void;
  playersCount: number;
}

export const SwitchHeader: React.FC<SwitchHeaderProps> = ({
  onOpenBookingNow,
  onOpenBookingScheduled,
  onOpenPlayers,
  onOpenRules,
  playersCount,
}) => {
  return (
    <header className="relative border-b border-[#222433] bg-[#111219]/90 backdrop-blur sticky top-0 z-30">
      {/* Joy-Con top line */}
      <div className="h-[2px] w-full flex">
        <div className="w-1/2 bg-[#00C3E3]" />
        <div className="w-1/2 bg-[#FF3C28]" />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* Logo */}
        <div className="flex items-center space-x-2.5">
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
        <div className="flex items-center space-x-1.5 sm:space-x-2.5">
          <button
            onClick={onOpenRules}
            className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-gray-400 hover:text-white bg-[#1a1b26] hover:bg-[#232535] border border-[#282a3a] rounded-lg transition-colors"
            title="Reglas familiares"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Reglas</span>
          </button>

          <button
            onClick={onOpenPlayers}
            className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-gray-400 hover:text-white bg-[#1a1b26] hover:bg-[#232535] border border-[#282a3a] rounded-lg transition-colors"
            title="Ver primos registrados"
          >
            <Users className="w-3.5 h-3.5 text-[#00C3E3]" />
            <span className="hidden sm:inline">Primos ({playersCount})</span>
            <span className="sm:hidden">({playersCount})</span>
          </button>

          {/* Botón directo: Reservar Ahora Mismo */}
          <button
            onClick={onOpenBookingNow}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-bold text-black bg-[#10E364] hover:bg-[#18f26e] rounded-lg shadow-sm transition-all active:scale-95"
            title="Reservar y comenzar a jugar ahora mismo"
          >
            <Zap className="w-3.5 h-3.5 fill-black" />
            <span>Jugar Ya</span>
          </button>

          {/* Botón: Programar fecha/hora */}
          <button
            onClick={onOpenBookingScheduled}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-bold text-white bg-[#FF3C28] hover:bg-[#ff4e3c] rounded-lg shadow-sm transition-all active:scale-95"
            title="Agendar turno en el calendario"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden sm:inline">Programar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
