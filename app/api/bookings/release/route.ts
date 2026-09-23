import { NextResponse } from 'next/server';
import { releaseBookingEarly } from '@/lib/storage';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID de reserva requerido' }, { status: 400 });
    }

    const success = await releaseBookingEarly(id);
    if (!success) {
      return NextResponse.json({ error: 'No se pudo liberar el turno' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Consola liberada exitosamente' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al liberar turno' }, { status: 500 });
  }
}
