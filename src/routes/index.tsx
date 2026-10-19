import { createFileRoute, useNavigate, useRouter, type ErrorComponentProps } from '@tanstack/react-router';
import { useQueryErrorResetBoundary, useSuspenseQuery } from '@tanstack/react-query';
import { ArrowDownRight, ArrowUpRight, CalendarDays, ChartNoAxesCombined, Clock, Info, Megaphone, MessageCircle, MousePointer2, RefreshCw, Target, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AreaMap } from '@/components/ads/area-map';
import { adsQueryOptions } from '@/lib/ads/data';
import { campaignWeek, currency, dateKey, integer, lastDataDay, PLAN_TOTAL, PLAN_WEEKS, planRows, planWeek, plural, previousWeekRows, shiftDay, sumRows, WEEKLY_TARGET, weekRows, weekStart, type AdRow, type Totals } from '@/lib/ads/metrics';

type View = 'hoje' | 'semana' | 'anuncios';
export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): { aba: View } => ({ aba: search['aba'] === 'semana' || search['aba'] === 'anuncios' ? search['aba'] : 'hoje' }),
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
  return <div className="error-screen"><img src="/icons/jm-192.png" alt="JM Gesso" className="brand-icon" /><h1 className="mt-6">Os números não carregaram</h1><p>{error instanceof Error ? error.message : 'Verifique a conexão e tente novamente.'}</p><Button onClick={() => { reset(); void router.invalidate(); }}><RefreshCw /> Tentar novamente</Button></div>;
}

const WAITING = 'aguardando dados';
const shortDate = (key: string) => new Date(`${key}T12:00:00Z`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' }).replace('.', '');

function Platform({ origin, rows }: { origin: 'meta' | 'google'; rows: AdRow[] }) {
  const mine = rows.filter(row => row.origem === origin);
  const totals = sumRows(mine);
  return <section className={`platform-block ${origin === 'google' ? 'google' : ''}`} aria-label={origin === 'meta' ? 'Instagram e Facebook' : 'Google'}>
    <h3 className="platform-title">{origin === 'meta' ? <><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 12C9 5 5 4 3 8c-5 10 4 14 9 4s9-7 10-2c2 9-5 10-10 2Z" stroke="currentColor" strokeWidth="2" /></svg>Instagram e Facebook</> : <><span className="google-mark" aria-hidden="true">G</span>Google</>}</h3>
    {mine.length ? <dl><div className="platform-stat"><dt>Investido</dt><dd>{currency(totals.gasto)}</dd></div><div className="platform-stat"><dt>Cliques</dt><dd>{integer(totals.cliques)}</dd></div><div className="platform-stat"><dt>Conversas</dt><dd>{integer(totals.conversas)}</dd></div></dl> : <p className="waiting"><Clock size={14} />Aguardando dados</p>}
  </section>;
}

type Trend = { label: string; now: string; before: string; delta: number | null; goodWhenUp: boolean };
function Comparison({ current, previous, firstWeek, upTo }: { current: Totals; previous: Totals; firstWeek: boolean; upTo: string | null }) {
  if (!firstWeek && !upTo) return <section className="metric-card compare-card"><h2 className="list-heading">Comparado à semana anterior</h2><p className="empty-state">Aguardando dados desta semana.</p></section>;
  if (firstWeek) return <section className="metric-card compare-card"><h2 className="list-heading">Comparado à semana anterior</h2><p className="empty-state">A comparação começa na semana 2, a partir de 22/10.</p></section>;
  const pct = (a: number, b: number) => (b ? (a - b) / b * 100 : null);
  const items: Trend[] = [
    { label: 'Investido', now: currency(current.gasto), before: currency(previous.gasto), delta: pct(current.gasto, previous.gasto), goodWhenUp: true },
    { label: 'Conversas no WhatsApp', now: integer(current.conversas), before: integer(previous.conversas), delta: pct(current.conversas, previous.conversas), goodWhenUp: true },
    { label: 'Custo por conversa', now: current.custo === null ? '—' : currency(current.custo), before: previous.custo === null ? '—' : currency(previous.custo), delta: current.custo !== null && previous.custo !== null ? pct(current.custo, previous.custo) : null, goodWhenUp: false },
  ];
  return <section className="metric-card compare-card"><h2 className="list-heading">Comparado à semana anterior <span className="heading-note">de quinta até {upTo ? new Date(`${upTo}T12:00:00Z`).toLocaleDateString('pt-BR', { weekday: 'long', timeZone: 'UTC' }) : ''}</span></h2>
    {items.map(item => {
      const up = (item.delta ?? 0) > 0;
      const tone = item.delta === null || Math.abs(item.delta) < 1 ? 'neutral' : up === item.goodWhenUp ? 'good' : 'bad';
      return <div className="day-row" key={item.label}><div><div className="day-name">{item.label}</div><div className="day-details">Semana passada: {item.before}</div></div><div className="trend"><span className="day-amount">{item.now}</span>{item.delta !== null && <span className={`trend-badge ${tone}`} aria-label={`${up ? 'subiu' : 'caiu'} ${Math.abs(Math.round(item.delta))}%`}>{up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{Math.abs(Math.round(item.delta))}%</span>}</div></div>;
    })}
  </section>;
}

function PlanProgress({ totals, week, today }: { totals: Totals; week: number; today: string }) {
  const progress = Math.round(totals.gasto / PLAN_TOTAL * 100);
  return <section className="metric-card plan-card" aria-label="Plano de 8 semanas">
    <div className="spend-top"><h2 className="metric-label">Plano de {PLAN_WEEKS} semanas</h2><div className="metric-icon"><Target /></div></div>
    <div className="amount-line"><strong className="amount amount-sm">{currency(totals.gasto)}</strong><span className="amount-target">de {currency(PLAN_TOTAL)} ({progress}%)</span></div>
    <ol className="week-dots" aria-label={`Semana ${Math.min(week, PLAN_WEEKS)} de ${PLAN_WEEKS}`}>{Array.from({ length: PLAN_WEEKS }, (_, i) => <li key={i} className={i + 1 < week ? 'done' : i + 1 === week ? 'current' : ''}><span>{i + 1}</span></li>)}</ol>
    <dl className="plan-stats"><div><dt>Conversas no total</dt><dd>{integer(totals.conversas)}</dd></div><div><dt>Custo médio por conversa</dt><dd>{totals.custo === null ? '—' : currency(totals.custo)}</dd></div><div><dt>Cliques no total</dt><dd>{integer(totals.cliques)}</dd></div></dl>
    <p className="plan-note">Desde 15 de outubro até {shortDate(today)}.</p>
  </section>;
}

function Dashboard() {
  const { data, isFetching, isRefetchError, refetch } = useSuspenseQuery(adsQueryOptions);
  const { aba } = Route.useSearch();
  const navigate = useNavigate({ from: '/' });
  const today = dateKey(new Date(data.updatedAt));
  const weekly = weekRows(data.rows, today);
  const todaysRows = weekly.filter(row => row.data === today);
  const hasToday = todaysRows.length > 0;
  const week = sumRows(weekly);
  const daily = sumRows(todaysRows);
  const selectedRows = aba === 'hoje' ? todaysRows : weekly;
  const totals = sumRows(selectedRows);
  const waiting = aba === 'hoje' && !hasToday;
  const progress = Math.round(week.gasto / WEEKLY_TARGET * 100);
  const nowWeek = planWeek(today);
  const lastDay = lastDataDay(data.rows, today);
  const campaigns = [...new Set(weekly.map(row => `${row.origem}\u0000${row.campanha}`))].map(key => {
    const rows = weekly.filter(row => `${row.origem}\u0000${row.campanha}` === key);
    return { key, name: rows[0]?.campanha ?? '', origin: rows[0]?.origem, ...sumRows(rows) };
  });
  return <>
    <header className="app-header"><div className="header-inner">
      <div className="brand"><img className="brand-icon" src="/icons/jm-192.png" alt="Logo JM Gesso" /><div><div className="brand-name">JM GESSO<span className="sr-only"> · Anúncios</span></div><div className="brand-subtitle">Painel de anúncios</div></div></div>
      <div className="header-detail"><div className="week-label"><span className="live-dot" />{nowWeek > PLAN_WEEKS ? 'Plano de 8 semanas concluído' : `Semana ${campaignWeek(today)} de ${PLAN_WEEKS}`}</div><div className="platforms">Instagram, Facebook e Google</div></div>
    </div></header>
    <main className="dashboard">
      <div className="page-heading"><div><div className="eyebrow">Seu negócio em movimento</div><h1>{aba === 'hoje' ? 'Resultados de hoje' : aba === 'semana' ? 'Nesta semana' : 'Seus anúncios'}</h1></div><div className="date-label"><CalendarDays size={14} /><span>{shortDate(today)}</span></div></div>
      {data.example && <div className="example-badge"><Info /><span>EXEMPLO · números ilustrativos</span></div>}
      {isRefetchError && <p role="alert" className="alert-message">Não foi possível atualizar. Os últimos números carregados continuam aqui.</p>}
      {data.skipped.length > 0 && <p role="status" className="alert-message">{data.skipped.length === 1 ? `A linha ${data.skipped[0]} da planilha não pôde ser lida e ficou de fora.` : `As linhas ${data.skipped.join(', ')} da planilha não puderam ser lidas e ficaram de fora.`} Os demais números estão certos.</p>}
      <div className={`view-content view-${aba}`} key={aba}>
        <section className="metric-card spend-card" aria-label="Investimento semanal">
          <div className="spend-top"><h2 className="metric-label">Investido nesta semana</h2><div className="metric-icon"><Wallet /></div></div>
          <div className="amount-line"><strong className="amount">{currency(week.gasto)}</strong><span className="amount-target">de {currency(WEEKLY_TARGET)}</span></div>
          <progress className="progress-track" value={Math.min(week.gasto, WEEKLY_TARGET)} max={WEEKLY_TARGET} aria-label={`${progress}% do orçamento semanal`} />
          <div className="spend-bottom"><p className="today-spend"><span>Hoje:</span> {hasToday ? currency(daily.gasto) : WAITING}</p><p>{progress}% do orçamento</p></div>
        </section>
        {aba !== 'anuncios' && <>
          <div className="kpi-grid"><section className="metric-card kpi"><div className="kpi-header"><h2 className="metric-label">Cliques</h2><MousePointer2 /></div><div className="kpi-value">{waiting ? '—' : integer(totals.cliques)}</div><p className="kpi-caption">{waiting ? WAITING : aba === 'hoje' ? 'nos seus anúncios hoje' : 'nos seus anúncios nesta semana'}</p></section>
          <section className="metric-card kpi kpi-whatsapp"><div className="kpi-header"><h2 className="metric-label">Conversas no WhatsApp</h2><MessageCircle /></div><div className="kpi-value">{waiting ? '—' : integer(totals.conversas)}</div><p className="kpi-caption">{waiting ? WAITING : aba === 'hoje' ? 'iniciadas hoje' : 'iniciadas nesta semana'}</p></section></div>
          {aba === 'hoje' && <section className="metric-card cost-card span-2"><div className="cost-top"><div><h2 className="metric-label">Custo por conversa</h2><div className="cost-value">{totals.custo === null ? '—' : currency(totals.custo)}</div>{waiting && <p className="kpi-caption">{WAITING}</p>}</div><div className="cost-symbol"><MessageCircle /></div></div><div className="section-divider" /><h2 className="breakdown-heading">De onde vêm os resultados</h2><div className="platform-grid"><Platform origin="meta" rows={selectedRows} /><Platform origin="google" rows={selectedRows} /></div></section>}
          {aba === 'semana' && <>
            <Comparison current={week} previous={lastDay ? sumRows(previousWeekRows(data.rows, lastDay)) : week} firstWeek={nowWeek <= 1} upTo={lastDay} />
            <PlanProgress totals={sumRows(planRows(data.rows, today))} week={nowWeek} today={today} />
            <section className="metric-card span-2"><h2 className="list-heading">{shortDate(weekStart(today))} — {shortDate(shiftDay(weekStart(today), 6))}</h2>{Array.from({ length: 7 }, (_, i) => {
              const key = shiftDay(weekStart(today), i);
              const dayRows = weekly.filter(row => row.data === key);
              const day = sumRows(dayRows);
              const future = key > today;
              const empty = !future && dayRows.length === 0;
              return <div className={`day-row ${key === today ? 'is-today' : ''}`} key={key}><div><div className="day-name">{key === today ? 'Hoje' : new Date(`${key}T12:00:00Z`).toLocaleDateString('pt-BR', { weekday: 'long', timeZone: 'UTC' }).replace(/^./, c => c.toUpperCase())}</div><div className="day-details">{future ? 'Ainda não começou' : empty ? 'Aguardando dados' : `${plural(day.cliques, 'clique', 'cliques')} · ${plural(day.conversas, 'conversa', 'conversas')}`}</div></div><div className="day-amount">{future || empty ? '—' : currency(day.gasto)}</div></div>;
            })}</section>
          </>}
        </>}
        {aba === 'anuncios' && <section className="metric-card"><h2 className="list-heading">Campanhas desta semana <span className="text-muted-foreground">({campaigns.length})</span></h2>{campaigns.length ? campaigns.map(campaign => <article className="day-row" key={campaign.key}><div><div className="campaign-origin">{campaign.origin === 'meta' ? 'Instagram e Facebook' : 'Google'}</div><h3 className="day-name">{campaign.name}</h3><p className="day-details">{plural(campaign.cliques, 'clique', 'cliques')} · {plural(campaign.conversas, 'conversa', 'conversas')}</p></div><div className="day-amount">{currency(campaign.gasto)}</div></article>) : <p className="empty-state">Nenhuma campanha nesta semana.</p>}</section>}
        {aba === 'anuncios' && <AreaMap />}
      </div>
      <footer className="update-footer"><span className="live-dot" /><span>Atualizado todo dia às 13:00 e às 22:00</span><Button variant="ghost" size="icon" className={`refresh-button ${isFetching ? 'refreshing' : ''}`} title="Atualizar números" aria-label="Atualizar números" disabled={isFetching} onClick={() => void refetch()}><RefreshCw /></Button></footer>
    </main>
    <nav className="bottom-nav" aria-label="Navegação principal"><div className="nav-inner">{([{ key: 'hoje', label: 'Hoje', icon: ChartNoAxesCombined }, { key: 'semana', label: 'Semana', icon: CalendarDays }, { key: 'anuncios', label: 'Anúncios', icon: Megaphone }] as const).map(item => <Button key={item.key} variant="ghost" className={`nav-item ${aba === item.key ? 'active' : ''}`} aria-current={aba === item.key ? 'page' : undefined} onClick={() => void navigate({ search: { aba: item.key } })}><span className="nav-icon"><item.icon /></span>{item.label}</Button>)}</div></nav>
  </>;
}
