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
  isSameDay,
  isSameWeek,
  getHours
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
  elapsedMinutes: number;
  isOpenEnded: boolean;
  isFinished: boolean;
} {
  const start = parseISO(booking.start_time);
  const end = parseISO(booking.end_time);

  const totalMinutes = Math.max(1, differenceInMinutes(end, start));
  const remainingMinutes = Math.max(0, differenceInMinutes(end, now));
  const elapsedMinutes = Math.max(0, differenceInMinutes(now, start));

  const isOpenEnded = Boolean(booking.is_open_ended);

  const progressPercent = isOpenEnded
    ? 100
    : Math.min(100, Math.max(0, Math.round((elapsedMinutes / totalMinutes) * 100)));

  return {
    remainingMinutes,
    totalMinutes,
    progressPercent,
    elapsedMinutes,
    isOpenEnded,
    isFinished: !isOpenEnded && remainingMinutes <= 0,
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
 * Horas del día estándar en el calendario (8:00 AM a 11:00 PM)
 */
export const FULL_CALENDAR_HOURS = Array.from({ length: 16 }, (_, i) => i + 8); // 8 a 23
export const CALENDAR_HOURS = FULL_CALENDAR_HOURS;

/**
 * Calcula dinámicamente las horas relevantes a mostrar en el calendario
 * según las reservas existentes y la hora actual, evitando filas vacías innecesarias.
 */
export function getDynamicCalendarHours(
  bookings: Booking[],
  currentDate: Date,
  isFullDay: boolean = false
): number[] {
  if (isFullDay) {
    return FULL_CALENDAR_HOURS;
  }

  const now = new Date();
  const currentHour = now.getHours();
  const hoursSet = new Set<number>();

  // Si estamos en la semana o día actual, asegurar que la hora actual y cercanas estén disponibles
  if (isSameWeek(currentDate, now, { weekStartsOn: 1 }) || isSameDay(currentDate, now)) {
    hoursSet.add(Math.max(8, Math.min(23, currentHour - 1)));
    hoursSet.add(Math.max(8, Math.min(23, currentHour)));
    hoursSet.add(Math.max(8, Math.min(23, currentHour + 1)));
    hoursSet.add(Math.max(8, Math.min(23, currentHour + 2)));
  }

  // Recolectar las horas de las reservas activas en el rango visible
  bookings.forEach(b => {
    if (b.status === 'cancelled') return;
    const s = parseISO(b.start_time);
    const e = parseISO(b.end_time);

    // Solo considerar reservas de la misma semana o día visible
    if (isSameWeek(s, currentDate, { weekStartsOn: 1 })) {
      const sH = getHours(s);
      const eH = getHours(e);
      for (let h = sH; h <= eH && h <= 23; h++) {
        if (h >= 8) hoursSet.add(h);
      }
    }
  });

  // Si no hay ninguna reserva en la semana, centrar en horas comunes de juego (tarde)
  if (hoursSet.size === 0) {
    const center = Math.max(13, Math.min(18, currentHour));
    const start = Math.max(8, center - 2);
    const end = Math.min(23, center + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  const hoursArray = Array.from(hoursSet);
  let minH = Math.min(...hoursArray);
  let maxH = Math.max(...hoursArray);

  // Agregar 1 hora de margen antes y después
  minH = Math.max(8, minH - 1);
  maxH = Math.min(23, maxH + 1);

  // Garantizar un rango mínimo de al menos 5 horas para buena presencia visual
  if (maxH - minH < 5) {
    if (maxH + (5 - (maxH - minH)) <= 23) {
      maxH += 5 - (maxH - minH);
    } else {
      minH = Math.max(8, maxH - 5);
    }
  }

  return Array.from({ length: maxH - minH + 1 }, (_, i) => minH + i);
}
