import { createFileRoute, useNavigate, useRouter, type ErrorComponentProps } from '@tanstack/react-router';
import { useQueryErrorResetBoundary, useSuspenseQuery } from '@tanstack/react-query';
import { CalendarDays, ChartNoAxesCombined, Info, Megaphone, MessageCircle, MousePointer2, RefreshCw, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adsQueryOptions } from '@/lib/ads/data';
import { campaignWeek, currency, dateKey, integer, shiftDay, sumRows, WEEKLY_TARGET, weekRows, weekStart, type AdRow } from '@/lib/ads/metrics';

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
  return <div className="error-screen"><img src="/icons/jm-icon.svg" alt="JM Gesso" className="brand-icon" /><h1 className="mt-6">Os números não carregaram</h1><p>{error instanceof Error ? error.message : 'Verifique a conexão e tente novamente.'}</p><Button onClick={() => { reset(); void router.invalidate(); }}><RefreshCw /> Tentar novamente</Button></div>;
}

function Platform({ origin, rows }: { origin: 'meta' | 'google'; rows: AdRow[] }) {
  const totals = sumRows(rows.filter(row => row.origem === origin));
  return <section className={`platform-block ${origin === 'google' ? 'google' : ''}`} aria-label={origin === 'meta' ? 'Instagram e Facebook' : 'Google'}>
    <h3 className="platform-title">{origin === 'meta' ? <><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 12C9 5 5 4 3 8c-5 10 4 14 9 4s9-7 10-2c2 9-5 10-10 2Z" stroke="currentColor" strokeWidth="2" /></svg>Instagram e Facebook</> : <><span className="google-mark" aria-hidden="true">G</span>Google</>}</h3>
    <dl><div className="platform-stat"><dt>Investido</dt><dd>{currency(totals.gasto)}</dd></div><div className="platform-stat"><dt>Cliques</dt><dd>{integer(totals.cliques)}</dd></div><div className="platform-stat"><dt>Conversas</dt><dd>{integer(totals.conversas)}</dd></div></dl>
  </section>;
}

function Dashboard() {
  const { data, isFetching, isRefetchError, refetch } = useSuspenseQuery(adsQueryOptions);
  const { aba } = Route.useSearch();
  const navigate = useNavigate({ from: '/' });
  const today = dateKey(new Date(data.updatedAt));
  const weekly = weekRows(data.rows, today);
  const todaysRows = weekly.filter(row => row.data === today);
  const week = sumRows(weekly);
  const daily = sumRows(todaysRows);
  const selectedRows = aba === 'hoje' ? todaysRows : weekly;
  const totals = sumRows(selectedRows);
  const progress = Math.round(week.gasto / WEEKLY_TARGET * 100);
  const date = new Date(`${today}T12:00:00Z`);
  const weekDate = (key: string) => new Date(`${key}T12:00:00Z`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' }).replace('.', '');
  const campaigns = [...new Set(weekly.map(row => `${row.origem}\u0000${row.campanha}`))].map(key => {
    const rows = weekly.filter(row => `${row.origem}\u0000${row.campanha}` === key);
    return { key, name: rows[0]?.campanha ?? '', origin: rows[0]?.origem, ...sumRows(rows) };
  });
  return <>
    <header className="app-header"><div className="header-inner">
      <div className="brand"><img className="brand-icon" src="/icons/jm-icon.svg" alt="Logo provisório JM Gesso" /><div><div className="brand-name">JM GESSO<span className="sr-only"> · Anúncios</span></div><div className="brand-subtitle">Painel de anúncios</div></div></div>
      <div className="header-detail"><div className="week-label"><span className="live-dot" />Semana {campaignWeek(data.rows, today)} de 8</div><div className="platforms">Instagram, Facebook e Google</div></div>
    </div></header>
    <main className="dashboard">
      <div className="page-heading"><div><div className="eyebrow">Seu negócio em movimento</div><h1>{aba === 'hoje' ? 'Resultados de hoje' : aba === 'semana' ? 'Nesta semana' : 'Seus anúncios'}</h1></div><div className="date-label"><CalendarDays size={14} /><span>{date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' }).replace('.', '')}</span></div></div>
      {data.example && <div className="example-badge"><Info /><span>EXEMPLO · números ilustrativos</span></div>}
      {isRefetchError && <p role="alert" className="alert-message">Não foi possível atualizar. Os últimos números carregados continuam aqui.</p>}
      <div className="view-content" key={aba}>
        <section className="metric-card spend-card" aria-label="Investimento semanal">
          <div className="spend-top"><h2 className="metric-label">Investido nesta semana</h2><div className="metric-icon"><Wallet /></div></div>
          <div className="amount-line"><strong className="amount">{currency(week.gasto)}</strong><span className="amount-target">de {currency(WEEKLY_TARGET)}</span></div>
          <progress className="progress-track" value={Math.min(week.gasto, WEEKLY_TARGET)} max={WEEKLY_TARGET} aria-label={`${progress}% da meta semanal`} />
          <div className="spend-bottom"><p className="today-spend"><span>Hoje:</span> {currency(daily.gasto)}</p><p>{progress}% da meta semanal</p></div>
        </section>
        {aba !== 'anuncios' && <>
          <div className="kpi-grid"><section className="metric-card kpi"><div className="kpi-header"><h2 className="metric-label">Cliques</h2><MousePointer2 /></div><div className="kpi-value">{integer(totals.cliques)}</div><p className="kpi-caption">{aba === 'hoje' ? 'nos seus anúncios hoje' : 'nos seus anúncios nesta semana'}</p></section>
          <section className="metric-card kpi kpi-whatsapp"><div className="kpi-header"><h2 className="metric-label">Conversas no WhatsApp</h2><MessageCircle /></div><div className="kpi-value">{integer(totals.conversas)}</div><p className="kpi-caption">{aba === 'hoje' ? 'iniciadas hoje' : 'iniciadas nesta semana'}</p></section></div>
          {aba === 'hoje' && <section className="metric-card cost-card"><div className="cost-top"><div><h2 className="metric-label">Custo por conversa</h2><div className="cost-value">{totals.custo === null ? '—' : currency(totals.custo)}</div></div><div className="cost-symbol"><MessageCircle /></div></div><div className="section-divider" /><h2 className="breakdown-heading">De onde vêm os resultados</h2><div className="platform-grid"><Platform origin="meta" rows={selectedRows} /><Platform origin="google" rows={selectedRows} /></div></section>}
          {aba === 'semana' && <section className="metric-card"><h2 className="list-heading">{weekDate(weekStart(today))} — {weekDate(shiftDay(weekStart(today), 6))}</h2>{Array.from({ length: 7 }, (_, i) => {
            const key = shiftDay(weekStart(today), i);
            const day = sumRows(weekly.filter(row => row.data === key));
            const future = key > today;
            return <div className={`day-row ${key === today ? 'is-today' : ''}`} key={key}><div><div className="day-name">{key === today ? 'Hoje' : new Date(`${key}T12:00:00Z`).toLocaleDateString('pt-BR', { weekday: 'long', timeZone: 'UTC' })}</div><div className="day-details">{future ? 'Ainda não começou' : `${integer(day.cliques)} cliques · ${integer(day.conversas)} conversas`}</div></div><div className="day-amount">{future ? '—' : currency(day.gasto)}</div></div>;
          })}</section>}
        </>}
        {aba === 'anuncios' && <section className="metric-card mt-4"><h2 className="list-heading">Campanhas desta semana <span className="text-muted-foreground">({campaigns.length})</span></h2>{campaigns.length ? campaigns.map(campaign => <article className="day-row" key={campaign.key}><div><div className="campaign-origin">{campaign.origin === 'meta' ? 'Instagram e Facebook' : 'Google'}</div><h3 className="day-name">{campaign.name}</h3><p className="day-details">{integer(campaign.cliques)} cliques · {integer(campaign.conversas)} conversas</p></div><div className="day-amount">{currency(campaign.gasto)}</div></article>) : <p className="empty-state">Nenhuma campanha nesta semana.</p>}</section>}
      </div>
      <footer className="update-footer"><span className="live-dot" /><span>Atualizado às {new Date(data.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}</span><Button variant="ghost" size="icon" className={`refresh-button ${isFetching ? 'refreshing' : ''}`} title="Atualizar números" aria-label="Atualizar números" disabled={isFetching} onClick={() => void refetch()}><RefreshCw /></Button></footer>
    </main>
    <nav className="bottom-nav" aria-label="Navegação principal"><div className="nav-inner">{([{ key: 'hoje', label: 'Hoje', icon: ChartNoAxesCombined }, { key: 'semana', label: 'Semana', icon: CalendarDays }, { key: 'anuncios', label: 'Anúncios', icon: Megaphone }] as const).map(item => <Button key={item.key} variant="ghost" className={`nav-item ${aba === item.key ? 'active' : ''}`} aria-current={aba === item.key ? 'page' : undefined} onClick={() => void navigate({ search: { aba: item.key } })}><span className="nav-icon"><item.icon /></span>{item.label}</Button>)}</div></nav>
  </>;
}
