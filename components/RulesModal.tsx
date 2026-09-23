'use client';

import React from 'react';
import { HOUSE_RULES } from '@/lib/constants';
import { X, ShieldCheck, HeartHandshake, Zap, Sparkles } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#171824] border border-[#2e3146] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
        <div className="p-5 border-b border-[#292c3f] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Reglas de Convivencia</h3>
              <p className="text-xs text-gray-400">Pacto de honor entre primos para la Switch</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#252839]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <div className="grid gap-3">
            {HOUSE_RULES.map((rule, idx) => (
              <div
                key={rule.id}
                className="p-4 rounded-xl bg-[#1b1c28] border border-[#2c2f42] flex items-start space-x-3.5"
              >
                <div className="w-9 h-9 rounded-xl bg-[#252839] flex items-center justify-center text-lg flex-shrink-0">
                  {rule.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">
                    {idx + 1}. {rule.title}
                  </h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {rule.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#FF3C28]/15 to-[#00C3E3]/15 border border-white/10 text-xs text-center text-gray-200">
            🎮 <strong>¡A jugar y pasarla bien!</strong> La Switch es para compartir y divertirse juntos.
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#00C3E3] hover:bg-[#0faec7] transition-all shadow-md"
            >
              ¡Entendido y Aceptado!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
