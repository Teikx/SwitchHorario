'use client';

import React, { useState, useEffect } from 'react';
import { Player, Booking } from '@/lib/types';
import {
  getPlayers,
  addPlayer,
  getBookings,
  createBooking,
  cancelBooking,
  releaseBookingEarly,
} from '@/lib/storage';
import { isSupabaseConfigured } from '@/lib/supabase';
import { SwitchHeader } from '@/components/SwitchHeader';
import { LiveStatusCard } from '@/components/LiveStatusCard';
import { CalendarView } from '@/components/CalendarView';
import { BookingModal } from '@/components/BookingModal';
import { PlayersModal } from '@/components/PlayersModal';
import { ReleaseModal } from '@/components/ReleaseModal';
import { RulesModal } from '@/components/RulesModal';
import { Database, Sparkles, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { addHours, formatISO } from 'date-fns';

export default function HomePage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [supabaseActive, setSupabaseActive] = useState<boolean>(false);

  // Modals state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isPlayersOpen, setIsPlayersOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isReleaseOpen, setIsReleaseOpen] = useState(false);
  const [selectedBookingForRelease, setSelectedBookingForRelease] = useState<Booking | null>(null);

  // Slot pre-selected from clicking on the calendar
  const [preSelectedSlot, setPreSelectedSlot] = useState<{ date: Date; hour: number } | null>(null);

  // Load initial data
  const loadData = async () => {
    try {
      const [loadedPlayers, loadedBookings] = await Promise.all([
        getPlayers(),
        getBookings(),
      ]);
      setPlayers(loadedPlayers);
      setBookings(loadedBookings);
      setSupabaseActive(isSupabaseConfigured());
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Auto refrescar cada 30 segundos
    const timer = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  // Handler: Clic en slot vacío del calendario
  const handleSelectSlot = (date: Date, hour: number) => {
    setPreSelectedSlot({ date, hour });
    setIsBookingOpen(true);
  };

  // Handler: Guardar reserva
  const handleSaveBooking = async (bookingData: {
    player_id: string;
    game_title: string;
    start_time: string;
    end_time: string;
    notes?: string;
  }) => {
    const res = await createBooking(bookingData);
    if (res.success) {
      await loadData();
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  // Handler: Quick Play (Jugar 1 hora a partir de este instante)
  const handleQuickPlay = async () => {
    if (players.length === 0) {
      setIsPlayersOpen(true);
      return;
    }

    // Si ya hay alguien jugando, no se puede
    const now = new Date();
    const end = addHours(now, 1);

    // Abrir modal con la hora actual pre-seleccionada
    setPreSelectedSlot({ date: now, hour: now.getHours() });
    setIsBookingOpen(true);
  };

  // Handler: Liberar turno anticipadamente
  const handleRequestRelease = (booking: Booking) => {
    setSelectedBookingForRelease(booking);
    setIsReleaseOpen(true);
  };

  const handleConfirmRelease = async (bookingId: string) => {
    const ok = await releaseBookingEarly(bookingId);
    if (ok) {
      await loadData();
    }
    return ok;
  };

  // Handler: Cancelar reserva
  const handleCancelBooking = async (bookingId: string) => {
    const ok = await cancelBooking(bookingId);
    if (ok) {
      await loadData();
    }
  };

  // Handler: Agregar Primo
  const handleAddPlayer = async (playerData: {
    name: string;
    avatar: string;
    color: string;
    pin_hash?: string;
  }) => {
    try {
      await addPlayer(playerData);
      await loadData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0d0e13]">
      {/* Header temático Nintendo Switch */}
      <SwitchHeader
        onOpenBooking={() => {
          setPreSelectedSlot(null);
          setIsBookingOpen(true);
        }}
        onOpenPlayers={() => setIsPlayersOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Banner de Estado de Base de Datos */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#151722] border border-[#272a3a] text-xs">
          <div className="flex items-center space-x-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                supabaseActive ? 'bg-[#10E364] animate-pulse' : 'bg-[#00C3E3]'
              }`}
            />
            <span className="font-bold text-gray-200">
              {supabaseActive
                ? 'Conectado a Supabase (Sincronización en la nube activa)'
                : 'Modo Local Listo (Almacenamiento en navegador - Puedes conectar Supabase gratis)'}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-gray-400">
            <button
              onClick={loadData}
              className="flex items-center space-x-1 hover:text-white transition-colors"
              title="Recargar datos"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
            <span className="text-gray-600">|</span>
            <span>{players.length} primos registrados</span>
          </div>
        </div>

        {/* Hero Card: Estado en Vivo (En Juego Ahora / Disponible) */}
        <LiveStatusCard
          bookings={bookings}
          players={players}
          onQuickPlay={handleQuickPlay}
          onOpenBooking={() => {
            setPreSelectedSlot(null);
            setIsBookingOpen(true);
          }}
          onRequestRelease={handleRequestRelease}
        />

        {/* Calendario Interactivo */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Calendario de Turnos</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-[#222435] text-gray-300 font-normal">
                  Toca una hora vacía para reservar
                </span>
              </h2>
            </div>
          </div>

          <CalendarView
            bookings={bookings}
            players={players}
            onSelectSlot={handleSelectSlot}
            onCancelBooking={handleCancelBooking}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#20222f] bg-[#101118] py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-black text-white">SwitchHorario</span>
            <span>•</span>
            <span>Sistema familiar de turnos para Nintendo Switch</span>
          </div>
          <div className="text-gray-400">
            Diseñado para desplegar en <strong className="text-white">Vercel</strong> con base de datos <strong className="text-white">Supabase</strong>.
          </div>
        </div>
      </footer>

      {/* Modales */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => {
          setIsBookingOpen(false);
          setPreSelectedSlot(null);
        }}
        players={players}
        existingBookings={bookings}
        initialDate={preSelectedSlot?.date}
        initialHour={preSelectedSlot?.hour}
        onSaveBooking={handleSaveBooking}
      />

      <PlayersModal
        isOpen={isPlayersOpen}
        onClose={() => setIsPlayersOpen(false)}
        players={players}
        bookings={bookings}
        onAddPlayer={handleAddPlayer}
      />

      <ReleaseModal
        isOpen={isReleaseOpen}
        onClose={() => {
          setIsReleaseOpen(false);
          setSelectedBookingForRelease(null);
        }}
        booking={selectedBookingForRelease}
        onConfirmRelease={handleConfirmRelease}
      />

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />
    </div>
  );
}
