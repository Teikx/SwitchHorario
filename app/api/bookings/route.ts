import { NextResponse } from 'next/server';
import { getBookings, createBooking, cancelBooking } from '@/lib/storage';

export async function GET() {
  try {
    const bookings = await getBookings();
    return NextResponse.json(bookings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al obtener reservas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { player_id, game_title, start_time, end_time, notes } = body;

    if (!player_id || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios (player_id, start_time, end_time)' },
        { status: 400 }
      );
    }

    const result = await createBooking({
      player_id,
      game_title: game_title || 'Cualquiera',
      start_time,
      end_time,
      notes: notes || '',
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json(result.booking, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al procesar reserva' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de reserva requerido' }, { status: 400 });
    }

    const success = await cancelBooking(id);
    if (!success) {
      return NextResponse.json({ error: 'No se pudo cancelar la reserva' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Reserva cancelada' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al cancelar reserva' }, { status: 500 });
  }
}
