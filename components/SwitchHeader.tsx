'use client';

import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Plus, Calendar, Clock, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SwitchHeaderProps {
  onOpenBooking: () => void;
  onOpenPlayers: () => void;
  onOpenRules: () => void;
}

export const SwitchHeader: React.FC<SwitchHeaderProps> = ({
  onOpenBooking,
  onOpenPlayers,
  onOpenRules,
}) => {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative border-b border-[#262734] bg-[#13141b]/95 backdrop-blur sticky top-0 z-30 shadow-lg">
      {/* Joy-Con top edge line (left blue, right red) */}
      <div className="h-1 w-full flex">
        <div className="w-1/2 bg-gradient-to-r from-[#00C3E3] to-[#0099b8]" />
        <div className="w-1/2 bg-gradient-to-r from-[#e6301d] to-[#FF3C28]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3.5">
          {/* Custom Switch Console Icon */}
          <div className="flex items-center space-x-0.5 bg-[#1f202b] p-2 rounded-xl border border-[#303244] shadow-inner">
            {/* Left Joy-Con (Blue) */}
            <div className="w-3.5 h-7 bg-[#00C3E3] rounded-l-md flex flex-col items-center justify-around py-1 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-white/90" />
              <div className="w-1.5 h-1.5 rounded-sm bg-black/40" />
            </div>
            {/* Screen */}
            <div className="w-7 h-7 bg-black rounded-sm flex items-center justify-center">
              <span className="text-[10px] font-black text-white tracking-tighter">SW</span>
            </div>
            {/* Right Joy-Con (Red) */}
            <div className="w-3.5 h-7 bg-[#FF3C28] rounded-r-md flex flex-col items-center justify-around py-1 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-black/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-white/90" />
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                SWITCH <span className="text-[#FF3C28]">HORARIO</span>
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold tracking-wider text-[#00C3E3] bg-[#00C3E3]/10 border border-[#00C3E3]/30 rounded-full uppercase">
                OLED Edition
              </span>
            </div>
            <p className="text-xs text-gray-400">Control de turnos y reservas familiares</p>
          </div>
        </div>

        {/* Live Clock Badge */}
        {currentTime && (
          <div className="hidden md:flex items-center space-x-3 px-3.5 py-1.5 rounded-xl bg-[#1b1c26] border border-[#2a2b3d] text-gray-300">
            <Clock className="w-4 h-4 text-[#00C3E3] animate-pulse" />
            <div className="text-xs">
              <span className="font-semibold text-white capitalize">
                {format(currentTime, 'EEEE d, MMMM', { locale: es })}
              </span>
              <span className="mx-1.5 text-gray-500">•</span>
              <span className="font-mono text-[#00C3E3] font-bold">
                {format(currentTime, 'hh:mm:ss a')}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3 ml-auto">
          <button
            onClick={onOpenRules}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-gray-300 bg-[#1e202c] hover:bg-[#282a3a] border border-[#2f3246] rounded-xl transition-all hover:text-white"
            title="Reglas de uso"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Reglas</span>
          </button>

          <button
            onClick={onOpenPlayers}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-gray-300 bg-[#1e202c] hover:bg-[#282a3a] border border-[#2f3246] rounded-xl transition-all hover:text-white"
            title="Gestionar primos"
          >
            <Users className="w-3.5 h-3.5 text-[#00C3E3]" />
            <span className="hidden sm:inline">Primos</span>
          </button>

          <button
            onClick={onOpenBooking}
            className="flex items-center space-x-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#FF3C28] to-[#e62e1b] hover:from-[#ff4f3d] hover:to-[#f03825] rounded-xl shadow-lg glow-red transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Reservar Turno</span>
          </button>
        </div>
      </div>
    </header>
  );
};
