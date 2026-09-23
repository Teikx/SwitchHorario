import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SwitchHorario 🎮 | Control de Turnos Nintendo Switch',
  description: 'Sistema interactivo para gestionar los turnos y horarios de la Nintendo Switch entre primos.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-[#0e0f14] text-[#ececf1] antialiased selection:bg-[#ff3c28]/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
