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
import { Zap, LogOut, Clock, Infinity as InfinityIcon } from 'lucide-react';

interface LiveStatusStripProps {
  bookings: Booking[];
  players: Player[];
  onQuickPlay: () => void;
  onRequestRelease: (booking: Booking) => void;
}

export const LiveStatusStrip: React.FC<LiveStatusStripProps> = ({
  bookings,
  onQuickPlay,
  onRequestRelease,
}) => {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const activeBooking = getCurrentActiveBooking(bookings, now);
  const nextBooking = getNextUpcomingBooking(bookings, now);

  if (activeBooking) {
    const { remainingMinutes, elapsedMinutes, isOpenEnded, progressPercent } =
      getRemainingProgress(activeBooking, now);
    const avatarMeta = getAvatarMeta(activeBooking.player?.avatar || 'mario');
    const playerColor = activeBooking.player?.color || '#FF3C28';

    return (
      <div className="relative overflow-hidden rounded-xl bg-[#14151d] border border-[#2a2c3d] p-3 shadow-md transition-all">
        {/* Barra superior de progreso */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#222436]">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-[#FF3C28] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Jugador en uso */}
          <div className="flex items-center space-x-2.5 min-w-0">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>

            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/20">
              En Juego
            </span>

            <div className="flex items-center space-x-1.5 truncate">
              <span
                className="w-5 h-5 rounded-md flex items-center justify-center text-xs flex-shrink-0"
                style={{ backgroundColor: playerColor }}
              >
                {avatarMeta.emoji}
              </span>
              <span className="font-bold text-white truncate">
                {activeBooking.player?.name}
              </span>
              {activeBooking.notes && (
                <>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400 text-[11px] truncate italic hidden sm:inline">
                    &quot;{activeBooking.notes}&quot;
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Tiempo transcurrido / restante + Botón Liberar */}
          <div className="flex items-center space-x-3 ml-auto">
            <div className="flex items-center space-x-1 text-gray-300">
              <Clock className="w-3.5 h-3.5 text-red-400" />
              {isOpenEnded ? (
                <span className="flex items-center gap-1 font-mono font-bold text-white">
                  <span>Lleva: {elapsedMinutes}m</span>
                  <span className="text-gray-500 text-[11px] font-normal hidden sm:inline">
                    (sin límite fijo)
                  </span>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <span>Quedan:</span>
                  <span className="font-mono font-bold text-white">
                    {remainingMinutes > 0 ? `${remainingMinutes}m` : '0m'}
                  </span>
                  <span className="text-gray-500 text-[11px] hidden sm:inline">
                    (hasta {formatFriendlyTime(activeBooking.end_time)})
                  </span>
                </span>
              )}
            </div>

            <button
              onClick={() => onRequestRelease(activeBooking)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-200 hover:text-red-300 bg-[#1e202d] hover:bg-red-950/40 border border-[#2f3246] hover:border-red-500/30 transition-all flex items-center gap-1 shadow-sm"
              title="Liberar consola para otro primo"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span>Terminé (Liberar)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Consola libre
  return (
    <div className="rounded-xl bg-[#12141c] border border-[#232635] p-3 shadow-sm transition-all flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center space-x-2.5">
        <span className="w-2 h-2 rounded-full bg-[#10E364] animate-pulse"></span>
        <span className="font-bold text-white flex items-center gap-1.5">
          <span className="text-[#10E364]">Switch Libre</span>
          <span className="text-gray-400 font-normal hidden sm:inline">
            — Disponible ahora mismo
          </span>
        </span>
        {nextBooking && (
          <span className="text-[11px] text-amber-300/80 hidden md:inline bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            Próximo: {nextBooking.player?.name} a las {formatFriendlyTime(nextBooking.start_time)}
          </span>
        )}
      </div>

      <button
        onClick={onQuickPlay}
        className="ml-auto px-3.5 py-1.5 rounded-lg text-xs font-bold text-black bg-gradient-to-r from-[#10E364] to-[#0eb351] hover:from-[#17f070] shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
      >
        <Zap className="w-3.5 h-3.5 fill-black" />
        <span>Reservar Ahora Mismo</span>
      </button>
    </div>
  );
};
