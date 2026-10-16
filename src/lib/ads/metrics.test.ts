import { describe, expect, it } from 'vitest';
import { CAMPAIGN_START, campaignWeek, currency, makeExample, parseCSV, REFRESH_INTERVAL, sumRows, WEEKLY_TARGET, weekRows, weekStart } from './metrics';

describe('Regras do painel', () => {
  it('fixa a meta semanal em R$ 125,00', () => expect(WEEKLY_TARGET).toBe(125));
  it('atualiza a cada cinco minutos', () => expect(REFRESH_INTERVAL).toBe(300000));
  it('formata reais com vírgula', () => expect(currency(87.5).replace(/\s/g, ' ')).toBe('R$ 87,50'));
  it('lê CSV brasileiro com valores decimais e campanha entre aspas', () => {
    const rows = parseCSV('data;origem;gasto;cliques;conversas;campanha\n14/10/2026;meta;5,80;24;4;"Gesso; WhatsApp"\n2026-10-14;google;3,60;14;3;Pesquisa');
    expect(rows[0]?.campanha).toBe('Gesso; WhatsApp');
    expect(sumRows(rows)).toEqual({ gasto: 9.4, cliques: 38, conversas: 7, custo: 9.4 / 7 });
  });
  it('calcula a semana de quinta a quarta e exclui dias futuros', () => {
    expect(CAMPAIGN_START).toBe('2026-10-15');
    expect(weekStart('2026-10-15')).toBe('2026-10-15');
    expect(weekStart('2026-10-21')).toBe('2026-10-15');
    expect(weekStart('2026-10-22')).toBe('2026-10-22');
    expect(weekStart('2026-10-12')).toBe('2026-10-08');
    const rows = makeExample('2026-10-18');
    expect(rows.every(row => row.data >= '2026-10-15' && row.data <= '2026-10-18')).toBe(true);
    expect(weekRows(rows, '2026-10-17').every(row => row.data <= '2026-10-17')).toBe(true);
  });
  it('mantém os exemplos dentro da meta semanal e com custo realista', () => {
    const totals = sumRows(weekRows(makeExample('2026-10-21'), '2026-10-21'));
    expect(totals.gasto).toBeLessThanOrEqual(WEEKLY_TARGET);
    expect(totals.custo).toBeGreaterThan(8);
    expect(totals.custo).toBeLessThan(25);
  });
  it('não divide por zero sem conversas', () => expect(sumRows([]).custo).toBeNull());
  it('rejeita datas e contagens inválidas', () => expect(() => parseCSV('data,origem,gasto,cliques,conversas,campanha\n2026-02-31,meta,5,2,1,A')).toThrow());
  it('conta semanas desde 15/10/2026 com limite de oito', () => {
    expect(campaignWeek('2026-10-15')).toBe(1);
    expect(campaignWeek('2026-10-21')).toBe(1);
    expect(campaignWeek('2026-10-22')).toBe(2);
    expect(campaignWeek('2027-10-21')).toBe(8);
  });
});
