import { Booking, AvatarOption } from './types';
import { AVATAR_OPTIONS } from './constants';
import { 
  format, 
  parseISO, 
  isWithinInterval, 
  differenceInMinutes, 
  addMinutes, 
  startOfDay, 
  addDays, 
  startOfWeek,
  isBefore,
  isAfter,
  isSameDay
} from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Verifica si dos intervalos de tiempo se solapan
 */
export function isOverlapping(
  startA: Date | string,
  endA: Date | string,
  startB: Date | string,
  endB: Date | string
): boolean {
  const sA = typeof startA === 'string' ? parseISO(startA).getTime() : startA.getTime();
  const eA = typeof endA === 'string' ? parseISO(endA).getTime() : endA.getTime();
  const sB = typeof startB === 'string' ? parseISO(startB).getTime() : startB.getTime();
  const eB = typeof endB === 'string' ? parseISO(endB).getTime() : endB.getTime();

  return sA < eB && sB < eA;
}

/**
 * Busca si una nueva reserva colisiona con alguna reserva existente activa
 */
export function findConflictingBooking(
  newStart: Date | string,
  newEnd: Date | string,
  bookings: Booking[],
  excludeBookingId?: string
): Booking | null {
  for (const b of bookings) {
    if (b.status !== 'active') continue;
    if (excludeBookingId && b.id === excludeBookingId) continue;

    if (isOverlapping(newStart, newEnd, b.start_time, b.end_time)) {
      return b;
    }
  }
  return null;
}

/**
 * Retorna la reserva que está en curso en este preciso momento (si existe)
 */
export function getCurrentActiveBooking(bookings: Booking[], now: Date = new Date()): Booking | null {
  const nowTime = now.getTime();
  return (
    bookings.find(b => {
      if (b.status !== 'active') return false;
      const s = parseISO(b.start_time).getTime();
      const e = parseISO(b.end_time).getTime();
      return nowTime >= s && nowTime < e;
    }) || null
  );
}

/**
 * Retorna la próxima reserva programada en el futuro más cercano
 */
export function getNextUpcomingBooking(bookings: Booking[], now: Date = new Date()): Booking | null {
  const nowTime = now.getTime();
  const upcoming = bookings
    .filter(b => b.status === 'active' && parseISO(b.start_time).getTime() > nowTime)
    .sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime());

  return upcoming[0] || null;
}

/**
 * Formatea una hora en formato amigable (ej: "4:00 PM")
 */
export function formatFriendlyTime(dateOrIso: Date | string): string {
  const d = typeof dateOrIso === 'string' ? parseISO(dateOrIso) : dateOrIso;
  return format(d, 'h:mm a');
}

/**
 * Formatea una fecha en formato español (ej: "Mié, 23 Sep")
 */
export function formatShortDate(dateOrIso: Date | string): string {
  const d = typeof dateOrIso === 'string' ? parseISO(dateOrIso) : dateOrIso;
  return format(d, 'EEE d MMM', { locale: es });
}

/**
 * Formatea fecha completa (ej: "Miércoles 23 de Septiembre")
 */
export function formatFullDate(dateOrIso: Date | string): string {
  const d = typeof dateOrIso === 'string' ? parseISO(dateOrIso) : dateOrIso;
  return format(d, "EEEE d 'de' MMMM", { locale: es });
}

/**
 * Obtiene metadata del avatar (emoji y color)
 */
export function getAvatarMeta(avatarId: string): AvatarOption {
  const found = AVATAR_OPTIONS.find(a => a.id === avatarId);
  return found || { id: avatarId, name: avatarId, emoji: '🎮', bgColor: '#FF3C28' };
}

/**
 * Calcula porcentaje transcurrido y minutos restantes
 */
export function getRemainingProgress(booking: Booking, now: Date = new Date()): {
  remainingMinutes: number;
  totalMinutes: number;
  progressPercent: number;
  isFinished: boolean;
} {
  const start = parseISO(booking.start_time);
  const end = parseISO(booking.end_time);

  const totalMinutes = Math.max(1, differenceInMinutes(end, start));
  const remainingMinutes = Math.max(0, differenceInMinutes(end, now));
  const elapsedMinutes = Math.max(0, differenceInMinutes(now, start));

  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedMinutes / totalMinutes) * 100)));

  return {
    remainingMinutes,
    totalMinutes,
    progressPercent,
    isFinished: remainingMinutes <= 0,
  };
}

/**
 * Genera los 7 días de la semana a partir de una fecha dada
 */
export function getWeekDays(baseDate: Date): Date[] {
  // Empezar en Lunes (weekStartsOn: 1)
  const start = startOfWeek(baseDate, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/**
 * Horas del día soportadas en el calendario (8:00 AM a 11:00 PM)
 */
export const CALENDAR_HOURS = Array.from({ length: 16 }, (_, i) => i + 8); // 8 a 23
