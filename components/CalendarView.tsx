'use client';

import React, { useState } from 'react';
import { Booking, Player, CalendarViewMode } from '@/lib/types';
import {
  getWeekDays,
  CALENDAR_HOURS,
  getAvatarMeta,
  formatFriendlyTime,
  formatShortDate,
  formatFullDate,
} from '@/lib/booking-utils';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Gamepad2,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import {
  addDays,
  subDays,
  isSameDay,
  isToday,
  parseISO,
  getHours,
  getMinutes,
  differenceInMinutes,
  format,
} from 'date-fns';
import { es } from 'date-fns/locale';

interface CalendarViewProps {
  bookings: Booking[];
  players: Player[];
  onSelectSlot: (date: Date, hour: number) => void;
  onCancelBooking: (bookingId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  bookings,
  players,
  onSelectSlot,
  onCancelBooking,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('week');
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<Booking | null>(null);

  const weekDays = getWeekDays(currentDate);

  // Navegación
  const handlePrev = () => {
    if (viewMode === 'week') {
      setCurrentDate(prev => subDays(prev, 7));
    } else {
      setCurrentDate(prev => subDays(prev, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'week') {
      setCurrentDate(prev => addDays(prev, 7));
    } else {
      setCurrentDate(prev => addDays(prev, 1));
    }
  };

  const handleGoToday = () => {
    setCurrentDate(new Date());
  };

  // Filtrar reservas para un día específico
  const getBookingsForDay = (day: Date) => {
    return bookings.filter(b => {
      if (b.status === 'cancelled') return false;
      const bDate = parseISO(b.start_time);
      return isSameDay(bDate, day);
    });
  };

  // Determinar si una hora específica tiene una reserva que comience o esté en curso
  const getBookingAtSlot = (day: Date, hour: number) => {
    const dayBookings = getBookingsForDay(day);
    return dayBookings.find(b => {
      const s = parseISO(b.start_time);
      const e = parseISO(b.end_time);
      const slotStart = new Date(day);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(day);
      slotEnd.setHours(hour + 1, 0, 0, 0);

      // Si empieza en esta hora o la cruza
      return s.getTime() < slotEnd.getTime() && e.getTime() > slotStart.getTime();
    });
  };

  return (
    <div className="rounded-2xl bg-[#15161f] border border-[#272938] shadow-xl overflow-hidden">
      {/* Calendar Top Toolbar */}
      <div className="p-4 sm:p-5 border-b border-[#272938] flex flex-wrap items-center justify-between gap-4 bg-[#181923]">
        {/* Navigation & Title */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-[#222432] rounded-xl p-1 border border-[#313346]">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-[#2c2f42] transition-colors"
              title="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleGoToday}
              className="px-2.5 py-1 text-xs font-bold text-gray-200 hover:text-white hover:bg-[#2c2f42] rounded-lg transition-colors"
            >
              Hoy
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-[#2c2f42] transition-colors"
              title="Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white capitalize flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#00C3E3]" />
            {viewMode === 'week'
              ? `${format(weekDays[0], 'd MMM', { locale: es })} - ${format(weekDays[6], 'd MMM yyyy', { locale: es })}`
              : formatFullDate(currentDate)}
          </h3>
        </div>

        {/* View Switcher (Semana / Día) */}
        <div className="flex items-center space-x-1.5 bg-[#202230] p-1 rounded-xl border border-[#2d3042]">
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'week'
                ? 'bg-[#FF3C28] text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Vista Semanal
          </button>
          <button
            onClick={() => setViewMode('day')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'day'
                ? 'bg-[#00C3E3] text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Vista Diaria
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VISTA SEMANAL */}
      {/* ========================================================= */}
      {viewMode === 'week' && (
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            {/* Header de días */}
            <div className="grid grid-cols-8 border-b border-[#272938] bg-[#1a1b26] sticky top-0 z-20">
              <div className="p-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-[#272938]">
                Hora
              </div>
              {weekDays.map(day => {
                const dayIsToday = isToday(day);
                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => {
                      setCurrentDate(day);
                      setViewMode('day');
                    }}
                    className={`p-3 text-center cursor-pointer transition-colors border-r border-[#272938] last:border-r-0 ${
                      dayIsToday
                        ? 'bg-[#FF3C28]/10 text-white border-b-2 border-b-[#FF3C28]'
                        : 'hover:bg-[#202231] text-gray-300'
                    }`}
                  >
                    <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      {format(day, 'EEE', { locale: es })}
                    </div>
                    <div
                      className={`text-sm sm:text-base font-black mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-full ${
                        dayIsToday
                          ? 'bg-[#FF3C28] text-white shadow-md'
                          : 'text-white'
                      }`}
                    >
                      {format(day, 'd')}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Grid de Horarios */}
            <div className="divide-y divide-[#232534]">
              {CALENDAR_HOURS.map(hour => (
                <div key={hour} className="grid grid-cols-8 min-h-[58px]">
                  {/* Etiqueta de la hora */}
                  <div className="p-2 text-center text-xs font-mono text-gray-400 border-r border-[#272938] flex items-center justify-center bg-[#181924]/60">
                    {hour === 12 ? '12:00 PM' : hour < 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`}
                  </div>

                  {/* Celdas para cada día de la semana */}
                  {weekDays.map(day => {
                    const booking = getBookingAtSlot(day, hour);
                    const isStartOfBooking =
                      booking && getHours(parseISO(booking.start_time)) === hour;

                    return (
                      <div
                        key={day.toISOString() + hour}
                        className="relative border-r border-[#232534] last:border-r-0 p-1 group transition-colors hover:bg-[#1c1d29]"
                      >
                        {booking ? (
                          // Si es el inicio de la reserva o celda continua
                          <div
                            onClick={() => setSelectedBookingForDetail(booking)}
                            className="w-full h-full min-h-[50px] rounded-lg p-1.5 cursor-pointer text-white shadow-sm flex flex-col justify-between transition-all transform hover:scale-[1.02] border border-white/20"
                            style={{
                              backgroundColor: booking.player?.color || '#FF3C28',
                            }}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-black truncate drop-shadow-sm flex items-center gap-1">
                                <span>{getAvatarMeta(booking.player?.avatar || 'mario').emoji}</span>
                                <span className="truncate">{booking.player?.name}</span>
                              </span>
                              <span className="text-[10px] font-bold bg-black/30 px-1 py-0.2 rounded text-white/90">
                                {formatFriendlyTime(booking.start_time)}
                              </span>
                            </div>

                            <div className="text-[11px] font-medium truncate opacity-95 flex items-center gap-1 mt-0.5">
                              <Gamepad2 className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{booking.game_title}</span>
                            </div>
                          </div>
                        ) : (
                          // Celda libre
                          <button
                            onClick={() => onSelectSlot(day, hour)}
                            className="w-full h-full min-h-[50px] rounded-lg border border-dashed border-transparent group-hover:border-[#383b50] flex items-center justify-center text-gray-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-[#26283a] hover:text-[#00C3E3]"
                            title="Reservar en este horario"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VISTA DIARIA */}
      {/* ========================================================= */}
      {viewMode === 'day' && (
        <div className="p-4 sm:p-6 divide-y divide-[#252737]">
          {CALENDAR_HOURS.map(hour => {
            const booking = getBookingAtSlot(currentDate, hour);
            const isStart = booking && getHours(parseISO(booking.start_time)) === hour;

            return (
              <div
                key={hour}
                className="py-3 flex items-center gap-4 group hover:bg-[#1a1b28] px-3 rounded-xl transition-all"
              >
                {/* Hora */}
                <div className="w-20 text-xs sm:text-sm font-mono text-gray-400 font-semibold">
                  {hour === 12 ? '12:00 PM' : hour < 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`}
                </div>

                {/* Contenido */}
                <div className="flex-1">
                  {booking ? (
                    <div
                      onClick={() => setSelectedBookingForDetail(booking)}
                      className="p-3 sm:p-4 rounded-xl cursor-pointer text-white shadow-md flex items-center justify-between border border-white/20 transition-transform hover:scale-[1.01]"
                      style={{ backgroundColor: booking.player?.color || '#FF3C28' }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl bg-black/20 p-2 rounded-xl">
                          {getAvatarMeta(booking.player?.avatar || 'mario').emoji}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-black text-base sm:text-lg">
                              {booking.player?.name}
                            </span>
                            <span className="text-xs bg-black/30 px-2 py-0.5 rounded-full font-mono">
                              {formatFriendlyTime(booking.start_time)} -{' '}
                              {formatFriendlyTime(booking.end_time)}
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm opacity-90 flex items-center gap-1.5 mt-0.5">
                            <Gamepad2 className="w-4 h-4" />
                            <span>{booking.game_title}</span>
                            {booking.notes && (
                              <span className="text-white/70 italic hidden sm:inline">
                                • {booking.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedBookingForDetail(booking);
                        }}
                        className="px-3 py-1.5 text-xs font-bold bg-black/30 hover:bg-black/50 rounded-lg transition-colors"
                      >
                        Ver Detalle
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onSelectSlot(currentDate, hour)}
                      className="w-full py-2.5 px-4 rounded-xl border border-dashed border-[#2f3246] hover:border-[#00C3E3]/60 hover:bg-[#202334] text-xs sm:text-sm text-gray-400 hover:text-white transition-all flex items-center justify-between"
                    >
                      <span>Libre para jugar</span>
                      <span className="text-xs text-[#00C3E3] font-bold flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> Reservar
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* LEYENDA INFERIOR DE PRIMOS */}
      {/* ========================================================= */}
      <div className="p-4 border-t border-[#272938] bg-[#161722] flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-gray-400 font-semibold">Jugadores registrados:</span>
        <div className="flex flex-wrap items-center gap-2">
          {players.map(p => (
            <div
              key={p.id}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#1e202e] border border-[#2f3246]"
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: p.color }}
              />
              <span className="font-bold text-gray-200">{p.name}</span>
              <span className="text-gray-500 text-[10px]">
                {getAvatarMeta(p.avatar).emoji}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL DETALLE DE RESERVA / CANCELACIÓN */}
      {/* ========================================================= */}
      {selectedBookingForDetail && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1b26] border border-[#2f3246] rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center space-x-3 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-md"
                style={{
                  backgroundColor: selectedBookingForDetail.player?.color || '#FF3C28',
                }}
              >
                {getAvatarMeta(selectedBookingForDetail.player?.avatar || 'mario').emoji}
              </div>
              <div>
                <h4 className="text-xl font-black text-white">
                  {selectedBookingForDetail.player?.name}
                </h4>
                <p className="text-xs text-gray-400">
                  Reserva para Nintendo Switch
                </p>
              </div>
            </div>

            <div className="space-y-3 bg-[#13141d] p-4 rounded-xl border border-[#262838] text-sm mb-6">
              <div className="flex justify-between items-center text-gray-300">
                <span className="text-gray-500">Fecha:</span>
                <span className="font-semibold text-white">
                  {formatFullDate(selectedBookingForDetail.start_time)}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-300">
                <span className="text-gray-500">Horario:</span>
                <span className="font-mono font-bold text-[#00C3E3]">
                  {formatFriendlyTime(selectedBookingForDetail.start_time)} -{' '}
                  {formatFriendlyTime(selectedBookingForDetail.end_time)}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-300">
                <span className="text-gray-500">Juego:</span>
                <span className="font-semibold text-white flex items-center gap-1">
                  <Gamepad2 className="w-4 h-4 text-[#FF3C28]" />
                  {selectedBookingForDetail.game_title}
                </span>
              </div>
              {selectedBookingForDetail.notes && (
                <div className="border-t border-[#262838] pt-2 text-xs text-gray-400">
                  <span className="font-semibold text-gray-300">Nota:</span>{' '}
                  {selectedBookingForDetail.notes}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  if (confirm('¿Estás seguro de que deseas cancelar este turno?')) {
                    onCancelBooking(selectedBookingForDetail.id);
                    setSelectedBookingForDetail(null);
                  }
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-red-400 bg-red-950/30 hover:bg-red-950/60 border border-red-500/30 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Cancelar Turno</span>
              </button>

              <button
                onClick={() => setSelectedBookingForDetail(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#2c2f42] hover:bg-[#383c54] transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
