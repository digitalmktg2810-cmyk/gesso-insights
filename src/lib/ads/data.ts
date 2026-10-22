import { queryOptions } from '@tanstack/react-query';
import { dateKey, makeExample, parseSheet, REFRESH_INTERVAL, type AdRow } from './metrics';

export type AdsData = { rows: AdRow[]; skipped: number[]; example: boolean; stale: boolean; updatedAt: string };
const CACHE_KEY = 'jm-ads-csv';

function readCache(): string | null {
  try { return typeof window === 'undefined' ? null : window.localStorage.getItem(CACHE_KEY); } catch { return null; }
}
function writeCache(text: string) {
  try { if (typeof window !== 'undefined') window.localStorage.setItem(CACHE_KEY, text); } catch { /* sem espaço ou modo privado */ }
}

export const adsQueryOptions = queryOptions({
  queryKey: ['ads-csv'],
  queryFn: async ({ signal }): Promise<AdsData> => {
    const url = import.meta.env['VITE_DATA_CSV_URL']?.trim();
    const now = new Date();
    if (!url) return { rows: makeExample(dateKey(now)), skipped: [], example: true, stale: false, updatedAt: now.toISOString() };
    try {
      const response = await fetch(url, { signal, cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      const { rows, skipped } = parseSheet(text);
      writeCache(text);
      return { rows, skipped, example: false, stale: false, updatedAt: new Date().toISOString() };
    } catch (error) {
      const cached = readCache();
      if (cached && !signal?.aborted) {
        const { rows, skipped } = parseSheet(cached);
        return { rows, skipped, example: false, stale: true, updatedAt: new Date().toISOString() };
      }
      throw error instanceof Error ? error : new Error('Falha ao buscar os números');
    }
  },
  staleTime: 0,
  refetchOnMount: 'always',
  refetchOnWindowFocus: true,
  refetchInterval: REFRESH_INTERVAL,
  retry: 1,
});
