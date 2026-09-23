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
import { isSupabaseConfigured, setRuntimeConfig } from '@/lib/supabase';
import { SwitchHeader } from '@/components/SwitchHeader';
import { LiveStatusStrip } from '@/components/LiveStatusStrip';
import { CalendarView } from '@/components/CalendarView';
import { BookingModal } from '@/components/BookingModal';
import { PlayersModal } from '@/components/PlayersModal';
import { ReleaseModal } from '@/components/ReleaseModal';
import { RulesModal } from '@/components/RulesModal';

import { DEFAULT_PLAYERS } from '@/lib/constants';

export default function HomePage() {
  // Inicializar con DEFAULT_PLAYERS para evitar parpadeos en blanco al cargar
  const [players, setPlayers] = useState<Player[]>(DEFAULT_PLAYERS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [supabaseActive, setSupabaseActive] = useState<boolean>(false);
  const [tablesMissingNotice, setTablesMissingNotice] = useState<boolean>(false);

  // Modals state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingInitialMode, setBookingInitialMode] = useState<'now' | 'scheduled'>('now');
  const [isPlayersOpen, setIsPlayersOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isReleaseOpen, setIsReleaseOpen] = useState(false);
  const [selectedBookingForRelease, setSelectedBookingForRelease] = useState<Booking | null>(null);

  // Slot pre-selected from clicking on the calendar
  const [preSelectedSlot, setPreSelectedSlot] = useState<{ date: Date; hour: number } | null>(null);

  // Load initial data
  const loadData = async () => {
    try {
      // 1. Sincronizar credenciales con el servidor (por si Vercel las tiene en runtime)
      try {
        const res = await fetch('/api/config', { cache: 'no-store' });
        if (res.ok) {
          const cfg = await res.json();
          if (cfg.isConfigured && cfg.url && cfg.key) {
            setRuntimeConfig(cfg.url, cfg.key);
          }
          if (cfg.isConfigured && cfg.tablesReady === false) {
            setTablesMissingNotice(true);
          } else {
            setTablesMissingNotice(false);
          }
        }
      } catch (e) {
        console.warn('Verificando configuración local...');
      }

      setSupabaseActive(isSupabaseConfigured());

      const [loadedPlayers, loadedBookings] = await Promise.all([
        getPlayers(),
        getBookings(),
      ]);
      setPlayers(loadedPlayers);
      setBookings(loadedBookings);
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
    setBookingInitialMode('scheduled');
    setIsBookingOpen(true);
  };

  // Handler: Guardar reserva
  const handleSaveBooking = async (bookingData: {
    player_id: string;
    game_title?: string;
    start_time: string;
    end_time: string;
    is_open_ended?: boolean;
    notes?: string;
  }) => {
    const res = await createBooking(bookingData);
    if (res.success) {
      await loadData();
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  // Handler: Quick Play / Reservar ahora mismo
  const handleOpenBookingNow = () => {
    if (players.length === 0) {
      setIsPlayersOpen(true);
      return;
    }
    setPreSelectedSlot(null);
    setBookingInitialMode('now');
    setIsBookingOpen(true);
  };

  // Handler: Programar para después
  const handleOpenBookingScheduled = () => {
    setPreSelectedSlot(null);
    setBookingInitialMode('scheduled');
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
    <div className="min-h-screen flex flex-col bg-[#0b0c11] text-[#ededf0]">
      {/* Header minimalista con botones directos: Jugar Ya y Programar */}
      <SwitchHeader
        onOpenBookingNow={handleOpenBookingNow}
        onOpenBookingScheduled={handleOpenBookingScheduled}
        onOpenPlayers={() => setIsPlayersOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        playersCount={players.length}
      />

      {/* Contenido Principal enfocado en el Calendario */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 space-y-3.5">
        {/* Aviso si falta ejecutar schema.sql en Supabase */}
        {tablesMissingNotice && (
          <div className="bg-amber-950/40 border border-amber-500/40 p-3.5 rounded-xl text-xs text-amber-200 flex items-start gap-2.5 shadow-md animate-in fade-in duration-200">
            <span className="text-base">⚠️</span>
            <div className="leading-relaxed">
              <strong>Paso final en Supabase:</strong> Estás conectado, pero aún no has ejecutado el script de tablas.
              Ve a tu panel de Supabase ➔ <strong>SQL Editor</strong>, pega el código de <code className="bg-black/50 px-1.5 py-0.5 rounded text-amber-300">schema.sql</code> y presiona <strong>RUN</strong>.
            </div>
          </div>
        )}

        {/* Barra de Estado en Vivo (con soporte para turnos sin límite fijo) */}
        <LiveStatusStrip
          bookings={bookings}
          players={players}
          onQuickPlay={handleOpenBookingNow}
          onRequestRelease={handleRequestRelease}
        />

        {/* El Calendario como protagonista principal */}
        <section className="w-full">
          <CalendarView
            bookings={bookings}
            players={players}
            onSelectSlot={handleSelectSlot}
            onCancelBooking={handleCancelBooking}
          />
        </section>
      </main>

      {/* Footer discreto con estado de sincronización */}
      <footer className="border-t border-[#1b1c26] bg-[#0e0f16] py-3 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-gray-400">SwitchHorario</span>
            <span>•</span>
            <span>Turnos de Nintendo Switch</span>
          </div>

          <div className="flex items-center space-x-2 text-[11px]">
            <span
              className={`w-2 h-2 rounded-full ${
                loading
                  ? 'bg-amber-400 animate-pulse'
                  : supabaseActive
                  ? 'bg-[#10E364]'
                  : 'bg-[#00C3E3]'
              }`}
            />
            <span className="text-gray-400">
              {loading
                ? 'Sincronizando...'
                : supabaseActive
                ? 'Conectado a Supabase'
                : 'Modo Local (localStorage)'}
            </span>
          </div>
        </div>
      </footer>

      {/* Modal de Reserva con modo Ahora Mismo y duración flexible */}
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
        initialMode={bookingInitialMode}
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
