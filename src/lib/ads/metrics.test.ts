import { describe, expect, it } from 'vitest';
import { latestDay, weekSummaries, CAMPAIGN_START, campaignWeek, currency, makeExample, parseCSV, parseSheet, planWeek, plural, previousWeekRows, REFRESH_INTERVAL, sumRows, weekBudget, WEEKLY_TARGET, weekRows, weekStart } from './metrics';

describe('Regras do painel', () => {
  it('fixa a meta semanal em R$ 125,00', () => expect(WEEKLY_TARGET).toBe(125));
  it('usa R$ 150 a partir da semana 3', () => { expect(weekBudget(2)).toBe(125); expect(weekBudget(3)).toBe(150); expect(weekBudget(8)).toBe(150); });
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
  it('ignora linhas inválidas sem derrubar o painel', () => {
    const sheet = parseSheet('data,origem,gasto,cliques,conversas,campanha\n2026-02-31,meta,5,2,1,A\n2026-10-16,tiktok,1,1,1,B\n2026-10-16,meta,abc,1,1,C\n2026-10-16,meta,14.33,13,5,OK');
    expect(sheet.rows).toHaveLength(1);
    expect(sheet.skipped).toEqual([2, 3, 4]);
  });
  it('aceita variações comuns da planilha manual', () => {
    const rows = parseCSV('data,origem,gasto,cliques,conversas,campanha\n5/10/2026,Meta Ads,"1.234,56",,-,A\n2026-10-16 00:00:00,Instagram,R$ 2,"",0,B\n16/10/2026,Google Ads,"1,234.50",3,1,C\n17/10/2026,google,4.11,2,0,');
    expect(rows.map(r => [r.data, r.origem, r.gasto, r.cliques, r.conversas])).toEqual([
      ['2026-10-05', 'meta', 1234.56, 0, 0],
      ['2026-10-16', 'meta', 2, 0, 0],
      ['2026-10-16', 'google', 1234.5, 3, 1],
      ['2026-10-17', 'google', 4.11, 2, 0],
    ]);
    expect(rows[3]?.campanha).toBe('Sem nome');
  });
  it('vale a última linha para a mesma data, origem e campanha', () => {
    const rows = parseCSV('data,origem,gasto,cliques,conversas,campanha\n2026-10-16,meta,4.10,3,1,A\n2026-10-16,meta,14.33,13,5,A\n2026-10-16,meta,5,1,1,B\n2026-10-16,google,3,1,0,G');
    expect(sumRows(rows).gasto).toBe(22.33);
    expect(rows.find(r => r.campanha === 'A')?.conversas).toBe(5);
  });
  it('resume as semanas do plano e o último dia com dados', () => {
    const rows = parseCSV('data,origem,gasto,cliques,conversas,campanha\n2026-10-15,meta,10,1,1,A\n2026-10-21,google,5,1,0,G\n2026-10-22,meta,3,1,1,A');
    const weeks = weekSummaries(rows, '2026-10-22');
    expect(weeks.map(w => [w.n, w.totals.gasto, w.current])).toEqual([[1, 15, false], [2, 3, true]]);
    expect(weeks[0]?.google.gasto).toBe(5);
    expect(latestDay(rows, '2026-10-21')).toBe('2026-10-21');
  });
  it('entende milhar com ponto e recusa contagem quebrada', () => {
    const sheet = parseSheet('data,origem,gasto,cliques,conversas,campanha\n2026-10-16,meta,1.234,1.234,0,A\n2026-10-16,meta,14,5,1,B\n2026-10-16,meta,"14,5",2.5,1,C');
    expect(sheet.rows.map(r => [r.gasto, r.cliques])).toEqual([[1234, 1234], [14, 5]]);
    expect(sheet.skipped).toEqual([4]);
  });
  it('numera certo a linha ignorada mesmo com linhas vazias no meio', () => {
    const sheet = parseSheet('data,origem,gasto,cliques,conversas,campanha\n2026-10-16,meta,1,1,1,A\n\n,,,,,\n2026-10-16,tiktok,1,1,1,B');
    expect(sheet.skipped).toEqual([5]);
  });
  it('compara com os mesmos dias da semana anterior', () => {
    const rows = parseCSV('data,origem,gasto,cliques,conversas,campanha\n2026-10-15,meta,10,1,1,A\n2026-10-17,meta,5,1,1,A\n2026-10-19,meta,7,1,1,A\n2026-10-22,meta,3,1,1,A');
    expect(sumRows(previousWeekRows(rows, '2026-10-24')).gasto).toBe(15);
  });
  it('escreve singular e plural', () => {
    expect(plural(1, 'conversa', 'conversas')).toBe('1 conversa');
    expect(plural(3, 'conversa', 'conversas')).toBe('3 conversas');
  });
  it('conta semanas desde 15/10/2026 com limite de oito', () => {
    expect(campaignWeek('2026-10-15')).toBe(1);
    expect(campaignWeek('2026-10-21')).toBe(1);
    expect(campaignWeek('2026-10-22')).toBe(2);
    expect(campaignWeek('2027-10-21')).toBe(8);
    expect(planWeek('2026-12-10')).toBe(9);
  });
});
