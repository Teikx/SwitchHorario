'use client';

import React, { useState, useEffect } from 'react';
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
  Plus,
  Gamepad2,
  Trash2,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  addDays,
  subDays,
  isSameDay,
  isToday,
  parseISO,
  getHours,
  getMinutes,
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
  const [now, setNow] = useState<Date>(new Date());

  // Reloj para la línea roja de hora actual
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

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

      return s.getTime() < slotEnd.getTime() && e.getTime() > slotStart.getTime();
    });
  };

  // Posición de la línea de tiempo actual (en porcentaje respecto a CALENDAR_HOURS)
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const isNowInCalendar = currentHour >= 8 && currentHour <= 23;

  return (
    <div className="rounded-2xl bg-[#14151e] border border-[#242636] shadow-xl overflow-hidden flex flex-col">
      {/* ========================================================= */}
      {/* TOOLBAR SUPERIOR DEL CALENDARIO */}
      {/* ========================================================= */}
      <div className="p-3.5 sm:p-4 border-b border-[#242636] flex flex-wrap items-center justify-between gap-3 bg-[#171824]/90">
        {/* Navegación y Título */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-[#1e202e] rounded-lg p-0.5 border border-[#2c2f42]">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-[#282a3c] transition-colors"
              title="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleGoToday}
              className="px-2.5 py-1 text-xs font-bold text-gray-300 hover:text-white hover:bg-[#282a3c] rounded transition-colors"
            >
              Hoy
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-[#282a3c] transition-colors"
              title="Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-base sm:text-lg font-black text-white capitalize">
            {viewMode === 'week'
              ? `${format(weekDays[0], 'd MMM', { locale: es })} - ${format(weekDays[6], 'd MMM yyyy', { locale: es })}`
              : formatFullDate(currentDate)}
          </h3>
        </div>

        {/* Primos Legend Compacta & Selector de Vista */}
        <div className="flex items-center space-x-3 ml-auto">
          {/* Mini avatares de primos */}
          <div className="hidden lg:flex items-center space-x-1.5 bg-[#1b1c28] px-2.5 py-1 rounded-lg border border-[#282a3a]">
            {players.map(p => (
              <span
                key={p.id}
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold ring-1 ring-white/10"
                style={{ backgroundColor: p.color }}
                title={`${p.name} (${getAvatarMeta(p.avatar).name})`}
              >
                {getAvatarMeta(p.avatar).emoji}
              </span>
            ))}
          </div>

          {/* Toggle Vista: Semana / Día */}
          <div className="flex items-center bg-[#1e202e] p-0.5 rounded-lg border border-[#2c2f42]">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                viewMode === 'week'
                  ? 'bg-[#FF3C28] text-white shadow'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                viewMode === 'day'
                  ? 'bg-[#00C3E3] text-white shadow'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Día
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VISTA SEMANAL */}
      {/* ========================================================= */}
      {viewMode === 'week' && (
        <div className="overflow-x-auto">
          <div className="min-w-[740px]">
            {/* Cabecera de Días */}
            <div className="grid grid-cols-8 border-b border-[#232535] bg-[#161722] sticky top-0 z-20">
              <div className="p-2.5 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-r border-[#232535]">
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
                    className={`p-2.5 text-center cursor-pointer transition-colors border-r border-[#232535] last:border-r-0 ${
                      dayIsToday
                        ? 'bg-[#FF3C28]/10 text-white'
                        : 'hover:bg-[#1b1c28] text-gray-400'
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider">
                      {format(day, 'EEE', { locale: es })}
                    </div>
                    <div
                      className={`text-sm font-black mt-0.5 inline-flex items-center justify-center w-6 h-6 rounded-full ${
                        dayIsToday
                          ? 'bg-[#FF3C28] text-white shadow-sm'
                          : 'text-gray-200'
                      }`}
                    >
                      {format(day, 'd')}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Grilla de Horarios */}
            <div className="divide-y divide-[#202230]">
              {CALENDAR_HOURS.map(hour => (
                <div key={hour} className="grid grid-cols-8 min-h-[54px]">
                  {/* Columna de hora */}
                  <div className="p-2 text-center text-xs font-mono text-gray-400 border-r border-[#232535] flex items-center justify-center bg-[#13141d]/50">
                    {hour === 12 ? '12 PM' : hour < 12 ? `${hour} AM` : `${hour - 12} PM`}
                  </div>

                  {/* Celdas para cada día */}
                  {weekDays.map(day => {
                    const booking = getBookingAtSlot(day, hour);
                    const dayIsToday = isToday(day);
                    const isCurrentHourSlot = dayIsToday && currentHour === hour;

                    return (
                      <div
                        key={day.toISOString() + hour}
                        className={`relative border-r border-[#202230] last:border-r-0 p-1 group transition-colors ${
                          dayIsToday ? 'bg-white/[0.015]' : ''
                        } hover:bg-[#191a26]`}
                      >
                        {/* Indicador de hora actual si aplica */}
                        {isCurrentHourSlot && (
                          <div
                            className="absolute left-0 right-0 z-10 border-t-2 border-[#FF3C28] pointer-events-none flex items-center"
                            style={{ top: `${(currentMinute / 60) * 100}%` }}
                          >
                            <span className="w-2 h-2 rounded-full bg-[#FF3C28] -ml-1 -mt-0.5" />
                          </div>
                        )}

                        {booking ? (
                          // Tarjeta de Reserva con diseño minimalista moderno
                          <div
                            onClick={() => setSelectedBookingForDetail(booking)}
                            className="w-full h-full min-h-[46px] rounded-lg px-2 py-1.5 cursor-pointer text-white shadow-sm flex flex-col justify-between transition-all transform hover:scale-[1.01] border"
                            style={{
                              backgroundColor: `${booking.player?.color || '#FF3C28'}22`,
                              borderColor: `${booking.player?.color || '#FF3C28'}66`,
                              borderLeftWidth: '3.5px',
                              borderLeftColor: booking.player?.color || '#FF3C28',
                            }}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold truncate flex items-center gap-1 text-white">
                                <span>{getAvatarMeta(booking.player?.avatar || 'mario').emoji}</span>
                                <span className="truncate">{booking.player?.name}</span>
                              </span>
                              <span className="text-[10px] font-mono text-gray-300">
                                {booking.is_open_ended
                                  ? 'En curso'
                                  : formatFriendlyTime(booking.start_time)}
                              </span>
                            </div>

                            {booking.notes ? (
                              <div className="text-[11px] text-gray-300 truncate mt-0.5 italic">
                                &quot;{booking.notes}&quot;
                              </div>
                            ) : (
                              <div className="text-[10px] text-gray-400 truncate mt-0.5">
                                {booking.is_open_ended ? 'Hasta liberar' : `${formatFriendlyTime(booking.start_time)} - ${formatFriendlyTime(booking.end_time)}`}
                              </div>
                            )}
                          </div>
                        ) : (
                          // Espacio Libre (Clic para reservar)
                          <button
                            onClick={() => onSelectSlot(day, hour)}
                            className="w-full h-full min-h-[46px] rounded-lg border border-transparent group-hover:border-[#2f3246] flex items-center justify-center text-gray-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-[#202234] hover:text-[#00C3E3]"
                            title="Toca para reservar este horario"
                          >
                            <Plus className="w-3.5 h-3.5" />
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
        <div className="p-3 sm:p-5 divide-y divide-[#202230]">
          {CALENDAR_HOURS.map(hour => {
            const booking = getBookingAtSlot(currentDate, hour);
            const isCurrentSlot = isToday(currentDate) && currentHour === hour;

            return (
              <div
                key={hour}
                className={`py-2.5 flex items-center gap-3 group hover:bg-[#181926] px-2.5 rounded-xl transition-all ${
                  isCurrentSlot ? 'bg-[#FF3C28]/5' : ''
                }`}
              >
                {/* Hora */}
                <div className="w-16 text-xs font-mono text-gray-400 font-semibold">
                  {hour === 12 ? '12:00 PM' : hour < 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`}
                </div>

                {/* Contenedor del turno */}
                <div className="flex-1">
                  {booking ? (
                    <div
                      onClick={() => setSelectedBookingForDetail(booking)}
                      className="p-3 rounded-xl cursor-pointer text-white shadow-sm flex items-center justify-between border transition-transform hover:scale-[1.005]"
                      style={{
                        backgroundColor: `${booking.player?.color || '#FF3C28'}22`,
                        borderColor: `${booking.player?.color || '#FF3C28'}66`,
                        borderLeftWidth: '4px',
                        borderLeftColor: booking.player?.color || '#FF3C28',
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-xl shadow-sm"
                          style={{ backgroundColor: booking.player?.color || '#FF3C28' }}
                        >
                          {getAvatarMeta(booking.player?.avatar || 'mario').emoji}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-white">
                              {booking.player?.name}
                            </span>
                            <span className="text-[11px] text-gray-300 font-mono">
                              {booking.is_open_ended
                                ? `Desde ${formatFriendlyTime(booking.start_time)} (Sin límite fijo)`
                                : `${formatFriendlyTime(booking.start_time)} - ${formatFriendlyTime(booking.end_time)}`}
                            </span>
                          </div>
                          {booking.notes && (
                            <div className="text-xs text-gray-400 italic mt-0.5">
                              &quot;{booking.notes}&quot;
                            </div>
                          )}
                        </div>
                      </div>

                      <span className="text-xs text-gray-400 hover:text-white">Ver</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onSelectSlot(currentDate, hour)}
                      className="w-full py-2 px-3 rounded-xl border border-dashed border-[#272a3a] hover:border-[#00C3E3]/50 hover:bg-[#1c1e2b] text-xs text-gray-500 hover:text-gray-300 transition-all flex items-center justify-between"
                    >
                      <span>Disponible</span>
                      <span className="text-[11px] text-[#00C3E3] font-semibold flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Reservar
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
      {/* MODAL DETALLE DE RESERVA / CANCELACIÓN */}
      {/* ========================================================= */}
      {selectedBookingForDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171824] border border-[#2b2e40] rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center space-x-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md"
                style={{
                  backgroundColor: selectedBookingForDetail.player?.color || '#FF3C28',
                }}
              >
                {getAvatarMeta(selectedBookingForDetail.player?.avatar || 'mario').emoji}
              </div>
              <div>
                <h4 className="text-base font-black text-white">
                  {selectedBookingForDetail.player?.name}
                </h4>
                <p className="text-xs text-gray-400">Turno de Nintendo Switch</p>
              </div>
            </div>

            <div className="space-y-2 bg-[#12131b] p-3 rounded-xl border border-[#222434] text-xs mb-5">
              <div className="flex justify-between items-center text-gray-300">
                <span className="text-gray-500">Fecha:</span>
                <span className="font-semibold text-white">
                  {formatFullDate(selectedBookingForDetail.start_time)}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-300">
                <span className="text-gray-500">Horario:</span>
                <span className="font-mono font-bold text-[#00C3E3]">
                  {selectedBookingForDetail.is_open_ended
                    ? `Desde ${formatFriendlyTime(selectedBookingForDetail.start_time)} (Sin límite fijo)`
                    : `${formatFriendlyTime(selectedBookingForDetail.start_time)} - ${formatFriendlyTime(selectedBookingForDetail.end_time)}`}
                </span>
              </div>
              {selectedBookingForDetail.notes && (
                <div className="border-t border-[#222434] pt-2 text-gray-400">
                  <span className="font-semibold text-gray-300">Nota:</span>{' '}
                  &quot;{selectedBookingForDetail.notes}&quot;
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  if (confirm('¿Deseas cancelar esta reserva?')) {
                    onCancelBooking(selectedBookingForDetail.id);
                    setSelectedBookingForDetail(null);
                  }
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold text-red-400 bg-red-950/20 hover:bg-red-950/50 border border-red-500/20 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Cancelar</span>
              </button>

              <button
                onClick={() => setSelectedBookingForDetail(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#25283a] hover:bg-[#30344a] transition-colors"
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
