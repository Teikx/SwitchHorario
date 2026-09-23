'use client';

import React, { useState } from 'react';
import { Booking } from '@/lib/types';
import { getAvatarMeta, formatFriendlyTime } from '@/lib/booking-utils';
import { X, Sparkles, Check, HeartHandshake, LogOut } from 'lucide-react';

interface ReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onConfirmRelease: (bookingId: string) => Promise<boolean>;
}

export const ReleaseModal: React.FC<ReleaseModalProps> = ({
  isOpen,
  onClose,
  booking,
  onConfirmRelease,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !booking) return null;

  const avatar = getAvatarMeta(booking.player?.avatar || 'mario');

  const handleConfirm = async () => {
    setIsSubmitting(true);
    const success = await onConfirmRelease(booking.id);
    setIsSubmitting(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#171824] border border-[#2e3146] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-5 border-b border-[#292c3f] flex items-center justify-between">
          <div className="flex items-center space-x-2 text-white">
            <HeartHandshake className="w-5 h-5 text-[#10E364]" />
            <h3 className="text-base font-black">Liberar Consola Temprano</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#252839]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 text-center space-y-4">
          <div
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg border border-white/20"
            style={{ backgroundColor: booking.player?.color || '#FF3C28' }}
          >
            {avatar.emoji}
          </div>

          <div>
            <h4 className="text-lg font-black text-white">
              ¿{booking.player?.name}, ya terminaste de jugar?
            </h4>
            <p className="text-xs text-gray-400 mt-1">
              Estás jugando <strong>{booking.game_title}</strong> (programado hasta las{' '}
              {formatFriendlyTime(booking.end_time)}).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#14151f] border border-[#27293b] text-xs text-gray-300">
            🌟 Al liberar la consola ahora, el tiempo restante quedará marcado como disponible
            de inmediato en el calendario para que otro primo pueda empezar a jugar.
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-[#222435]"
            >
              Seguir jugando
            </button>
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#10E364] to-[#0ea848] hover:from-[#1bf26e] hover:to-[#10c456] shadow-lg glow-green transition-all"
            >
              {isSubmitting ? 'Liberando...' : '¡Sí, liberar Switch!'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
