'use client';

import React, { useState, useEffect } from 'react';
import { Booking, Player } from '@/lib/types';
import {
  getCurrentActiveBooking,
  getNextUpcomingBooking,
  getRemainingProgress,
  getAvatarMeta,
  formatFriendlyTime,
} from '@/lib/booking-utils';
import { Gamepad2, Play, CheckCircle2, Clock, Sparkles, LogOut, ArrowRight, Zap } from 'lucide-react';

interface LiveStatusCardProps {
  bookings: Booking[];
  players: Player[];
  onQuickPlay: () => void;
  onOpenBooking: () => void;
  onRequestRelease: (booking: Booking) => void;
}

export const LiveStatusCard: React.FC<LiveStatusCardProps> = ({
  bookings,
  players,
  onQuickPlay,
  onOpenBooking,
  onRequestRelease,
}) => {
  const [now, setNow] = useState<Date>(new Date());

  // Actualizar el reloj cada 10 segundos para actualizar la barra de progreso
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const activeBooking = getCurrentActiveBooking(bookings, now);
  const nextBooking = getNextUpcomingBooking(bookings, now);

  if (activeBooking) {
    const { remainingMinutes, progressPercent } = getRemainingProgress(activeBooking, now);
    const avatarMeta = getAvatarMeta(activeBooking.player?.avatar || 'mario');
    const playerColor = activeBooking.player?.color || '#FF3C28';

    return (
      <div className="relative overflow-hidden rounded-2xl bg-[#171822] border-2 border-[#FF3C28]/60 p-5 sm:p-7 shadow-2xl transition-all">
        {/* Glowing background accent */}
        <div
          className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: playerColor }}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          {/* Left section: Avatar & Current Player Info */}
          <div className="flex items-start sm:items-center space-x-4 sm:space-x-5">
            {/* Big Avatar */}
            <div className="relative">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-lg border-2 border-white/20 transition-transform transform hover:scale-105"
                style={{ backgroundColor: playerColor }}
              >
                {avatarMeta.emoji}
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-[#171822]"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  En Juego Ahora
                </span>
                <span className="text-xs text-gray-400">
                  Hasta las {formatFriendlyTime(activeBooking.end_time)}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                {activeBooking.player?.name || 'Primo Anónimo'}
              </h2>

              <div className="flex items-center space-x-2 text-sm text-gray-300 mt-0.5">
                <Gamepad2 className="w-4 h-4 text-[#00C3E3]" />
                <span className="font-semibold text-gray-100">{activeBooking.game_title}</span>
                {activeBooking.notes && (
                  <span className="hidden sm:inline text-gray-500 text-xs italic">
                    &quot;{activeBooking.notes}&quot;
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right section: Progress & Release Button */}
          <div className="flex flex-col sm:items-end w-full md:w-80">
            <div className="flex items-center justify-between sm:justify-end sm:space-x-3 w-full mb-2">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-red-400" /> Tiempo restante:
              </span>
              <span className="text-base sm:text-lg font-mono font-bold text-white">
                {remainingMinutes > 0 ? `${remainingMinutes} min` : 'Finalizando...'}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#242636] h-3 rounded-full overflow-hidden border border-[#32354a] mb-4">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-[#FF3C28] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Early release action */}
            <button
              onClick={() => onRequestRelease(activeBooking)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#26283a] hover:bg-red-950/40 text-gray-200 hover:text-red-300 border border-[#393c54] hover:border-red-500/40 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>Terminé antes (Liberar Switch)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si la consola está libre
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#141822] border-2 border-[#10E364]/40 p-5 sm:p-7 shadow-2xl transition-all">
      {/* Green glow background */}
      <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-[#10E364]/10 blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="flex items-start sm:items-center space-x-4 sm:space-x-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#10E364]/20 to-[#00C3E3]/20 border-2 border-[#10E364]/50 flex items-center justify-center text-3xl sm:text-4xl shadow-lg">
            🎮
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase bg-[#10E364]/20 text-[#10E364] border border-[#10E364]/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10E364] animate-ping"></span>
                Consola Disponible
              </span>
              <span className="text-xs text-gray-400">¡Nadie está jugando!</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              ¡La Switch está libre!
            </h2>

            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              Puedes encenderla y comenzar a jugar ahora mismo.
            </p>

            {nextBooking && (
              <div className="flex items-center space-x-2 text-xs text-amber-300/90 mt-2 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 max-w-fit">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  Próximo turno: <strong>{nextBooking.player?.name}</strong> a las{' '}
                  {formatFriendlyTime(nextBooking.start_time)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={onQuickPlay}
            className="px-5 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#10E364] to-[#0ea848] hover:from-[#1bf26e] hover:to-[#10c456] shadow-lg glow-green transition-all transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Jugar Ahora (1 hora)</span>
          </button>

          <button
            onClick={onOpenBooking}
            className="px-5 py-3 rounded-xl text-xs sm:text-sm font-bold text-gray-200 bg-[#1f212f] hover:bg-[#2a2c3e] border border-[#313448] hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 text-[#00C3E3]" />
            <span>Agendar Otro Horario</span>
          </button>
        </div>
      </div>
    </div>
  );
};
