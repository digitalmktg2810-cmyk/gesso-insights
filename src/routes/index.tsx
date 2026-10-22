import { createFileRoute, useNavigate, useRouter, type ErrorComponentProps } from '@tanstack/react-router';
import { useQueryErrorResetBoundary, useSuspenseQuery } from '@tanstack/react-query';
import { ArrowDownRight, ArrowUpRight, CalendarDays, ChartNoAxesCombined, Clock, History, Info, Megaphone, MessageCircle, MousePointer2, RefreshCw, Target, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AreaMap } from '@/components/ads/area-map';
import { adsQueryOptions } from '@/lib/ads/data';
import { campaignWeek, currency, dateKey, integer, latestDay, PLAN_TOTAL, PLAN_WEEKS, planRows, planWeek, plural, previousWeekRows, shiftDay, sumRows, WEEKLY_TARGET, weekRows, weekStart, weekSummaries, type AdRow, type Totals, type WeekSummary } from '@/lib/ads/metrics';

type View = 'hoje' | 'historico' | 'anuncios';
export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): { aba: View } => ({ aba: search['aba'] === 'historico' || search['aba'] === 'semana' ? 'historico' : search['aba'] === 'anuncios' ? 'anuncios' : 'hoje' }),
  loader: async ({ context }) => { await context.queryClient.ensureQueryData(adsQueryOptions); },
  head: () => ({ meta: [
    { title: 'JM Gesso · Anúncios' },
    { name: 'description', content: 'Acompanhe investimentos, cliques e conversas no WhatsApp dos anúncios da JM Gesso no Instagram, Facebook e Google.' },
    { property: 'og:title', content: 'JM Gesso · Anúncios' },
    { property: 'og:description', content: 'Os resultados dos anúncios da JM Gesso, em um só lugar.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Dashboard,
  pendingComponent: () => <div className="error-screen"><p>Carregando seus resultados…</p></div>,
  notFoundComponent: () => <div className="error-screen">Página não encontrada.</div>,
  errorComponent: DashboardError,
});

function DashboardError({ error }: ErrorComponentProps) {
  const router = useRouter();
  const { reset } = useQueryErrorResetBoundary();
  return <div className="error-screen"><img src="/icons/jm-192.png" alt="JM Gesso" className="brand-icon" /><h1 className="mt-6">Os números não carregaram</h1><p>Não conseguimos buscar os números agora. Confira a internet e tente de novo em alguns minutos.</p><Button onClick={() => { reset(); void router.invalidate(); }}><RefreshCw /> Tentar novamente</Button></div>;
}

const WAITING = 'aguardando dados';
const shortDate = (key: string) => new Date(`${key}T12:00:00Z`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' }).replace('.', '');
const weekday = (key: string) => new Date(`${key}T12:00:00Z`).toLocaleDateString('pt-BR', { weekday: 'long', timeZone: 'UTC' }).replace(/^./, c => c.toUpperCase());
const dayLabel = (key: string, today: string) => (key === today ? 'Hoje' : key === shiftDay(today, -1) ? 'Ontem' : weekday(key)) + ` · ${shortDate(key)}`;
const range = (a: string, b: string) => `${shortDate(a)} a ${shortDate(b)}`;
const costText = (t: Totals) => (t.custo === null ? (t.gasto > 0 ? 'sem conversas' : '—') : currency(t.custo));

function Platform({ origin, rows }: { origin: 'meta' | 'google'; rows: AdRow[] }) {
  const mine = rows.filter(row => row.origem === origin);
  const totals = sumRows(mine);
  return <section className={`platform-block ${origin === 'google' ? 'google' : ''}`} aria-label={origin === 'meta' ? 'Instagram e Facebook' : 'Google'}>
    <h3 className="platform-title">{origin === 'meta' ? <><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 12C9 5 5 4 3 8c-5 10 4 14 9 4s9-7 10-2c2 9-5 10-10 2Z" stroke="currentColor" strokeWidth="2" /></svg>Instagram e Facebook</> : <><span className="google-mark" aria-hidden="true">G</span>Google</>}</h3>
    {mine.length ? <dl><div className="platform-stat"><dt>Investido</dt><dd>{currency(totals.gasto)}</dd></div><div className="platform-stat"><dt>Cliques</dt><dd>{integer(totals.cliques)}</dd></div>{origin === 'google' && totals.conversas === 0 ? <div className="platform-stat"><dt>Custo por clique</dt><dd>{totals.cliques ? currency(totals.gasto / totals.cliques) : '—'}</dd></div> : <div className="platform-stat"><dt>Conversas</dt><dd>{integer(totals.conversas)}</dd></div>}</dl> : <p className="waiting"><Clock size={14} />Sem números neste dia</p>}
  </section>;
}

type Trend = { label: string; now: string; before: string; delta: number | null; goodWhenUp: boolean };
function Comparison({ current, previous, upTo }: { current: Totals; previous: Totals; upTo: string }) {
  const pct = (a: number, b: number) => (b ? (a - b) / b * 100 : null);
  const items: Trend[] = [
    { label: 'Investido', now: currency(current.gasto), before: currency(previous.gasto), delta: pct(current.gasto, previous.gasto), goodWhenUp: true },
    { label: 'Conversas no WhatsApp', now: integer(current.conversas), before: integer(previous.conversas), delta: pct(current.conversas, previous.conversas), goodWhenUp: true },
    { label: 'Custo por conversa', now: costText(current), before: costText(previous), delta: current.custo !== null && previous.custo !== null ? pct(current.custo, previous.custo) : null, goodWhenUp: false },
  ];
  return <section className="metric-card compare-card"><h2 className="list-heading">Comparado à semana anterior <span className="heading-note">de quinta até {weekday(upTo).toLowerCase()}</span></h2>
    {items.map(item => {
      const up = (item.delta ?? 0) > 0;
      const tone = item.delta === null || Math.abs(item.delta) < 1 ? 'neutral' : up === item.goodWhenUp ? 'good' : 'bad';
      return <div className="day-row" key={item.label}><div><div className="day-name">{item.label}</div><div className="day-details">Semana passada: {item.before}</div></div><div className="trend"><span className="day-amount">{item.now}</span>{item.delta !== null && <span className={`trend-badge ${tone}`} aria-label={`${up ? 'subiu' : 'caiu'} ${Math.abs(Math.round(item.delta))}%`}>{up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{Math.abs(Math.round(item.delta))}%</span>}</div></div>;
    })}
  </section>;
}

function PlanProgress({ totals, week, upTo }: { totals: Totals; week: number; upTo: string | null }) {
  const progress = Math.round(totals.gasto / PLAN_TOTAL * 100);
  return <section className="metric-card plan-card" aria-label="Plano de 8 semanas">
    <div className="spend-top"><h2 className="metric-label">Plano de {PLAN_WEEKS} semanas</h2><div className="metric-icon"><Target /></div></div>
    <div className="amount-line"><strong className="amount amount-sm">{currency(totals.gasto)}</strong><span className="amount-target">de {currency(PLAN_TOTAL)} ({progress}%)</span></div>
    <ol className="week-dots" aria-label={`Semana ${Math.min(week, PLAN_WEEKS)} de ${PLAN_WEEKS}`}>{Array.from({ length: PLAN_WEEKS }, (_, i) => <li key={i} className={i + 1 < week ? 'done' : i + 1 === week ? 'current' : ''}><span>{i + 1}</span></li>)}</ol>
    <dl className="plan-stats"><div><dt>Conversas no total</dt><dd>{integer(totals.conversas)}</dd></div><div><dt>Custo médio por conversa</dt><dd>{costText(totals)}</dd></div><div><dt>Cliques no total</dt><dd>{integer(totals.cliques)}</dd></div></dl>
    <p className="plan-note">{upTo ? `De 15 de outubro até ${shortDate(upTo)} (último dia com números).` : 'Os números aparecem aqui assim que forem lançados.'}</p>
  </section>;
}

function WeekRow({ w }: { w: WeekSummary }) {
  const empty = w.days === 0;
  return <div className={`week-row ${w.current ? 'is-today' : ''}`}>
    <div className="week-main"><div className="day-name">Semana {w.n}{w.current && <span className="badge-live">em andamento</span>}</div><div className="day-details">{range(w.start, w.end)}{!empty && ` · Meta ${currency(w.meta.gasto)} · Google ${currency(w.google.gasto)}`}</div></div>
    {empty ? <div className="week-empty">{w.current ? 'Começou agora, aguardando os primeiros números' : 'Sem números'}</div> : <dl className="week-stats"><div><dt>Investido</dt><dd>{currency(w.totals.gasto)}</dd></div><div><dt>Conversas</dt><dd>{integer(w.totals.conversas)}</dd></div><div><dt>Por conversa</dt><dd>{costText(w.totals)}</dd></div></dl>}
  </div>;
}

function Dashboard() {
  const { data, isFetching, isRefetchError, refetch } = useSuspenseQuery(adsQueryOptions);
  const { aba } = Route.useSearch();
  const navigate = useNavigate({ from: '/' });
  const today = dateKey(new Date(data.updatedAt));
  const nowWeek = planWeek(today);
  const weekly = weekRows(data.rows, today);
  const hasWeek = weekly.length > 0;
  const week = sumRows(weekly);
  const latest = latestDay(data.rows, today);
  const dayKey = weekly.some(r => r.data === today) ? today : latest;
  const dayRows = dayKey ? data.rows.filter(r => r.data === dayKey) : [];
  const day = sumRows(dayRows);
  const weeks = weekSummaries(data.rows, today);
  const prevWeek = weeks.length > 1 ? weeks[weeks.length - 2] : undefined;
  const progress = Math.round(week.gasto / WEEKLY_TARGET * 100);
  // compara só dias completos: até ontem (ou até o último dia com dados, se for antes)
  const lastInWeek = weekly.reduce<string | null>((m, r) => (m === null || r.data > m ? r.data : m), null);
  const yesterday = shiftDay(today, -1);
  const upTo = lastInWeek ? (lastInWeek < today ? lastInWeek : yesterday) : null;
  const canCompare = nowWeek > 1 && upTo !== null && upTo >= weekStart(today);
  const campaignRows = hasWeek ? weekly : prevWeek ? data.rows.filter(r => r.data >= prevWeek.start && r.data <= prevWeek.end) : [];
  const campaigns = [...new Set(campaignRows.map(row => `${row.origem}\u0000${row.campanha}`))].map(key => {
    const rows = campaignRows.filter(row => `${row.origem}\u0000${row.campanha}` === key);
    return { key, name: rows[0]?.campanha ?? '', origin: rows[0]?.origem, ...sumRows(rows) };
  }).sort((a, b) => b.gasto - a.gasto);
  const historyDays = [...new Set(data.rows.filter(r => r.data <= today).map(r => r.data))].sort().reverse();
  const title = aba === 'hoje' ? 'Resumo' : aba === 'historico' ? 'Histórico' : 'Seus anúncios';
  return <>
    <header className="app-header"><div className="header-inner">
      <div className="brand"><img className="brand-icon" src="/icons/jm-192.png" alt="Logo JM Gesso" /><div><div className="brand-name">JM GESSO<span className="sr-only"> · Anúncios</span></div><div className="brand-subtitle">Painel de anúncios</div></div></div>
      <div className="header-detail"><div className="week-label"><span className="live-dot" />{nowWeek > PLAN_WEEKS ? 'Plano de 8 semanas concluído' : `Semana ${campaignWeek(today)} de ${PLAN_WEEKS}`}</div><div className="platforms">Instagram, Facebook e Google</div></div>
    </div></header>
    <main className="dashboard">
      <div className="page-heading"><div><div className="eyebrow">{aba === 'historico' ? 'Desde 15 de outubro' : `Semana ${nowWeek} · ${range(weekStart(today), shiftDay(weekStart(today), 6))}`}</div><h1>{title}</h1></div><div className="date-label"><CalendarDays size={14} /><span>{shortDate(today)}</span></div></div>
      {data.example && <div className="example-badge"><Info /><span>EXEMPLO · números ilustrativos</span></div>}
      {data.stale && <p role="status" className="alert-message">Sem conexão agora. Estes são os últimos números salvos neste celular.</p>}
      {isRefetchError && !data.stale && <p role="alert" className="alert-message">Não foi possível atualizar. Os últimos números carregados continuam aqui.</p>}
      {data.skipped.length > 0 && <p role="status" className="alert-message">{data.skipped.length === 1 ? `A linha ${data.skipped[0]} da planilha não pôde ser lida e ficou de fora.` : `As linhas ${data.skipped.join(', ')} da planilha não puderam ser lidas e ficaram de fora.`} Os demais números estão certos.</p>}
      <div className={`view-content view-${aba}`} key={aba}>
        {aba === 'hoje' && <>
          {hasWeek ? <section className="metric-card spend-card" aria-label="Investimento da semana">
            <div className="spend-top"><h2 className="metric-label">Investido nesta semana</h2><div className="metric-icon"><Wallet /></div></div>
            <div className="amount-line"><strong className="amount">{currency(week.gasto)}</strong><span className="amount-target">de {currency(WEEKLY_TARGET)}</span></div>
            <progress className="progress-track" value={Math.min(week.gasto, WEEKLY_TARGET)} max={WEEKLY_TARGET} aria-label={`${progress}% do orçamento semanal`} />
            <div className="spend-bottom"><p className="today-spend">{integer(week.conversas)} conversas · {integer(week.cliques)} cliques</p><p>{progress}% do orçamento</p></div>
          </section> : <section className="metric-card spend-card new-week span-2" aria-label="Nova semana">
            <div className="spend-top"><h2 className="metric-label">Semana {nowWeek} começou {weekStart(today) === today ? 'hoje' : `em ${shortDate(weekStart(today))}`}</h2><div className="metric-icon"><Wallet /></div></div>
            <p className="new-week-text">Orçamento da semana: <b>{currency(WEEKLY_TARGET)}</b>. Os primeiros números entram às 13:00.</p>
            {prevWeek && prevWeek.days > 0 && <div className="prev-week"><div className="eyebrow">Semana {prevWeek.n} fechou · {range(prevWeek.start, prevWeek.end)}</div>
              <dl className="week-stats big"><div><dt>Investido</dt><dd>{currency(prevWeek.totals.gasto)}</dd></div><div><dt>Conversas</dt><dd>{integer(prevWeek.totals.conversas)}</dd></div><div><dt>Por conversa</dt><dd>{costText(prevWeek.totals)}</dd></div></dl></div>}
          </section>}
          {hasWeek && <div className="kpi-grid"><section className="metric-card kpi"><div className="kpi-header"><h2 className="metric-label">Cliques</h2><MousePointer2 /></div><div className="kpi-value">{integer(week.cliques)}</div><p className="kpi-caption">nesta semana</p></section>
            <section className="metric-card kpi kpi-whatsapp"><div className="kpi-header"><h2 className="metric-label">Conversas no WhatsApp</h2><MessageCircle /></div><div className="kpi-value">{integer(week.conversas)}</div><p className="kpi-caption">nesta semana · {costText(week)} cada</p></section></div>}
          {dayKey ? <section className="metric-card cost-card span-2"><div className="cost-top"><div><h2 className="metric-label">{dayKey === today ? 'Números do dia' : 'Último dia com números'}</h2><div className="day-title">{dayLabel(dayKey, today)}</div></div><div className="cost-symbol"><MessageCircle /></div></div>
            <dl className="week-stats big day-stats"><div><dt>Investido</dt><dd>{currency(day.gasto)}</dd></div><div><dt>Conversas</dt><dd>{integer(day.conversas)}</dd></div><div><dt>Por conversa</dt><dd>{costText(day)}</dd></div></dl>
            {dayKey !== today && <p className="kpi-caption">Hoje: {WAITING} (lançamento às 13:00 e às 22:00)</p>}
            <div className="section-divider" /><h2 className="breakdown-heading">De onde vêm os resultados</h2><div className="platform-grid"><Platform origin="meta" rows={dayRows} /><Platform origin="google" rows={dayRows} /></div></section>
            : <section className="metric-card span-2"><p className="empty-state">Ainda não há números lançados.</p></section>}
          {canCompare && upTo && <Comparison current={sumRows(weekly.filter(r => r.data <= upTo))} previous={sumRows(previousWeekRows(data.rows, upTo))} upTo={upTo} />}
        </>}
        {aba === 'historico' && <>
          <PlanProgress totals={sumRows(planRows(data.rows, today))} week={nowWeek} upTo={latest} />
          <section className="metric-card"><h2 className="list-heading">Semana a semana</h2>{[...weeks].reverse().map(w => <WeekRow key={w.n} w={w} />)}</section>
          <section className="metric-card span-2"><h2 className="list-heading">Dia a dia <span className="heading-note">{historyDays.length} dias com números</span></h2>{historyDays.length ? historyDays.map(key => {
            const t = sumRows(data.rows.filter(r => r.data === key));
            return <div className={`day-row ${key === today ? 'is-today' : ''}`} key={key}><div><div className="day-name">{dayLabel(key, today)}</div><div className="day-details">{plural(t.cliques, 'clique', 'cliques')} · {plural(t.conversas, 'conversa', 'conversas')}</div></div><div className="day-amount">{currency(t.gasto)}</div></div>;
          }) : <p className="empty-state">Ainda não há números lançados.</p>}</section>
        </>}
        {aba === 'anuncios' && <>
          <section className="metric-card"><h2 className="list-heading">{hasWeek ? 'Campanhas desta semana' : `Campanhas da semana ${prevWeek?.n ?? ''}`} <span className="text-muted-foreground">({campaigns.length})</span></h2>{campaigns.length ? campaigns.map(campaign => <article className="day-row" key={campaign.key}><div><div className="campaign-origin">{campaign.origin === 'meta' ? 'Instagram e Facebook' : 'Google'}</div><h3 className="day-name">{campaign.name}</h3><p className="day-details">{plural(campaign.cliques, 'clique', 'cliques')} · {plural(campaign.conversas, 'conversa', 'conversas')}</p></div><div className="day-amount">{currency(campaign.gasto)}</div></article>) : <p className="empty-state">Nenhuma campanha com números ainda.</p>}</section>
          <AreaMap />
        </>}
      </div>
      <footer className="update-footer"><span className="live-dot" /><span>Atualizado todo dia às 13:00 e às 22:00{latest ? ` · último número: ${shortDate(latest)}` : ''}</span><Button variant="ghost" size="icon" className={`refresh-button ${isFetching ? 'refreshing' : ''}`} title="Atualizar números" aria-label="Atualizar números" disabled={isFetching} onClick={() => void refetch()}><RefreshCw /></Button></footer>
    </main>
    <nav className="bottom-nav" aria-label="Navegação principal"><div className="nav-inner">{([{ key: 'hoje', label: 'Resumo', icon: ChartNoAxesCombined }, { key: 'historico', label: 'Histórico', icon: History }, { key: 'anuncios', label: 'Anúncios', icon: Megaphone }] as const).map(item => <Button key={item.key} variant="ghost" className={`nav-item ${aba === item.key ? 'active' : ''}`} aria-current={aba === item.key ? 'page' : undefined} onClick={() => void navigate({ search: { aba: item.key } })}><span className="nav-icon"><item.icon /></span>{item.label}</Button>)}</div></nav>
  </>;
}
