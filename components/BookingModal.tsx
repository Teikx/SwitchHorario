'use client';

import React, { useState, useEffect } from 'react';
import { Player, Booking } from '@/lib/types';
import { POPULAR_GAMES } from '@/lib/constants';
import {
  findConflictingBooking,
  getAvatarMeta,
  formatFriendlyTime,
} from '@/lib/booking-utils';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  Gamepad2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { format, addMinutes, parseISO, setHours, setMinutes } from 'date-fns';
import confetti from 'canvas-confetti';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  existingBookings: Booking[];
  initialDate?: Date;
  initialHour?: number;
  onSaveBooking: (bookingData: {
    player_id: string;
    game_title: string;
    start_time: string;
    end_time: string;
    notes?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  players,
  existingBookings,
  initialDate,
  initialHour,
  onSaveBooking,
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');
  const [selectedHour, setSelectedHour] = useState<number>(16); // 4 PM default
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  const [durationMinutes, setDurationMinutes] = useState<number>(60); // 1h default
  const [selectedGame, setSelectedGame] = useState<string>(POPULAR_GAMES[0].title);
  const [customGame, setCustomGame] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Inicializar valores al abrir
  useEffect(() => {
    if (isOpen) {
      if (players.length > 0 && !selectedPlayerId) {
        setSelectedPlayerId(players[0].id);
      }

      const base = initialDate || new Date();
      setSelectedDateStr(format(base, 'yyyy-MM-dd'));

      if (initialHour !== undefined) {
        setSelectedHour(initialHour);
        setSelectedMinute(0);
      } else {
        const now = new Date();
        setSelectedHour(Math.min(22, Math.max(8, now.getHours() + 1)));
        setSelectedMinute(0);
      }
      setSubmitError(null);
    }
  }, [isOpen, initialDate, initialHour, players]);

  if (!isOpen) return null;

  // Calcular fechas de inicio y fin para validación de colisión
  const calculateInterval = () => {
    if (!selectedDateStr) return null;
    const [year, month, day] = selectedDateStr.split('-').map(Number);
    const start = new Date(year, month - 1, day, selectedHour, selectedMinute, 0);
    const end = addMinutes(start, durationMinutes);
    return { start, end };
  };

  const interval = calculateInterval();
  const conflicting = interval
    ? findConflictingBooking(interval.start, interval.end, existingBookings)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interval) return;

    if (!selectedPlayerId) {
      setSubmitError('Por favor selecciona quién va a jugar.');
      return;
    }

    if (conflicting) {
      setSubmitError(
        `Horario ocupado por ${conflicting.player?.name || 'otro primo'}. Elige otra hora.`
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const gameTitle = selectedGame === 'Otro juego...' ? customGame.trim() || 'Juego variado' : selectedGame;

    const result = await onSaveBooking({
      player_id: selectedPlayerId,
      game_title: gameTitle,
      start_time: interval.start.toISOString(),
      end_time: interval.end.toISOString(),
      notes: notes.trim(),
    });

    setIsSubmitting(false);

    if (result.success) {
      // Disparar confetti festivo
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF3C28', '#00C3E3', '#10E364', '#FFD60A'],
      });
      onClose();
    } else {
      setSubmitError(result.error || 'No se pudo guardar la reserva');
    }
  };

  const selectedPlayer = players.find(p => p.id === selectedPlayerId);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#171824] border border-[#2e3146] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
        {/* Joy-Con top bar */}
        <div className="h-1.5 w-full flex">
          <div className="w-1/2 bg-[#00C3E3]" />
          <div className="w-1/2 bg-[#FF3C28]" />
        </div>

        {/* Header */}
        <div className="p-5 border-b border-[#292c3f] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#232638] text-white">
              <CalendarIcon className="w-5 h-5 text-[#FF3C28]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Reservar Turno</h3>
              <p className="text-xs text-gray-400">Agendar tiempo en la Nintendo Switch</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#252839] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {/* 1. SELECCIONAR PRIMO */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              1. ¿Quién va a jugar?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {players.map(player => {
                const isSelected = selectedPlayerId === player.id;
                const avatar = getAvatarMeta(player.avatar);

                return (
                  <button
                    type="button"
                    key={player.id}
                    onClick={() => setSelectedPlayerId(player.id)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'border-white bg-[#26283d] scale-105 shadow-md'
                        : 'border-[#2d3044] bg-[#1c1d2b] hover:bg-[#222436] text-gray-400'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-1 shadow-sm"
                      style={{ backgroundColor: player.color }}
                    >
                      {avatar.emoji}
                    </div>
                    <span
                      className={`text-xs font-bold truncate max-w-[80px] ${
                        isSelected ? 'text-white' : 'text-gray-300'
                      }`}
                    >
                      {player.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. DÍA Y HORA */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
              2. Día y Horario
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Fecha */}
              <div>
                <span className="text-[11px] text-gray-400 mb-1 block">Día:</span>
                <input
                  type="date"
                  value={selectedDateStr}
                  onChange={e => setSelectedDateStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#202233] border border-[#2f3248] text-sm text-white focus:outline-none focus:border-[#00C3E3]"
                  required
                />
              </div>

              {/* Hora de inicio */}
              <div>
                <span className="text-[11px] text-gray-400 mb-1 block">Hora de inicio:</span>
                <div className="flex gap-2">
                  <select
                    value={selectedHour}
                    onChange={e => setSelectedHour(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#202233] border border-[#2f3248] text-sm text-white focus:outline-none focus:border-[#00C3E3]"
                  >
                    {Array.from({ length: 16 }, (_, i) => i + 8).map(h => (
                      <option key={h} value={h}>
                        {h === 12 ? '12:00 PM' : h < 12 ? `${h}:00 AM` : `${h - 12}:00 PM`}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedMinute}
                    onChange={e => setSelectedMinute(Number(e.target.value))}
                    className="px-3 py-2 rounded-xl bg-[#202233] border border-[#2f3248] text-sm text-white focus:outline-none focus:border-[#00C3E3]"
                  >
                    <option value={0}>:00</option>
                    <option value={30}>:30</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Duración */}
            <div>
              <span className="text-[11px] text-gray-400 mb-1.5 block">Duración del turno:</span>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: '30 min', val: 30 },
                  { label: '1 hora', val: 60 },
                  { label: '1.5 h', val: 90 },
                  { label: '2 horas', val: 120 },
                ].map(d => (
                  <button
                    type="button"
                    key={d.val}
                    onClick={() => setDurationMinutes(d.val)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      durationMinutes === d.val
                        ? 'bg-[#FF3C28] text-white border-[#FF3C28] shadow-md'
                        : 'bg-[#1e202f] text-gray-300 border-[#2f3246] hover:bg-[#25283b]'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Resumen del intervalo */}
            {interval && (
              <div className="p-3 rounded-xl bg-[#13141d] border border-[#262838] flex items-center justify-between text-xs">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#00C3E3]" /> Intervalo:
                </span>
                <span className="font-mono font-bold text-white">
                  {formatFriendlyTime(interval.start)} hasta {formatFriendlyTime(interval.end)}
                </span>
              </div>
            )}

            {/* Alerta de Conflicto en Tiempo Real */}
            {conflicting ? (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/50 flex items-start space-x-2 text-red-300 text-xs">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">¡Horario Ocupado!</strong>
                  Ya está reservado por{' '}
                  <span className="font-semibold text-white">
                    {conflicting.player?.name || 'otro primo'}
                  </span>{' '}
                  ({formatFriendlyTime(conflicting.start_time)} -{' '}
                  {formatFriendlyTime(conflicting.end_time)}).
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-green-950/30 border border-green-500/40 flex items-center space-x-2 text-green-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span>Horario disponible para jugar sin interrupciones.</span>
              </div>
            )}
          </div>

          {/* 3. JUEGO PLANIFICADO */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              3. ¿Qué juego vas a jugar?
            </label>
            <div className="flex gap-2">
              <select
                value={selectedGame}
                onChange={e => setSelectedGame(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#202233] border border-[#2f3248] text-sm text-white focus:outline-none focus:border-[#00C3E3]"
              >
                {POPULAR_GAMES.map(g => (
                  <option key={g.id} value={g.title}>
                    {g.icon} {g.title}
                  </option>
                ))}
              </select>
            </div>

            {selectedGame === 'Otro juego...' && (
              <input
                type="text"
                placeholder="Escribe el nombre del juego..."
                value={customGame}
                onChange={e => setCustomGame(e.target.value)}
                className="mt-2 w-full px-3 py-2 rounded-xl bg-[#202233] border border-[#2f3248] text-sm text-white focus:outline-none focus:border-[#00C3E3]"
              />
            )}
          </div>

          {/* 4. NOTA OPCIONAL */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">
              4. Nota opcional (para tus primos)
            </label>
            <input
              type="text"
              placeholder="Ej: Torneo familiar, paso un santuario, etc."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#202233] border border-[#2f3248] text-sm text-white focus:outline-none focus:border-[#00C3E3]"
              maxLength={80}
            />
          </div>

          {submitError && (
            <div className="p-3 rounded-xl bg-red-900/40 border border-red-500/60 text-xs text-red-200">
              {submitError}
            </div>
          )}

          {/* BOTONES DE ACCIÓN */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-400 hover:text-white bg-[#222435] hover:bg-[#2b2e42] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || Boolean(conflicting)}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-lg transition-all flex items-center gap-2 ${
                Boolean(conflicting)
                  ? 'bg-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-[#FF3C28] to-[#e62b18] hover:from-[#ff513e] hover:to-[#f03825] glow-red active:scale-95'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Guardando...' : 'Confirmar Reserva'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
