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
    let playersFound = 0;

    if (isConfigured) {
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const { data, error, status } = await supabase
            .from('players')
            .select('id, name')
            .limit(5);

          if (error) {
            tableError = `${error.message} (Código: ${error.code || status || 'N/A'})`;
          } else {
            tablesReady = true;
            playersFound = data ? data.length : 0;
          }
        } catch (err: any) {
          tableError = `Error de red al conectar a Supabase: ${err.message}`;
        }
      }
    }

    return NextResponse.json({
      isConfigured,
      tablesReady,
      tableError,
      playersFound,
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
