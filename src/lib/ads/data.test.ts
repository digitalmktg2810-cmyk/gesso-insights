import { QueryClient } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { adsQueryOptions } from './data';

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('Fonte pública do painel', () => {
  it('usa dados ilustrativos somente quando a URL não existe', async () => {
    vi.stubEnv('VITE_DATA_CSV_URL', '');
    const client = new QueryClient();
    const result = await client.fetchQuery({ ...adsQueryOptions, retry: false });
    expect(result.example).toBe(true);
    expect(result.rows.length).toBeGreaterThan(0);
    client.clear();
  });
  it('busca o CSV configurado sem substituir erros por exemplos', async () => {
    vi.stubEnv('VITE_DATA_CSV_URL', 'https://example.com/ads.csv');
    const fetchMock = vi.fn().mockResolvedValue(new Response('data,origem,gasto,cliques,conversas,campanha\n2026-10-14,meta,9.40,38,7,Gesso'));
    vi.stubGlobal('fetch', fetchMock);
    const client = new QueryClient();
    const options = { ...adsQueryOptions, retry: false as const };
    const result = await client.fetchQuery(options);
    expect(fetchMock.mock.calls[0]?.[0]).toBe('https://example.com/ads.csv');
    expect(result.example).toBe(false);
    expect(result.rows[0]?.gasto).toBe(9.4);
    fetchMock.mockRejectedValueOnce(new Error('Falha de conexão'));
    const offline = await client.fetchQuery({ ...options, staleTime: 0 });
    expect(offline.stale).toBe(true);
    expect(offline.rows[0]?.gasto).toBe(9.4);
    window.localStorage.clear();
    fetchMock.mockRejectedValueOnce(new Error('Falha de conexão'));
    await expect(client.fetchQuery(options)).rejects.toThrow('Falha de conexão');
    client.clear();
  });
});
