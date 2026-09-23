'use client';

import React, { useState } from 'react';
import { Player, Booking } from '@/lib/types';
import { AVATAR_OPTIONS, PLAYER_COLORS } from '@/lib/constants';
import { getAvatarMeta } from '@/lib/booking-utils';
import { X, UserPlus, Users, Trophy, Sparkles, Check } from 'lucide-react';
import { parseISO, differenceInMinutes } from 'date-fns';

interface PlayersModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  bookings: Booking[];
  onAddPlayer: (playerData: {
    name: string;
    avatar: string;
    color: string;
    pin_hash?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

export const PlayersModal: React.FC<PlayersModalProps> = ({
  isOpen,
  onClose,
  players,
  bookings,
  onAddPlayer,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('mario');
  const [color, setColor] = useState('#FF3C28');
  const [pin, setPin] = useState('1234');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calcular horas jugadas / reservadas por cada primo
  const getPlayerHours = (playerId: string) => {
    const playerBookings = bookings.filter(
      b => b.player_id === playerId && b.status !== 'cancelled'
    );
    const totalMinutes = playerBookings.reduce((acc, b) => {
      const s = parseISO(b.start_time);
      const e = parseISO(b.end_time);
      return acc + Math.max(0, differenceInMinutes(e, s));
    }, 0);

    return (totalMinutes / 60).toFixed(1);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor escribe el nombre del primo.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const res = await onAddPlayer({
      name: name.trim(),
      avatar,
      color,
      pin_hash: pin || '1234',
    });

    setIsSubmitting(false);

    if (res.success) {
      setName('');
      setIsAdding(false);
    } else {
      setError(res.error || 'Error al agregar primo');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#171824] border border-[#2e3146] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
        {/* Header */}
        <div className="p-5 border-b border-[#292c3f] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#232638] text-[#00C3E3]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Comunidad de Primos</h3>
              <p className="text-xs text-gray-400">Jugadores registrados para la Switch</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#252839] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* TABLA / LISTA DE PRIMOS */}
          {!isAdding && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Primos activos ({players.length})
                </span>
                <button
                  onClick={() => setIsAdding(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#00C3E3] hover:bg-[#0eb1cd] flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Agregar Primo</span>
                </button>
              </div>

              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {players.map(p => {
                  const avatarMeta = getAvatarMeta(p.avatar);
                  const hours = getPlayerHours(p.id);

                  return (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-[#1b1c28] border border-[#2b2e40] flex items-center justify-between hover:bg-[#212333] transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner border border-white/20"
                          style={{ backgroundColor: p.color }}
                        >
                          {avatarMeta.emoji}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                            {p.name}
                            <span className="text-[10px] text-gray-400 font-normal">
                              ({avatarMeta.name})
                            </span>
                          </h4>
                          <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <span
                              className="w-2 h-2 rounded-full inline-block"
                              style={{ backgroundColor: p.color }}
                            />
                            Color personalizado
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-gray-400 block">Horas totales:</span>
                        <span className="text-sm font-mono font-bold text-[#00C3E3]">
                          {hours}h
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* FORMULARIO AGREGAR NUEVO PRIMO */}
          {isAdding && (
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#2b2e40]">
                <h4 className="text-sm font-bold text-white">Nuevo Primo / Jugador</h4>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Volver a la lista
                </button>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Nombre del Primo:
                </label>
                <input
                  type="text"
                  placeholder="Ej: Daniel, Valeria..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#202233] border border-[#2f3248] text-sm text-white focus:outline-none focus:border-[#00C3E3]"
                  maxLength={25}
                  required
                />
              </div>

              {/* Selector de Avatar */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-2">
                  Elige un Personaje de Nintendo:
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {AVATAR_OPTIONS.map(opt => {
                    const isSelected = avatar === opt.id;
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => {
                          setAvatar(opt.id);
                          setColor(opt.bgColor); // auto sincronizar color sugerido
                        }}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                          isSelected
                            ? 'border-white bg-[#282a3d] scale-105 shadow-md ring-2 ring-[#00C3E3]'
                            : 'border-[#2c2f42] bg-[#1a1b28] hover:bg-[#222435]'
                        }`}
                      >
                        <span className="text-xl">{opt.emoji}</span>
                        <span className="text-[10px] text-gray-300 font-medium mt-1 truncate">
                          {opt.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selector de Color */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-2">
                  Color Joy-Con / Tema:
                </label>
                <div className="flex flex-wrap gap-2">
                  {PLAYER_COLORS.map(c => {
                    const isSelected = color === c.hex;
                    return (
                      <button
                        type="button"
                        key={c.hex}
                        onClick={() => setColor(c.hex)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-transform ${
                          isSelected ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PIN opcional */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  PIN de 4 dígitos (para proteger tus turnos):
                </label>
                <input
                  type="password"
                  value={pin}
                  onChange={e => setPin(e.target.value.slice(0, 4))}
                  placeholder="1234"
                  className="w-32 px-3 py-2 rounded-xl bg-[#202233] border border-[#2f3248] text-sm text-white font-mono text-center tracking-widest focus:outline-none focus:border-[#00C3E3]"
                  maxLength={4}
                />
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/50 text-xs text-red-300">
                  {error}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-[#202233]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#00C3E3] hover:bg-[#0faec7] transition-all shadow-md"
                >
                  {isSubmitting ? 'Guardando...' : 'Crear Primo'}
                </button>
              </div>
            </form>
          )}

          {/* Footer botón cerrar */}
          {!isAdding && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#2c2f42] hover:bg-[#383c54] transition-colors"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
