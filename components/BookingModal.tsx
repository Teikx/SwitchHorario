'use client';

import React, { useState, useEffect } from 'react';
import { Player, Booking } from '@/lib/types';
import {
  findConflictingBooking,
  getAvatarMeta,
  formatFriendlyTime,
  getNextUpcomingBooking,
} from '@/lib/booking-utils';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Infinity as InfinityIcon,
} from 'lucide-react';
import { format, addMinutes, addHours } from 'date-fns';
import confetti from 'canvas-confetti';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  existingBookings: Booking[];
  initialDate?: Date;
  initialHour?: number;
  initialMode?: 'now' | 'scheduled';
  onSaveBooking: (bookingData: {
    player_id: string;
    game_title?: string;
    start_time: string;
    end_time: string;
    is_open_ended?: boolean;
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
  initialMode = 'scheduled',
  onSaveBooking,
}) => {
  const [bookingMode, setBookingMode] = useState<'now' | 'scheduled'>('now');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');
  const [selectedHour, setSelectedHour] = useState<number>(16);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  // 0 significa "Sin límite fijo / Hasta que libere"
  const [durationMinutes, setDurationMinutes] = useState<number>(0);
  const [customHours, setCustomHours] = useState<number>(3);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (players.length > 0 && !selectedPlayerId) {
        setSelectedPlayerId(players[0].id);
      }

      setBookingMode(initialMode);

      const base = initialDate || new Date();
      setSelectedDateStr(format(base, 'yyyy-MM-dd'));

      if (initialHour !== undefined) {
        setSelectedHour(initialHour);
        setSelectedMinute(0);
        setBookingMode('scheduled');
        setDurationMinutes(60); // si hace clic en el calendario, por defecto 1h
      } else {
        const now = new Date();
        setSelectedHour(now.getHours());
        setSelectedMinute(Math.floor(now.getMinutes() / 15) * 15);
        if (initialMode === 'now') {
          setDurationMinutes(0); // Sin límite por defecto al reservar ahora
        }
      }
      setSubmitError(null);
    }
  }, [isOpen, initialDate, initialHour, initialMode, players]);

  if (!isOpen) return null;

  // Calcular intervalo según el modo
  const calculateInterval = () => {
    let start: Date;
    if (bookingMode === 'now') {
      start = new Date();
    } else {
      if (!selectedDateStr) return null;
      const [year, month, day] = selectedDateStr.split('-').map(Number);
      start = new Date(year, month - 1, day, selectedHour, selectedMinute, 0);
    }

    // Si es sin límite fijo (0), asignamos 4 horas como bloque visual preliminar
    const effectiveMinutes = durationMinutes === 0 ? 240 : durationMinutes;
    const end = addMinutes(start, effectiveMinutes);

    return {
      start,
      end,
      isOpenEnded: durationMinutes === 0,
    };
  };

  const interval = calculateInterval();
  const conflicting = interval
    ? findConflictingBooking(interval.start, interval.end, existingBookings)
    : null;

  // Próxima reserva para informar al jugador si alguien reservó más tarde
  const nextBooking = interval
    ? getNextUpcomingBooking(existingBookings, interval.start)
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

    const result = await onSaveBooking({
      player_id: selectedPlayerId,
      game_title: 'Nintendo Switch',
      start_time: interval.start.toISOString(),
      end_time: interval.end.toISOString(),
      is_open_ended: interval.isOpenEnded,
      notes: notes.trim(),
    });

    setIsSubmitting(false);

    if (result.success) {
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

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#161722] border border-[#2b2e40] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150 my-6">
        {/* Joy-Con top edge line */}
        <div className="h-1.5 w-full flex">
          <div className="w-1/2 bg-[#00C3E3]" />
          <div className="w-1/2 bg-[#FF3C28]" />
        </div>

        {/* Header con pestañas: Ahora Mismo vs Programar */}
        <div className="p-4 sm:p-5 border-b border-[#262838] flex items-center justify-between">
          <div className="flex items-center space-x-1 bg-[#1f2130] p-1 rounded-xl border border-[#2e3146]">
            <button
              type="button"
              onClick={() => {
                setBookingMode('now');
                setDurationMinutes(0); // Sin límite por defecto
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                bookingMode === 'now'
                  ? 'bg-[#10E364] text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Jugar Ahora</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setBookingMode('scheduled');
                if (durationMinutes === 0) setDurationMinutes(60);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                bookingMode === 'scheduled'
                  ? 'bg-[#00C3E3] text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Programar Turno</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#252839]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {/* 1. SELECCIONAR PRIMO */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              1. ¿Quién va a jugar?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {players.map(player => {
                const isSelected = selectedPlayerId === player.id;
                const avatar = getAvatarMeta(player.avatar);

                return (
                  <button
                    type="button"
                    key={player.id}
                    onClick={() => setSelectedPlayerId(player.id)}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'border-white bg-[#25273a] scale-105 shadow-md ring-2 ring-white/40'
                        : 'border-[#292c3f] bg-[#1a1b26] hover:bg-[#222436] text-gray-400'
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

          {/* 2. DÍA Y HORA (Solo si es Programar Turno) */}
          {bookingMode === 'scheduled' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                2. Día y Horario
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-gray-400 mb-1 block">Fecha:</span>
                  <input
                    type="date"
                    value={selectedDateStr}
                    onChange={e => setSelectedDateStr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#1e202f] border border-[#2d3044] text-sm text-white focus:outline-none focus:border-[#00C3E3]"
                    required
                  />
                </div>

                <div>
                  <span className="text-[11px] text-gray-400 mb-1 block">Hora de inicio:</span>
                  <div className="flex gap-2">
                    <select
                      value={selectedHour}
                      onChange={e => setSelectedHour(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#1e202f] border border-[#2d3044] text-sm text-white focus:outline-none focus:border-[#00C3E3]"
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
                      className="px-3 py-2 rounded-xl bg-[#1e202f] border border-[#2d3044] text-sm text-white focus:outline-none focus:border-[#00C3E3]"
                    >
                      <option value={0}>:00</option>
                      <option value={30}>:30</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. DURACIÓN (OPCIONAL / SIN LÍMITE) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                {bookingMode === 'now' ? '2. ¿Cuánto tiempo jugarás?' : '3. Duración del turno'}
              </label>
              <span className="text-[11px] text-gray-400">
                (Opcional - puedes liberar al terminar)
              </span>
            </div>

            {/* Opciones de Duración con soporte de más de 2 horas y Sin límite */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {[
                { label: 'Sin límite', val: 0, icon: true },
                { label: '1 hora', val: 60 },
                { label: '2 horas', val: 120 },
                { label: '3 horas', val: 180 },
                { label: '4 horas', val: 240 },
                { label: '5+ horas', val: 300 },
              ].map(d => (
                <button
                  type="button"
                  key={d.val}
                  onClick={() => setDurationMinutes(d.val)}
                  className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all flex flex-col items-center justify-center gap-0.5 ${
                    durationMinutes === d.val
                      ? 'bg-[#FF3C28] text-white border-[#FF3C28] shadow-md'
                      : 'bg-[#1b1c28] text-gray-300 border-[#292c3d] hover:bg-[#232537]'
                  }`}
                >
                  {d.icon && <InfinityIcon className="w-3.5 h-3.5" />}
                  <span>{d.label}</span>
                </button>
              ))}
            </div>

            {/* Mensaje descriptivo del tiempo */}
            <div className="mt-2 text-xs text-gray-400 flex items-center gap-1.5">
              {durationMinutes === 0 ? (
                <span className="text-[#10E364] flex items-center gap-1">
                  <InfinityIcon className="w-3.5 h-3.5" />
                  Juegas libremente hasta que presiones &quot;Liberar Switch&quot;.
                </span>
              ) : (
                <span>
                  Turno programado por {durationMinutes / 60}{' '}
                  {durationMinutes === 60 ? 'hora' : 'horas'}.
                </span>
              )}
            </div>
          </div>

          {/* 4. NOTA OPCIONAL */}
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">
              Nota opcional
            </label>
            <input
              type="text"
              placeholder="Ej: Con amigos, reto familiar, etc."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#1e202f] border border-[#2d3044] text-xs sm:text-sm text-white focus:outline-none focus:border-[#00C3E3]"
              maxLength={70}
            />
          </div>

          {/* Resumen del turno */}
          {interval && (
            <div className="p-3 rounded-xl bg-[#12131b] border border-[#222434] text-xs space-y-1">
              <div className="flex items-center justify-between text-gray-300">
                <span className="text-gray-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#00C3E3]" /> Inicio:
                </span>
                <span className="font-mono font-bold text-white">
                  {bookingMode === 'now' ? 'Ahora mismo' : formatFriendlyTime(interval.start)}
                </span>
              </div>
              {nextBooking && bookingMode === 'now' && (
                <div className="text-[11px] text-amber-300/80 pt-1 border-t border-[#222434]">
                  💡 Recuerda: {nextBooking.player?.name} tiene reservado a las{' '}
                  {formatFriendlyTime(nextBooking.start_time)}.
                </div>
              )}
            </div>
          )}

          {/* Alerta de Conflicto si aplica */}
          {conflicting && (
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
          )}

          {submitError && (
            <div className="p-2.5 rounded-xl bg-red-900/40 border border-red-500/60 text-xs text-red-200">
              {submitError}
            </div>
          )}

          {/* BOTONES DE ACCIÓN */}
          <div className="pt-2 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-[#1e202f]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || Boolean(conflicting)}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-lg transition-all flex items-center gap-1.5 ${
                Boolean(conflicting)
                  ? 'bg-gray-600 cursor-not-allowed opacity-50'
                  : bookingMode === 'now'
                  ? 'bg-gradient-to-r from-[#10E364] to-[#0ea647] hover:from-[#17f070] text-black font-black active:scale-95'
                  : 'bg-[#FF3C28] hover:bg-[#ff513e] glow-red active:scale-95'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Guardando...'
                  : bookingMode === 'now'
                  ? '¡Comenzar a Jugar Ya!'
                  : 'Confirmar Turno'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
