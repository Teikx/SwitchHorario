import { NextResponse } from 'next/server';
import { getPlayers, addPlayer } from '@/lib/storage';

export async function GET() {
  try {
    const players = await getPlayers();
    return NextResponse.json(players);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al obtener jugadores' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.avatar || !body.color) {
      return NextResponse.json({ error: 'Nombre, avatar y color son requeridos' }, { status: 400 });
    }

    const player = await addPlayer({
      name: body.name.trim(),
      avatar: body.avatar,
      color: body.color,
      pin_hash: body.pin_hash || '1234',
    });

    return NextResponse.json(player, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al guardar jugador' }, { status: 500 });
  }
}
