import { NextResponse } from 'next/server';
import { getSupabaseUrl, getSupabaseAnonKey, isSupabaseConfigured, getSupabaseClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const isConfigured = isSupabaseConfigured();
    const url = getSupabaseUrl();
    const key = getSupabaseAnonKey();

    let tablesReady = false;
    let tableError: string | null = null;

    if (isConfigured) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.from('players').select('id').limit(1);
        if (error) {
          tableError = error.message;
        } else {
          tablesReady = true;
        }
      }
    }

    return NextResponse.json({
      isConfigured,
      tablesReady,
      tableError,
      url: isConfigured ? url : null,
      key: isConfigured ? key : null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { isConfigured: false, tablesReady: false, error: error.message },
      { status: 500 }
    );
  }
}
