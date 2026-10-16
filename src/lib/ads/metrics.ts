import Papa from 'papaparse';

export const WEEKLY_TARGET = 125;
export const CAMPAIGN_START = '2026-10-15';
export const REFRESH_INTERVAL = 5 * 60 * 1000;
export type AdRow = { data: string; origem: 'meta' | 'google'; gasto: number; cliques: number; conversas: number; campanha: string };
export type Totals = { gasto: number; cliques: number; conversas: number; custo: number | null };
export const currency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
export const integer = (value: number) => new Intl.NumberFormat('pt-BR').format(value);
export function dateKey(date: Date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}
export function shiftDay(key: string, days: number) {
  const date = new Date(`${key}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
export function dayDiff(from: string, to: string) {
  return Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86400000);
}
// A semana da campanha começa na quinta-feira (15/10/2026) e termina na quarta.
export function weekStart(key: string) {
  const diff = dayDiff(CAMPAIGN_START, key);
  return shiftDay(key, -(((diff % 7) + 7) % 7));
}
export function weekRows(rows: AdRow[], today: string) {
  const start = weekStart(today);
  return rows.filter(row => row['data'] >= start && row['data'] <= today);
}
export function sumRows(rows: AdRow[]): Totals {
  const sums = rows.reduce((acc, row) => ({ gasto: acc.gasto + row['gasto'], cliques: acc.cliques + row['cliques'], conversas: acc.conversas + row['conversas'] }), { gasto: 0, cliques: 0, conversas: 0 });
  return { ...sums, gasto: Math.round(sums.gasto * 100) / 100, custo: sums.conversas ? sums.gasto / sums.conversas : null };
}
export function campaignWeek(today: string) {
  return Math.min(8, Math.max(1, Math.floor(dayDiff(CAMPAIGN_START, today) / 7) + 1));
}
function normalizeDate(value: string) {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const key = match ? `${match[3]}-${match[2]}-${match[1]}` : value;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
  const parsed = new Date(`${key}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === key ? key : null;
}
function number(value: string) {
  const cleaned = value.replace(/R\$|\s/g, '');
  return Number(cleaned.includes(',') ? cleaned.replace(/\./g, '').replace(',', '.') : cleaned);
}
export function parseCSV(csv: string): AdRow[] {
  const parsed = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: 'greedy', transformHeader: header => header.replace(/^\uFEFF/, '').trim().toLowerCase(), transform: value => value.trim() });
  const required = ['data', 'origem', 'gasto', 'cliques', 'conversas', 'campanha'];
  if (!required.every(field => parsed.meta.fields?.includes(field))) throw new Error('A planilha precisa das colunas data, origem, gasto, cliques, conversas e campanha.');
  if (parsed.errors.length) throw new Error('Não foi possível ler o CSV. Confira o formato da planilha.');
  return parsed.data.map((row, index) => {
    const data = normalizeDate(row['data'] ?? '');
    const origem = row['origem']?.toLowerCase();
    const gasto = number(row['gasto'] ?? '');
    const cliques = number(row['cliques'] ?? '');
    const conversas = number(row['conversas'] ?? '');
    if (!data || (origem !== 'meta' && origem !== 'google') || [gasto, cliques, conversas].some(n => !Number.isFinite(n) || n < 0) || !Number.isInteger(cliques) || !Number.isInteger(conversas) || !row['gasto'] || !row['cliques'] || !row['conversas']) throw new Error(`Confira os dados da linha ${index + 2} da planilha.`);
    return { data, origem, gasto, cliques, conversas, campanha: row['campanha'] || 'Sem nome' };
  });
}
export function makeExample(today: string): AdRow[] {
  const start = weekStart(today);
  const rows: AdRow[] = [];
  const days = dayDiff(start, today);
  for (let i = 0; i <= days; i++) {
    const current = i === days;
    const day = shiftDay(start, i);
    rows.push(
      { data: day, origem: 'meta', gasto: current ? 6.25 : 12.5, cliques: current ? 14 : 26 + (i % 3) * 4, conversas: current ? 1 : 1 + (i % 2), campanha: 'JM Gesso - WhatsApp' },
      { data: day, origem: 'google', gasto: current ? 2.65 : 5.35, cliques: current ? 3 : 6 + (i % 3), conversas: current ? 0 : i % 2, campanha: 'Gesso e Drywall · Pesquisa' },
    );
  }
  return rows;
}
