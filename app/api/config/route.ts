import { NextResponse } from 'next/server';
import { getSupabaseUrl, getSupabaseAnonKey, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const isConfigured = isSupabaseConfigured();
    const url = getSupabaseUrl();
    const key = getSupabaseAnonKey();

    return NextResponse.json({
      isConfigured,
      url: isConfigured ? url : null,
      key: isConfigured ? key : null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { isConfigured: false, error: error.message },
      { status: 500 }
    );
  }
}
