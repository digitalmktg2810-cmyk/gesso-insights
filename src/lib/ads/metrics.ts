import Papa from 'papaparse';

export const WEEKLY_TARGET = 125;
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
export function weekStart(key: string) {
  const day = new Date(`${key}T12:00:00Z`).getUTCDay();
  return shiftDay(key, -((day + 6) % 7));
}
export function weekRows(rows: AdRow[], today: string) {
  const start = weekStart(today);
  return rows.filter(row => row['data'] >= start && row['data'] <= today);
}
export function sumRows(rows: AdRow[]): Totals {
  const sums = rows.reduce((acc, row) => ({ gasto: acc.gasto + row['gasto'], cliques: acc.cliques + row['cliques'], conversas: acc.conversas + row['conversas'] }), { gasto: 0, cliques: 0, conversas: 0 });
  return { ...sums, gasto: Math.round(sums.gasto * 100) / 100, custo: sums.conversas ? sums.gasto / sums.conversas : null };
}
export function campaignWeek(rows: AdRow[], today: string) {
  const first = rows.map(row => row['data']).filter(day => day <= today).sort()[0];
  if (!first) return 1;
  return Math.min(8, Math.max(1, Math.floor((Date.parse(`${weekStart(today)}T12:00:00Z`) - Date.parse(`${weekStart(first)}T12:00:00Z`)) / 604800000) + 1));
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
  const days = Math.round((Date.parse(`${today}T12:00:00Z`) - Date.parse(`${start}T12:00:00Z`)) / 86400000);
  for (let i = 0; i <= days; i++) {
    const current = i === days;
    const total = current ? 9.4 : Math.floor(7810 / Math.max(days, 1)) / 100 + (i === 0 ? (7810 % Math.max(days, 1)) / 100 : 0);
    const meta = current ? 5.8 : Math.round(total * 0.65 * 100) / 100;
    rows.push({ data: shiftDay(start, i), origem: 'meta', gasto: meta, cliques: current ? 24 : 78, conversas: current ? 4 : 11, campanha: 'Gesso e drywall · WhatsApp' }, { data: shiftDay(start, i), origem: 'google', gasto: Math.round((total - meta) * 100) / 100, cliques: current ? 14 : 42, conversas: current ? 3 : 6, campanha: 'Quem procura, encontra · Pesquisa' });
  }
  return rows;
}
