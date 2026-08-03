import { supabase } from '../supabase';
import { DEFAULT_REPORT_SETTINGS } from './defaults';
import type { ReportSettings } from './types';

function coerceSettings(row: Partial<ReportSettings> | null | undefined): ReportSettings {
  return {
    ...DEFAULT_REPORT_SETTINGS,
    ...(row || {}),
  };
}

/** Loads member report settings; falls back to defaults when missing or unavailable. */
export async function loadReportSettings(userId: string): Promise<ReportSettings> {
  try {
    const { data, error } = await supabase
      .from('report_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return { ...DEFAULT_REPORT_SETTINGS };
    return coerceSettings(data as Partial<ReportSettings>);
  } catch {
    return { ...DEFAULT_REPORT_SETTINGS };
  }
}
