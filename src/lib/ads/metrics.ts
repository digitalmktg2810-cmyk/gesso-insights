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
export const PLAN_WEEKS = 8;
export const PLAN_TOTAL = WEEKLY_TARGET * PLAN_WEEKS;
/** Número da semana do plano (1 = 15/10 a 21/10). Pode passar de 8 depois do fim do plano. */
export function planWeek(today: string) {
  return Math.max(1, Math.floor(dayDiff(CAMPAIGN_START, today) / 7) + 1);
}
export function campaignWeek(today: string) {
  return Math.min(PLAN_WEEKS, planWeek(today));
}
/** Linhas do plano inteiro até hoje (a partir de 15/10). */
export function planRows(rows: AdRow[], today: string) {
  const end = shiftDay(CAMPAIGN_START, PLAN_WEEKS * 7 - 1);
  return rows.filter(row => row.data >= CAMPAIGN_START && row.data <= today && row.data <= end);
}
/** Último dia da semana atual que já tem dados (ou null). */
export function lastDataDay(rows: AdRow[], today: string) {
  return weekRows(rows, today).reduce<string | null>((last, row) => (last === null || row.data > last ? row.data : last), null);
}
/** Mesmo trecho da semana anterior (ex.: quinta a domingo da semana passada), para comparar de forma justa.
 *  Use como `upTo` o último dia que já tem dados, para não comparar um dia vazio com um dia completo. */
export function previousWeekRows(rows: AdRow[], upTo: string) {
  const start = shiftDay(weekStart(upTo), -7);
  const end = shiftDay(upTo, -7);
  return rows.filter(row => row.data >= start && row.data <= end);
}
export const plural = (n: number, one: string, many: string) => `${integer(n)} ${n === 1 ? one : many}`;

function normalizeDate(value: string) {
  const v = value.trim().split(/[ T]/)[0] ?? '';
  let key: string | null = null;
  const br = v.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  const iso = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (br) key = `${br[3]}-${br[2]!.padStart(2, '0')}-${br[1]!.padStart(2, '0')}`;
  else if (iso) key = `${iso[1]}-${iso[2]!.padStart(2, '0')}-${iso[3]!.padStart(2, '0')}`;
  if (!key) return null;
  const parsed = new Date(`${key}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === key ? key : null;
}
/** Aceita 14,33 · 14.33 · 1.234,56 · 1,234.56 · R$ 14,33. Vazio ou "-" vale 0. */
function number(value: string) {
  const cleaned = value.replace(/R\$|\s/g, '');
  if (cleaned === '' || cleaned === '-' || cleaned === '—') return 0;
  if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) return Number(cleaned.replace(/\./g, '')); // 1.234 = mil duzentos e trinta e quatro
  if (/^\d{1,3}(,\d{3})+$/.test(cleaned)) return Number(cleaned.replace(/,/g, ''));
  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  if (lastComma > lastDot) return Number(cleaned.replace(/\./g, '').replace(',', '.'));
  if (lastDot > lastComma && lastComma >= 0) return Number(cleaned.replace(/,/g, ''));
  return Number(cleaned);
}
function origin(value: string): AdRow['origem'] | null {
  const v = value.toLowerCase();
  if (v.includes('google')) return 'google';
  if (/meta|facebook|instagram|^fb$|^ig$/.test(v)) return 'meta';
  return null;
}
export type ParsedSheet = { rows: AdRow[]; skipped: number[] };
/** Lê a planilha. Linhas com problema são ignoradas (e listadas em `skipped`, pelo número da linha) em vez de derrubar o painel.
 *  Só linhas exatamente iguais (todos os campos) contam uma vez, para não somar um export colado duas vezes. */
export function parseSheet(csv: string): ParsedSheet {
  const parsed = Papa.parse<Record<string, string>>(csv, { header: true, skipEmptyLines: false, transformHeader: header => header.replace(/^\uFEFF/, '').trim().toLowerCase(), transform: value => value.trim() });
  if (parsed.meta.fields?.includes('campanhas') && !parsed.meta.fields.includes('campanha')) parsed.data.forEach(row => { row['campanha'] = row['campanhas'] ?? ''; });
  const fields = [...(parsed.meta.fields ?? []), 'campanha'];
  const required = ['data', 'origem', 'gasto', 'cliques', 'conversas'];
  if (!required.every(field => fields.includes(field))) throw new Error('A planilha precisa das colunas data, origem, gasto, cliques, conversas e campanha.');
  const badRows = new Set(parsed.errors.map(error => error.row).filter((row): row is number => typeof row === 'number'));
  const skipped: number[] = [];
  const seen = new Set<string>();
  const rows: AdRow[] = [];
  parsed.data.forEach((row, index) => {
    const line = index + 2;
    if (Object.values(row).every(value => !value)) return;
    const data = normalizeDate(row['data'] ?? '');
    const origem = origin(row['origem'] ?? '');
    const gasto = number(row['gasto'] ?? '');
    const cliques = number(row['cliques'] ?? '');
    const conversas = number(row['conversas'] ?? '');
    if (badRows.has(index) || !data || !origem || [gasto, cliques, conversas].some(n => !Number.isFinite(n) || n < 0) || !Number.isInteger(cliques) || !Number.isInteger(conversas)) {
      skipped.push(line);
      return;
    }
    const campanha = row['campanha'] || 'Sem nome';
    const key = [data, origem, gasto, cliques, conversas, campanha].join('|');
    if (seen.has(key)) return;
    seen.add(key);
    rows.push({ data, origem, gasto, cliques, conversas, campanha });
  });
  return { rows, skipped };
}
export function parseCSV(csv: string): AdRow[] {
  return parseSheet(csv).rows;
}
export function makeExample(today: string): AdRow[] {
  const start = today < CAMPAIGN_START ? weekStart(today) : CAMPAIGN_START;
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
