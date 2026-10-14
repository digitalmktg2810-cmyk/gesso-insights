import { queryOptions } from '@tanstack/react-query';
import { dateKey, makeExample, parseCSV, REFRESH_INTERVAL } from './metrics';

export const adsQueryOptions = queryOptions({
  queryKey: ['ads-csv'],
  queryFn: async ({ signal }) => {
    const url = import.meta.env['VITE_DATA_CSV_URL']?.trim();
    const now = new Date();
    if (!url) return { rows: makeExample(dateKey(now)), example: true, updatedAt: now.toISOString() };
    const response = await fetch(url, { signal, cache: 'no-store' });
    if (!response.ok) throw new Error('Não foi possível acessar a planilha. Verifique se o CSV está público.');
    const rows = parseCSV(await response.text());
    return { rows, example: false, updatedAt: new Date().toISOString() };
  },
  staleTime: 0,
  refetchOnMount: 'always',
  refetchOnWindowFocus: true,
  refetchInterval: REFRESH_INTERVAL,
  retry: 1,
});
