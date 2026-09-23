import { Player, Booking } from './types';
import { DEFAULT_PLAYERS } from './constants';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { findConflictingBooking } from './booking-utils';
import { addHours, subMinutes, addMinutes, formatISO } from 'date-fns';

const PLAYERS_KEY = 'switch_horario_players';
const BOOKINGS_KEY = 'switch_horario_bookings';

/**
 * Genera reservas de demostración iniciales para hoy si el almacenamiento está vacío
 */
function getInitialSampleBookings(players: Player[]): Booking[] {
  const now = new Date();
  
  // Una reserva activa ahora mismo (ej. Carlos jugando Mario Kart)
  const p1 = players[0] || DEFAULT_PLAYERS[0];
  const p2 = players[1] || DEFAULT_PLAYERS[1];
  const p3 = players[2] || DEFAULT_PLAYERS[2];

  const currentStart = subMinutes(now, 25);
  const currentEnd = addMinutes(now, 35); // Le faltan 35 min

  const laterStart = addHours(now, 2);
  const laterEnd = addHours(now, 3.5);

  const tomorrow = addHours(now, 24);
  const tomorrowStart = new Date(tomorrow.setHours(16, 0, 0, 0));
  const tomorrowEnd = new Date(tomorrow.setHours(18, 0, 0, 0));

  return [
    {
      id: 'demo-1',
      player_id: p1.id,
      game_title: 'Mario Kart 8 Deluxe',
      start_time: formatISO(currentStart),
      end_time: formatISO(currentEnd),
      status: 'active',
      notes: 'Copa Champiñón 150cc',
      player: p1,
    },
    {
      id: 'demo-2',
      player_id: p2.id,
      game_title: 'Super Smash Bros. Ultimate',
      start_time: formatISO(laterStart),
      end_time: formatISO(laterEnd),
      status: 'active',
      notes: 'Práctica con Lucina',
      player: p2,
    },
    {
      id: 'demo-3',
      player_id: p3.id,
      game_title: 'Zelda: Tears of the Kingdom',
      start_time: formatISO(tomorrowStart),
      end_time: formatISO(tomorrowEnd),
      status: 'active',
      notes: 'Exploración del subsuelo',
      player: p3,
    },
  ];
}

// ==========================================
// MÉTODOS DE JUGADORES / PRIMOS
// ==========================================

export async function getPlayers(): Promise<Player[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error al obtener jugadores de Supabase:', error);
      return DEFAULT_PLAYERS;
    }

    if (data && data.length > 0) {
      return data as Player[];
    }

    // Si la tabla players existe en Supabase pero está vacía, sembrar por defecto
    try {
      const { data: inserted } = await supabase
        .from('players')
        .insert(DEFAULT_PLAYERS.map(p => ({
          name: p.name,
          avatar: p.avatar,
          color: p.color,
          pin_hash: p.pin_hash || '1234',
        })))
        .select();

      if (inserted && inserted.length > 0) {
        return inserted as Player[];
      }
    } catch (e) {
      console.warn('Auto-siembra en Supabase:', e);
    }

    return DEFAULT_PLAYERS;
  }

  // Fallback en navegador (localStorage solo si NO hay Supabase)
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(PLAYERS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parseando players de localStorage:', e);
      }
    }
    localStorage.setItem(PLAYERS_KEY, JSON.stringify(DEFAULT_PLAYERS));
  }

  return DEFAULT_PLAYERS;
}

export async function addPlayer(newPlayer: Omit<Player, 'id' | 'created_at'>): Promise<Player> {
  const supabase = getSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase
      .from('players')
      .insert([{
        name: newPlayer.name,
        avatar: newPlayer.avatar,
        color: newPlayer.color,
        pin_hash: newPlayer.pin_hash || '1234',
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Error al guardar en Supabase: ${error.message}`);
    }
    return data as Player;
  }

  // Fallback Local
  const id = `p-${Date.now()}`;
  const player: Player = {
    ...newPlayer,
    id,
    created_at: new Date().toISOString(),
  };

  const current = await getPlayers();
  const updated = [...current, player];
  if (typeof window !== 'undefined') {
    localStorage.setItem(PLAYERS_KEY, JSON.stringify(updated));
  }

  return player;
}

// ==========================================
// MÉTODOS DE RESERVAS / HORARIOS
// ==========================================

export async function getBookings(): Promise<Booking[]> {
  const supabase = getSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, player:players(*)')
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error al obtener reservas de Supabase:', error);
      return [];
    }
    
    if (data) {
      return data as Booking[];
    }

    return [];
  }

  // Fallback Local (solo si NO hay Supabase configurado)
  const players = await getPlayers();
  const playersMap = new Map(players.map(p => [p.id, p]));

  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(BOOKINGS_KEY);
    if (saved) {
      try {
        const parsed: Booking[] = JSON.parse(saved);
        return parsed.map(b => ({
          ...b,
          player: playersMap.get(b.player_id) || b.player,
        }));
      } catch (e) {
        console.error('Error parseando reservas:', e);
      }
    }

    // Inicializar muestras solo en modo local
    const sample = getInitialSampleBookings(players);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(sample));
    return sample;
  }

  return [];
}

export async function createBooking(
  bookingData: Omit<Booking, 'id' | 'created_at' | 'status' | 'player'>
): Promise<{ success: boolean; booking?: Booking; error?: string }> {
  const existing = await getBookings();

  // Validar solapamiento de horarios
  const conflict = findConflictingBooking(
    bookingData.start_time,
    bookingData.end_time,
    existing
  );

  if (conflict) {
    const playerName = conflict.player?.name || 'Otro primo';
    return {
      success: false,
      error: `¡Horario ocupado! ${playerName} ya tiene reservada la consola en ese horario.`,
    };
  }

  const supabase = getSupabaseClient();
  const gameTitle = bookingData.game_title || 'Nintendo Switch';

  if (supabase) {
    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        player_id: bookingData.player_id,
        game_title: gameTitle,
        start_time: bookingData.start_time,
        end_time: bookingData.end_time,
        status: 'active',
        is_open_ended: bookingData.is_open_ended || false,
        notes: bookingData.notes || '',
      }])
      .select('*, player:players(*)')
      .single();

    if (error) {
      return { success: false, error: `Error de base de datos: ${error.message}` };
    }

    return {
      success: true,
      booking: { ...data, is_open_ended: bookingData.is_open_ended } as Booking,
    };
  }

  // Fallback Local
  const players = await getPlayers();
  const player = players.find(p => p.id === bookingData.player_id);

  const newBooking: Booking = {
    ...bookingData,
    game_title: gameTitle,
    id: `b-${Date.now()}`,
    status: 'active',
    created_at: new Date().toISOString(),
    player,
  };

  const updated = [...existing, newBooking];
  if (typeof window !== 'undefined') {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
  }

  return { success: true, booking: newBooking };
}

/**
 * Libera la consola antes de tiempo (actualiza end_time a la hora actual y status a completed)
 */
export async function releaseBookingEarly(bookingId: string): Promise<boolean> {
  const nowIso = new Date().toISOString();
  const supabase = getSupabaseClient();

  if (supabase) {
    const { error } = await supabase
      .from('bookings')
      .update({
        end_time: nowIso,
        status: 'completed',
      })
      .eq('id', bookingId);

    if (error) {
      console.error('Error liberando en Supabase:', error);
      return false;
    }
    return true;
  }

  // Fallback Local
  const existing = await getBookings();
  const updated = existing.map(b => {
    if (b.id === bookingId) {
      return {
        ...b,
        end_time: nowIso,
        status: 'completed' as const,
      };
    }
    return b;
  });

  if (typeof window !== 'undefined') {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
  }

  return true;
}

/**
 * Cancela una reserva
 */
export async function cancelBooking(bookingId: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  if (supabase) {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);

    if (error) {
      console.error('Error cancelando en Supabase:', error);
      return false;
    }
    return true;
  }

  // Fallback Local
  const existing = await getBookings();
  const updated = existing.filter(b => b.id !== bookingId);

  if (typeof window !== 'undefined') {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
  }

  return true;
}
