import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { cases, tituloCase, type Categoria } from "@/data/cases";
import { EMPRESA, mapsEmbed, mapsUrl, whatsappUrl } from "@/lib/site";
import { Reveal } from "@/components/site/ui";

const TITLE = "Thais Artes Gráficas | Gráfica em Piracicaba";
const DESC = "Gráfica em Piracicaba-SP: impressos, brindes corporativos, papelaria e peças em 3D. Se você não tem a arte, a gente cria. Peça orçamento pelo WhatsApp.";
const OG_IMG = "https://thaisartesgraficas.lovable.app/cases/pecas-3d-1.webp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:image", content: OG_IMG },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: EMPRESA.nome,
          description: EMPRESA.descricao,
          telephone: EMPRESA.telefoneIntl,
          email: EMPRESA.email,
          url: "https://thaisartesgraficas.lovable.app/",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Av. Suíça, 500, Jardim Europa",
            addressLocality: "Piracicaba",
            addressRegion: "SP",
            postalCode: "13416-403",
            addressCountry: "BR",
          },
          sameAs: [EMPRESA.instagram, EMPRESA.facebook],
        }),
      },
    ],
  }),
  component: Index,
});

/* CSS próprio da página (animações e detalhes). Sem os caracteres > e & de propósito. */
const CSS = `
.hex{width:28px;height:32px;flex:none;background:conic-gradient(#e6007e,#7b3fc4,#0aa5e0,#3bb54a,#f5d800,#f58220,#e6007e);clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)}
.hdr{background:linear-gradient(180deg,#0B0A1Ff2 0%,#0B0A1Fb3 45%,#0B0A1F00 100%);transition:background .25s}
.hdr.solid{background:#0B0A1Ff5;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.on-dark :focus-visible,.hdr :focus-visible{outline-color:#ffc21a}
@keyframes mq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.fade-in{animation:fadein .25s ease-out}
.sv{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.sv-card{position:relative;overflow:hidden;border-radius:20px;aspect-ratio:4/5;display:flex;flex-direction:column;justify-content:flex-end;padding:16px;color:#fff;transition:transform .3s}
.sv-card:hover{transform:translateY(-4px)}
.sv-card:focus-within{outline:3px solid #14122B;outline-offset:3px}
.sv .sv-card:last-child:nth-child(odd){grid-column:span 2;aspect-ratio:2/1}
.sv-g0{background:linear-gradient(135deg,#D6006F,#6A2FD0)}
.sv-g1{background:linear-gradient(135deg,#6A2FD0,#1F4FE0)}
.sv-g2{background:linear-gradient(135deg,#1F4FE0,#12B5E8)}
.sv-g3{background:radial-gradient(70% 70% at 20% 10%,#D6006F66,transparent),#0B0A1F}
.sv-sombra{position:absolute;inset:0;background:linear-gradient(180deg,transparent 10%,#0B0A1Fe6)}
@media (min-width:768px){
.sv{gap:20px;grid-template-columns:repeat(4,1fr)}
.sv[data-n="9"],.sv[data-n="3"]{grid-template-columns:repeat(3,1fr)}
.sv-card{padding:22px}
.sv[data-n="9"] .sv-card{aspect-ratio:1/1}
.sv .sv-card:last-child:nth-child(odd){grid-column:span 1;aspect-ratio:4/5}
.sv[data-n="9"] .sv-card:last-child:nth-child(odd){aspect-ratio:1/1}
}
@media (min-width:1024px){
.sv[data-n="9"] .sv-card,.sv[data-n="9"] .sv-card:last-child:nth-child(odd){aspect-ratio:16/10}
}
.sv-card h3{overflow-wrap:break-word;text-wrap:balance}
.cs-cta{display:none}
.cs-cta-in{container-type:inline-size}
.cs-cta-t{font-size:clamp(15px,8.5cqi,32px)}
.cs-cta[data-m2="1"]{display:flex}
@media (min-width:640px){
.cs-cta[data-m2]{display:none}
.cs-cta[data-m3="1"],.cs-cta[data-m3="2"]{display:flex}
.cs-cta[data-m3="2"]{grid-column:span 2}
}
@media (min-width:1024px){
.cs-cta[data-m3]{display:none;grid-column:auto}
.cs-cta[data-m4="1"],.cs-cta[data-m4="2"],.cs-cta[data-m4="3"]{display:flex}
.cs-cta[data-m4="2"]{grid-column:span 2}
.cs-cta[data-m4="3"]{grid-column:span 3}
}
.mq{overflow:hidden}
.mq-track{display:flex;width:max-content;animation:mq var(--d,60s) linear infinite;will-change:transform}
.mq-rev{animation-direction:reverse}
.mq:hover .mq-track,.mq:focus-within .mq-track{animation-play-state:paused}
.mq-dup{display:contents}
.mq-item{flex:none;margin-right:12px;position:relative;overflow:hidden;border-radius:16px;display:block}
.mq-item img{transition:transform .4s;display:block}
.mq-item:hover img,.mq-item:focus-visible img{transform:scale(1.04)}
.tk{overflow:hidden}
.tk-track{display:flex;width:max-content;animation:mq 45s linear infinite}
.tk-track span{flex:none;margin-right:28px}
.hr-blur{position:absolute;inset:0;z-index:-4;background:#0B0A1F}
.hr-sl{position:absolute;inset:0;opacity:0;transition:opacity 1.6s cubic-bezier(.4,0,.2,1)}
.hr-sl.on{opacity:1}
.hr-blur img{width:100%;height:100%;object-fit:cover;object-position:var(--pd);filter:blur(12px) brightness(.38) saturate(1.05);transform:scale(1.06)}
.hr-slot{display:contents}
.hr-media{position:absolute;top:0;bottom:0;left:46%;right:0;z-index:-3;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 26%);mask-image:linear-gradient(90deg,transparent 0,#000 26%)}
.hr-media img{width:100%;height:100%;object-fit:cover;object-position:var(--pd);display:block;filter:brightness(.88) saturate(1.05)}
.hr-media .hr-sl.on img{animation:kb 7.6s linear forwards}
@keyframes kb{from{transform:scale(1)}to{transform:scale(1.05)}}
.hr-veil{position:absolute;inset:0;z-index:-2;pointer-events:none;background:linear-gradient(180deg,#0B0A1Fcc 0,#0B0A1F00 140px),linear-gradient(0deg,#0B0A1F 0,#0B0A1Fd9 80px,#0B0A1F00 240px),radial-gradient(60% 55% at 22% 52%,#0B0A1F8c 0,#0B0A1F00 100%),linear-gradient(90deg,#0B0A1Ff0 0,#0B0A1Fe0 40%,#0B0A1Fb8 56%,#0B0A1F73 66%,#0B0A1F2e 78%,#0B0A1F00 92%)}
.hr-tag{position:absolute;right:max(28px,calc((100vw - 1200px)/2 + 28px));bottom:205px;z-index:1;display:flex;align-items:center;gap:8px;padding:7px 12px;border-radius:999px;background:#0B0A1F8c;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);font-family:var(--font-display);font-weight:600;font-size:12px;color:#fff}
.hr-tag:before{content:"";width:8px;height:8px;border-radius:50%;background:#FFC21A}
@media (max-width:1023px){
.hr-blur{display:none}
.hr-veil{background:none}
.hr-slot{display:block;position:relative;height:360px;margin-top:8px}
.hr-media{inset:0;left:0;-webkit-mask-image:linear-gradient(180deg,transparent 0,#000 34%,#000 76%,transparent 100%);mask-image:linear-gradient(180deg,transparent 0,#000 34%,#000 76%,transparent 100%)}
.hr-media img{object-position:var(--pm);filter:brightness(.92) saturate(1.05)}
.hr-media .hr-sl.on img{animation:none}
.hr-sl{transition:opacity 1.4s ease}
.hr-tag{right:auto;left:20px;bottom:26px;padding:6px 11px;font-size:11px;background:#0B0A1F99}
}
@media (min-width:640px) and (max-width:1023px){.hr-slot{height:440px}.hr-tag{left:max(20px,calc((100vw - 1200px)/2 + 20px))}}
@media (prefers-reduced-motion: reduce){
.hr-sl{transition:none}
.hr-media .hr-sl.on img{animation:none}
.mq{overflow-x:auto}
.mq-dup{display:none}
.tk{overflow-x:auto}
.tk-track{animation:none}
}
`;

type Filtro = "Todos" | Categoria;

function Index() {
  const [filtro, setFiltro] = useState<Filtro>("Todos");
  const irParaCase = (id: string) => {
    setFiltro("Todos");
    requestAnimationFrame(() => {
      const el = document.getElementById(`case-${id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.focus({ preventScroll: true });
    });
  };
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Progresso />
      <Header />
      <main>
        <Hero />
        <Marquee onSelect={irParaCase} />
        <Ticker />
        <Servicos />
        <Cases filtro={filtro} setFiltro={setFiltro} />
        <ComoFunciona />
        <Diferenciais />
        <FaixaBrindes />
        <Faq />
        <Contato />
      </main>
      <Footer />
      <WhatsFlutuante />
    </>
  );
}

const BTN = "inline-flex min-h-12 items-center justify-center rounded-full px-6 text-[15px] font-bold transition-transform hover:-translate-y-0.5";
const BTN_ZAP = `${BTN} bg-wa text-noite`;
const BTN_GHOST = `${BTN} border-2 border-white text-white hover:bg-white/10`;
const BTN_AMARELO = `${BTN} bg-amarelo text-noite`;

function Zap({ children, className = BTN_ZAP, msg, cta }: { children: React.ReactNode; className?: string; msg?: string; cta?: boolean }) {
  return (
    <a href={whatsappUrl(msg)} target="_blank" rel="noopener noreferrer" className={className} {...(cta ? { "data-cta": true } : {})}>
      {children}
    </a>
  );
}

function Marca() {
  return (
    <span className="flex items-center gap-2.5 whitespace-nowrap font-display text-[15px] font-semibold text-white">
      <span className="hex" aria-hidden />
      Thais Artes Gráficas
    </span>
  );
}

function Progresso() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const calc = () => {
      raf = 0;
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? h.scrollTop / max : 0;
      if (ref.current) ref.current.style.transform = `scaleX(${p})`;
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(calc); };
    calc();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return <div ref={ref} aria-hidden className="bg-grad fixed left-0 top-0 z-50 h-[3px] w-full origin-left" style={{ transform: "scaleX(0)" }} />;
}

const NAV = [
  { href: "#servicos", label: "Serviços" },
  { href: "#cases", label: "Cases" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#contato", label: "Contato" },
];

function Header() {
  const [aberto, setAberto] = useState(false);
  const [solido, setSolido] = useState(false);
  useEffect(() => {
    if (!aberto) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setAberto(false); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [aberto]);
  useEffect(() => {
    const on = () => setSolido(window.scrollY > 80);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className={`hdr fixed inset-x-0 top-0 z-40 ${solido || aberto ? "solid" : ""}`}>
      <div className="container-site flex h-20 items-center justify-between gap-4">
        <a href="#topo" aria-label="Thais Artes Gráficas, início"><Marca /></a>
        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex gap-1.5 text-[15px] font-medium text-white">
            {NAV.map((n) => (
              <li key={n.href}>
                <a className="inline-flex min-h-12 items-center whitespace-nowrap rounded-full px-4 hover:bg-white/10" href={n.href}>{n.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Zap className={`${BTN_ZAP.replace("inline-flex ", "")} hidden whitespace-nowrap sm:inline-flex`}>Pedir orçamento</Zap>
          <button
            type="button"
            className="inline-flex h-12 w-12 items-center justify-center text-white lg:hidden"
            aria-expanded={aberto}
            aria-controls="menu-mobile"
            aria-label={aberto ? "Fechar menu" : "Abrir menu"}
            onClick={() => setAberto((v) => !v)}
          >
            <span className="relative block h-3.5 w-6">
              <span className={`absolute left-0 h-0.5 w-6 bg-white transition-transform ${aberto ? "top-1.5 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 top-1.5 h-0.5 w-6 bg-white ${aberto ? "opacity-0" : ""}`} />
              <span className={`absolute left-0 h-0.5 w-6 bg-white transition-transform ${aberto ? "top-1.5 -rotate-45" : "top-3"}`} />
            </span>
          </button>
        </div>
      </div>
      {aberto && (
        <nav id="menu-mobile" aria-label="Menu" className="h-[calc(100dvh-5rem)] overflow-y-auto border-t border-white/10 lg:hidden">
          <ul className="container-site pb-8 pt-2">
            {NAV.map((n) => (
              <li key={n.href} className="border-b border-white/10">
                <a href={n.href} onClick={() => setAberto(false)} className="flex min-h-16 items-center font-display text-2xl font-semibold text-white">{n.label}</a>
              </li>
            ))}
            <li className="pt-8"><Zap className={`${BTN_ZAP} h-14 w-full whitespace-nowrap text-[17px]`}>Pedir orçamento no WhatsApp</Zap></li>
            <li className="pt-6 text-sm text-white/70">{EMPRESA.telefone} · Piracicaba&nbsp;-&nbsp;SP</li>
          </ul>
        </nav>
      )}
    </header>
  );
}

const BENEFICIOS = [
  ["Criamos a arte", "se você não tiver"],
  ["Você aprova", "antes de imprimirmos"],
  ["Impressos, brindes e 3D", "num só lugar"],
  ["Envio para outras cidades", "combinamos pelo WhatsApp"],
];

const SLIDES = [
  { src: "/cases/hd/sambalele-1.webp", pd: "50% 50%", pm: "50% 55%", label: "Crachás, Sambalelê" },
  { src: "/cases/hd/lwart-1.webp", pd: "50% 45%", pm: "50% 38%", label: "Copos de bambu, Lwart" },
  { src: "/cases/hd/pecas-3d-2.webp", pd: "50% 45%", pm: "50% 40%", label: "Miniaturas em 3D" },
  { src: "/cases/hd/cervino-1.webp", pd: "50% 50%", pm: "50% 45%", label: "Cadernos, Cervino" },
  { src: "/cases/hd/porto-1.webp", pd: "50% 50%", pm: "50% 60%", label: "Canecas, Porto" },
];

function Hero() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let t = 0;
    const start = () => {
      if (!t) t = window.setInterval(() => setI((x) => (x + 1) % SLIDES.length), 6000);
    };
    const stop = () => { window.clearInterval(t); t = 0; };
    const onVis = () => (document.hidden ? stop() : start());
    start();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);
  const camada = (cls: string) =>
    SLIDES.map((sl, k) => (
      <div key={sl.src} className={`${cls} ${k === i ? "on" : ""}`}>
        <img
          src={sl.src}
          alt=""
          aria-hidden="true"
          width={640}
          height={800}
          {...(k === 0 ? { fetchPriority: "high" as const } : { loading: "lazy" as const })}
          style={{ "--pd": sl.pd, "--pm": sl.pm } as React.CSSProperties}
        />
      </div>
    ));
  return (
    <section id="topo" className="bg-night on-dark relative isolate overflow-hidden pt-28 md:pt-36">
      <div className="hr-blur" aria-hidden="true">{camada("hr-sl")}</div>
      <div className="hr-veil" aria-hidden="true" />
      <div className="container-site">
        <div className="relative z-[2] max-w-[620px]">
          <a
            href={EMPRESA.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-6 inline-flex min-h-12 items-center gap-2.5 rounded-full border border-white/25 px-4 text-sm font-bold text-white hover:border-white/60"
          >
            <span aria-hidden className="h-2 w-2 rounded-full bg-wa" />
            100% de recomendação no Facebook
          </a>
          <h1 className="h1-display !text-[length:clamp(2.1rem,6vw,4.2rem)] [text-shadow:0_2px_24px_#0B0A1Fb3]">
            Sua marca <span className="text-amarelo">impressa</span>, <span className="text-amarelo">gravada</span> e em <span className="text-grad-soft">3D.</span> Aqui em Piracicaba.
          </h1>
          <p className="mt-6 max-w-[34rem] [text-shadow:0_1px_14px_#0B0A1Fcc]">
            <strong className="block text-[18px] font-bold text-white md:text-[20px]">Se você não tem a arte, a gente cria.</strong>
            <span className="mt-1 block text-[16px] text-white/85 md:text-[17.6px]">Mais de 10 mil pessoas acompanham nosso trabalho no Instagram.</span>
          </p>
          <div className="mt-8 flex flex-col gap-2.5 md:flex-row md:gap-3">
            <Zap cta className={`${BTN} h-14 w-full bg-wa px-7 text-[17px] text-noite shadow-[0_8px_28px_#25D36659] md:w-auto`}>
              Pedir orçamento no WhatsApp
            </Zap>
            <a href="#cases" className={`${BTN} h-[52px] w-full border-[1.5px] border-white/55 bg-noite/40 text-white hover:bg-white/10 md:h-14 md:w-auto`}>Ver cases</a>
          </div>
        </div>
      </div>
      <div className="hr-slot">
        <div className="hr-media" aria-hidden="true">{camada("hr-sl")}</div>
        <div key={i} className="hr-tag fade-in">{SLIDES[i]!.label}</div>
      </div>
      <ul className="container-site relative z-[2] mt-2 grid grid-cols-2 gap-5 border-t border-white/15 pb-10 pt-7 md:mt-11 md:grid-cols-4 md:pb-[52px]">
        {BENEFICIOS.map(([t, s]) => (
          <li key={t}>
            <span aria-hidden className="bg-grad mb-2.5 block h-2.5 w-2.5 rounded-full" />
            <b className="block text-[15px] font-bold leading-snug text-white [text-wrap:balance]">{t}</b>
            <span className="block text-sm leading-snug text-white/80 [text-wrap:balance]">{s}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

type Item = { id: string; src: string; alt: string };

function montarFaixas(): [Item[], Item[]] {
  const comFoto = cases.filter((c) => c.fotos[0]);
  const item = (c: (typeof cases)[number], src: string): Item => ({ id: c.id, src, alt: `${c.produto} — ${tituloCase(c)}` });
  const a = comFoto.slice(0, 7).map((c) => item(c, c.fotos[0]!));
  const segundas = comFoto.filter((c) => c.fotos[1]).map((c) => item(c, c.fotos[1]!));
  let b = [...comFoto.slice(7).map((c) => item(c, c.fotos[0]!)), ...segundas];
  if (b.length < 6) b = [...a].reverse();
  return [a, b];
}

function preencher(itens: Item[]) {
  let out = [...itens];
  while (itens.length && out.length < 10) out = out.concat(itens);
  return out;
}

function Faixa({ itens, reverso, velocidade, onSelect }: { itens: Item[]; reverso?: boolean; velocidade: number; onSelect: (id: string) => void }) {
  const lista = preencher(itens);
  const dur = Math.round((lista.length * 236) / velocidade);
  const render = (dup: boolean) =>
    lista.map((it, i) => (
      <button
        key={`${dup ? "d" : "o"}-${i}-${it.id}`}
        type="button"
        tabIndex={dup ? -1 : 0}
        aria-hidden={dup || undefined}
        aria-label={dup ? undefined : `Ver case: ${it.alt}`}
        onClick={() => onSelect(it.id)}
        className="mq-item group"
      >
        <img src={it.src} alt={dup ? "" : it.alt} loading="lazy" width={224} height={280} className="aspect-[4/5] h-[200px] object-cover md:h-[280px]" />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-noite/80 to-transparent p-3 pt-8 text-left font-display text-[13px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          Ver case
        </span>
      </button>
    ));
  return (
    <div className="mq">
      <div className={`mq-track ${reverso ? "mq-rev" : ""}`} style={{ ["--d" as string]: `${dur}s` } as React.CSSProperties}>
        {render(false)}
        <span className="mq-dup" aria-hidden>{render(true)}</span>
      </div>
    </div>
  );
}

function Marquee({ onSelect }: { onSelect: (id: string) => void }) {
  const [a, b] = montarFaixas();
  return (
    <section aria-label="Trabalhos recentes" className="bg-night on-dark space-y-3 pb-8 pt-2">
      <Faixa itens={a} velocidade={40} onSelect={onSelect} />
      <Faixa itens={b} reverso velocidade={32} onSelect={onSelect} />
    </section>
  );
}

const TICKER = ["Cartões de visita", "Canecas", "Garrafas", "Crachás", "Ímãs", "Banners", "Adesivos", "Cadernos", "Pastas", "Peças 3D", "Papelaria"];

function Ticker() {
  const linha = (dup: boolean) => TICKER.map((t) => <span key={`${dup}-${t}`}>{t} •</span>);
  return (
    <div className="bg-grad tk flex h-14 items-center font-display text-[15px] font-semibold text-white" role="presentation">
      <div className="tk-track">
        {linha(false)}
        {linha(true)}
      </div>
    </div>
  );
}

function Img({ src, alt }: { src?: string; alt: string }) {
  if (!src) return <div className="photo-placeholder aspect-[4/5] w-full" role="img" aria-label={alt} />;
  return <img src={src} alt={alt} loading="lazy" width={400} height={500} className="aspect-[4/5] w-full object-cover" />;
}

const SERVICOS: { aba: string; itens: [string, string, string?][] }[] = [
  { aba: "Impressos", itens: [
    ["Cartões de visita", "Com hot stamping e cantos arredondados.", "/cases/matheus-fernandes-1.webp"],
    ["Cartão fidelidade", "Para o cliente voltar sempre."],
    ["Panfletos e folders", "Para divulgar seu negócio na rua e no balcão."],
    ["Ímãs", "Sua marca na geladeira do cliente."],
    ["Banners", "Para eventos, fachadas e feiras."],
    ["Adesivos e etiquetas", "Em vários formatos e cortes."],
    ["Tags", "Para roupas, presentes e produtos."],
    ["Crachás", "Personalizados para equipes e eventos.", "/cases/sambalele-1.webp"],
    ["Placa QR Code PIX", "Pagamento rápido no caixa."],
  ]},
  { aba: "Brindes", itens: [
    ["Canecas", "Com logo, foto ou ilustração.", "/cases/porto-1.webp"],
    ["Garrafas", "Com gravação a laser.", "/cases/newtrade-capital-1.webp"],
    ["Copos", "Com gravação.", "/cases/lwart-1.webp"],
    ["Água personalizada", "Garrafinhas com rótulo da marca.", "/cases/caminho-jaecoo-1.webp"],
    ["Canetas", "Com a marca da empresa.", "/cases/nalco-water-1.webp"],
    ["Chaveiros", "Pequenos e lembrados.", "/cases/nalco-water-1.webp"],
    ["Bloquinhos", "Para anotar e lembrar de você.", "/cases/dsilveira-1.webp"],
    ["Sacolas de algodão", "Úteis e reutilizáveis.", "/cases/cervino-1.webp"],
    ["Brindes para eventos", "Kits corporativos para sua equipe e clientes."],
  ]},
  { aba: "Papelaria", itens: [
    ["Papelaria para empresas", "Tudo com a mesma identidade.", "/cases/elaine-longo-1.webp"],
    ["Pastas", "Para propostas e apresentações.", "/cases/sino-educacional-1.webp"],
    ["Cadernos", "Personalizados com a marca.", "/cases/cervino-1.webp"],
    ["Kits de identidade", "Cartão, pasta e envelope.", "/cases/matheus-fernandes-1.webp"],
  ]},
  { aba: "Peças 3D", itens: [
    ["Peças e brindes sob medida", "Criados para o seu projeto.", "/cases/pecas-3d-1.webp"],
    ["Miniaturas", "Detalhe em tamanho pequeno.", "/cases/pecas-3d-2.webp"],
    ["Objetos personalizados", "Do jeito que você imaginar.", "/cases/pecas-3d-3.webp"],
  ]},
];

function Servicos() {
  const [ativa, setAtiva] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: React.KeyboardEvent) => {
    const n = SERVICOS.length;
    let i = ativa;
    if (e.key === "ArrowRight") i = (ativa + 1) % n;
    else if (e.key === "ArrowLeft") i = (ativa - 1 + n) % n;
    else if (e.key === "Home") i = 0;
    else if (e.key === "End") i = n - 1;
    else return;
    e.preventDefault();
    setAtiva(i);
    refs.current[i]?.focus();
  };
  const s = SERVICOS[ativa]!;
  return (
    <section id="servicos" className="section-y bg-paper">
      <div className="container-site">
        <Reveal>
          <p className="mb-2 text-sm font-bold text-primary">Serviços</p>
          <h2 className="h2-display">O que sai da nossa gráfica</h2>
          <p className="mt-3 max-w-[40ch] text-muted-foreground">Escolha a categoria e veja exemplos.</p>
        </Reveal>
        <div role="tablist" aria-label="Categorias de serviço" onKeyDown={onKey} className="mt-8 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap">
          {SERVICOS.map((x, i) => (
            <button
              key={x.aba}
              ref={(el) => { refs.current[i] = el; }}
              role="tab"
              id={`tab-${i}`}
              aria-selected={ativa === i}
              aria-controls="painel-servicos"
              tabIndex={ativa === i ? 0 : -1}
              onClick={() => setAtiva(i)}
              className={`inline-flex min-h-12 shrink-0 items-center justify-center whitespace-nowrap rounded-full border-2 px-6 text-[15px] font-bold transition-colors ${ativa === i ? "border-transparent bg-[linear-gradient(90deg,#D6006F,#1F4FE0)] text-white" : "border-ink/15 hover:border-ink/40"}`}
            >
              {x.aba}
            </button>
          ))}
        </div>
        <div role="tabpanel" id="painel-servicos" aria-labelledby={`tab-${ativa}`} tabIndex={0} className="mt-8">
          <ul key={ativa} data-n={s.itens.length} className="sv fade-in">
            {s.itens.map(([nome, frase, foto], idx) => (
              <li key={nome} className={`sv-card ${foto ? "" : `sv-g${idx % 4}`}`}>
                {foto ? (
                  <>
                    <img src={foto} alt="" loading="lazy" width={400} height={500} className="absolute inset-0 h-full w-full object-cover" />
                    <span aria-hidden className="sv-sombra" />
                  </>
                ) : (
                  <span aria-hidden className="pointer-events-none absolute right-4 top-3 select-none font-display text-[length:clamp(40px,12vw,56px)] font-extrabold leading-none opacity-[.16] md:text-[84px]">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                )}
                <span aria-hidden className="absolute left-3.5 top-3.5 grid size-8 place-items-center rounded-full bg-white/25 text-sm md:size-[38px]">↗</span>
                <h3 className="relative font-display text-[1.05rem] font-semibold leading-tight md:text-[1.2rem]">
                  <a
                    href={whatsappUrl(`Olá! Vim pelo site e quero um orçamento de ${nome}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="after:absolute after:inset-0 after:content-['']"
                  >
                    {nome}
                  </a>
                </h3>
                <p className="relative mt-1 text-[14px] leading-snug text-white/90 md:text-[15px]">{frase}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

const FILTROS: Filtro[] = ["Todos", "Impressos", "Brindes", "Papelaria", "3D"];

/* Quantas colunas faltam para fechar a última linha da grade de cases (0 = fechada). */
const falta = (n: number, cols: number) => String((cols - (n % cols)) % cols);

function Cases({ filtro, setFiltro }: { filtro: Filtro; setFiltro: (f: Filtro) => void }) {
  const lista = filtro === "Todos" ? cases : cases.filter((c) => c.categoria === filtro);
  return (
    <section id="cases" className="section-y bg-night on-dark">
      <div className="container-site">
        <Reveal className="max-w-[780px]">
          <p className="mb-2 text-sm font-bold text-[#ff6fb5]">Cases</p>
          <h2 className="h2-display text-white">Trabalhos feitos aqui, para gente daqui e de fora</h2>
        </Reveal>
        <p className="mt-4 max-w-[52ch] text-[15px] text-white/70">
          Trabalhos produzidos pela Thais Artes Gráficas. Marcas citadas pertencem aos seus titulares.
        </p>
        <div role="group" aria-label="Filtrar cases" className="mt-8 flex flex-wrap gap-2">
          {FILTROS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filtro === f}
              onClick={() => setFiltro(f)}
              className={`inline-flex min-h-12 shrink-0 items-center whitespace-nowrap rounded-full border-2 px-5 text-sm font-bold ${filtro === f ? "border-white bg-white text-noite" : "border-white/30 text-white hover:border-white"}`}
            >
              {f}
            </button>
          ))}
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-9">
          {lista.map((c) => (
            <li key={c.id} id={`case-${c.id}`} tabIndex={-1} className="group flex flex-col">
              <div className="relative overflow-hidden rounded-2xl sm:rounded-[20px]">
                <Img src={c.fotos[0]} alt={`${c.produto} — ${tituloCase(c)}`} />
                {c.fotos[1] && (
                  <img src={c.fotos[1]} alt="" loading="lazy" className="absolute inset-0 aspect-[4/5] w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-active:opacity-100" />
                )}
              </div>
              <div className="pt-3 sm:pt-4">
                <p className="text-[13px] font-bold text-[#ff6fb5] sm:text-sm">{c.categoria}</p>
                <h3 className="mt-0.5 font-display text-[15px] font-semibold leading-tight text-white [overflow-wrap:break-word] [text-wrap:balance] sm:mt-1 sm:text-lg lg:text-xl">{tituloCase(c)}</h3>
                <p className="mt-1 text-[14px] font-medium leading-snug text-white sm:text-base">{c.produto}</p>
                <p className="mt-1 text-[13px] leading-snug text-white/70 sm:text-[15px]">{c.detalhe}</p>
              </div>
            </li>
          ))}
          <li className="cs-cta" data-m2={falta(lista.length, 2)} data-m3={falta(lista.length, 3)} data-m4={falta(lista.length, 4)}>
            <div className="cs-cta-in bg-grad flex h-full w-full flex-col justify-between gap-5 rounded-2xl p-4 sm:rounded-[20px] sm:p-6 lg:p-8">
              <p className="cs-cta-t max-w-[16ch] font-display font-semibold leading-tight text-white [text-wrap:balance]">Seu projeto pode ser o próximo.</p>
              <div>
                <p className="mb-4 max-w-[36ch] text-[14px] leading-snug text-white/90 sm:text-base">Conte a ideia pelo WhatsApp. Se não tiver a arte, a gente cria.</p>
                <Zap msg="Olá! Vi os trabalhos no site e quero um orçamento." className={`${BTN_AMARELO} w-full whitespace-nowrap !px-2 !text-[14px] sm:w-auto sm:!px-6 sm:!text-[15px]`}>Pedir orçamento</Zap>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}

const PASSOS = [
  "Você conta o que precisa pelo WhatsApp.",
  "Criamos ou ajustamos a arte.",
  "Produzimos.",
  "Retirada ou entrega, combinamos pelo WhatsApp.",
];

function ComoFunciona() {
  return (
    <section id="como-funciona" className="section-y bg-paper">
      <div className="container-site">
        <Reveal>
          <p className="mb-2 text-sm font-bold text-primary">Como funciona</p>
          <h2 className="h2-display max-w-[22ch]">Do pedido à entrega, em 4 passos</h2>
        </Reveal>
        <ol className="mt-8 grid gap-0 sm:mt-12 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
          {PASSOS.map((t, i) => (
            <li key={i} className="grid grid-cols-[2.75rem_1fr] items-center gap-3 border-t-2 border-dashed border-ink/15 py-5 sm:block sm:pb-0">
              <span aria-hidden className="text-grad block font-display text-[40px] font-extrabold leading-none sm:text-[56px]">{i + 1}</span>
              <p className="text-[1.05rem] font-medium leading-snug [text-wrap:pretty] sm:mt-4"><span className="sr-only">Passo {i + 1}: </span>{t}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 md:mt-12">
          <Zap cta msg="Olá! Vim pelo site e quero começar um pedido." className={`${BTN_ZAP} w-full whitespace-nowrap sm:w-auto`}>Começar pelo WhatsApp</Zap>
        </div>
      </div>
    </section>
  );
}

const DIFS: [string, string][] = [
  ["Não tem a arte? Nós criamos.", "Você explica a ideia e a gente desenha antes de imprimir."],
  ["Envio para outras cidades", "Combinamos o envio pelo WhatsApp."],
  ["Tudo num só lugar", "Impressos, brindes e peças 3D."],
];

function Diferenciais() {
  return (
    <section aria-labelledby="dif-titulo" className="section-y bg-paper-2">
      <div className="container-site grid gap-8 md:grid-cols-12 md:gap-10">
        <Reveal className="md:col-span-12 lg:col-span-5">
          <p className="mb-2 text-sm font-bold text-primary">Diferenciais</p>
          <h2 id="dif-titulo" className="h2-display">Por que pedir na Thais</h2>
        </Reveal>
        <Reveal className="md:col-span-12 lg:col-span-7">
          <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {DIFS.map(([t, d]) => (
              <li key={t} className="rounded-[20px] border border-ink/10 bg-white p-5 sm:p-6">
                <span aria-hidden className="bg-grad mb-4 block h-2.5 w-10 rounded-full" />
                <p className="font-display text-[1.05rem] font-semibold leading-tight [text-wrap:balance]">{t}</p>
                <p className="mt-2 text-[16px] leading-snug text-muted-foreground">{d}</p>
              </li>
            ))}
            <li className="rounded-[20px] border border-ink/10 bg-white p-5 sm:p-6">
              <span aria-hidden className="bg-grad mb-4 block h-2.5 w-10 rounded-full" />
              <p className="font-display text-[1.05rem] font-semibold leading-tight [text-wrap:balance]">100% de recomendação no Facebook</p>
              <a href={EMPRESA.facebook} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex min-h-12 items-center font-semibold text-primary underline underline-offset-4">Ver no Facebook</a>
            </li>
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

function FaixaBrindes() {
  return (
    <section aria-labelledby="brindes-titulo" className="bg-grad on-dark text-white">
      <div className="container-site flex flex-col items-start gap-8 py-14 md:flex-row md:items-center md:justify-between md:py-20">
        <h2 id="brindes-titulo" className="h2-display max-w-[20ch]">Sua marca em canecas, garrafas, cadernos e mais</h2>
        <Zap cta msg="Olá! Vim pelo site e quero um orçamento de brindes." className={`${BTN_AMARELO} w-full shrink-0 whitespace-nowrap sm:w-auto`}>Pedir orçamento no WhatsApp</Zap>
      </div>
    </section>
  );
}

const FAQ = [
  ["Quais arquivos vocês aceitam?", "PDF, CDR ou imagem. Se tiver dúvida sobre o seu arquivo, mande pelo WhatsApp que a gente olha."],
  ["Como funciona a aprovação da arte?", "Antes de produzir, enviamos a arte para você conferir. Só imprimimos depois da sua aprovação."],
  ["E se eu não tiver arte?", "A gente cria. Conte o que precisa, mande sua logo se tiver, e montamos a arte para você aprovar."],
];

function Faq() {
  return (
    <section aria-labelledby="faq-titulo" className="section-y bg-paper">
      <div className="container-site grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="mb-2 text-sm font-bold text-primary">Antes de pedir</p>
          <h2 id="faq-titulo" className="h2-display">Dúvidas comuns</h2>
        </div>
        <div className="md:col-span-7">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group border-b border-ink/15 first:border-t">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 font-display text-[1.05rem] font-semibold">
                <span className="[text-wrap:balance]">{q}</span>
                <span aria-hidden className="text-grad shrink-0 text-2xl transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="prose-w pb-6 text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Cidade, UF e CEP ficam juntos numa linha (o hífen do CEP e o de "Piracicaba - SP" não podem quebrar). */
const [enderecoRua, ...enderecoResto] = EMPRESA.endereco.split(", Piracicaba");
const enderecoSemQuebra = enderecoResto.length ? (
  <>
    {enderecoRua},{" "}
    <span className="whitespace-nowrap">Piracicaba{enderecoResto.join(", Piracicaba")}</span>
  </>
) : (
  EMPRESA.endereco
);

const PRODUTOS = ["Cartões", "Canecas", "Garrafas", "Crachás", "Papelaria", "Peça 3D", "Outro"];

function Contato() {
  const [produto, setProduto] = useState<string | null>(null);
  const msg = produto
    ? `Olá! Vim pelo site e quero um orçamento de ${produto}.`
    : "Olá! Vim pelo site e quero um orçamento.";
  return (
    <section id="contato" data-cta className="section-y bg-night on-dark text-white">
      <div className="container-site grid gap-12 md:grid-cols-12">
        <div className="md:col-span-6">
          <p className="mb-2 text-sm font-bold text-[#ff6fb5]">Contato</p>
          <h2 className="h2-display">Fale com a gente pelo WhatsApp</h2>
          <p className="mt-4 text-white/80">Escolha o que você precisa e a mensagem já sai pronta.</p>
          <div role="group" aria-label="O que você precisa" className="mt-6 flex flex-wrap gap-2">
            {PRODUTOS.map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={produto === p}
                onClick={() => setProduto(produto === p ? null : p)}
                className={`inline-flex min-h-12 items-center rounded-full border-2 px-5 text-sm font-bold ${produto === p ? "border-white bg-white text-noite" : "border-white/30 text-white hover:border-white"}`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Zap msg={msg}>Falar no WhatsApp</Zap>
            <a href={`mailto:${EMPRESA.email}`} className={BTN_GHOST}>Mandar e-mail</a>
          </div>
        </div>
        <div className="md:col-span-5 md:col-start-8">
          <dl className="space-y-4">
            <div><dt className="text-sm font-bold text-[#ff6fb5]">WhatsApp</dt><dd><a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="font-display text-2xl font-semibold hover:text-amarelo">{EMPRESA.telefone}</a></dd></div>
            <div><dt className="text-sm font-bold text-[#ff6fb5]">E-mail</dt><dd><a href={`mailto:${EMPRESA.email}`} className="inline-flex min-h-12 items-center break-all underline underline-offset-4 hover:text-amarelo">{EMPRESA.email}</a></dd></div>
            <div><dt className="text-sm font-bold text-[#ff6fb5]">Endereço</dt><dd>{enderecoSemQuebra}</dd></div>
            {EMPRESA.horario && <div><dt className="text-sm font-bold text-[#ff6fb5]">Horário</dt><dd>{EMPRESA.horario}</dd></div>}
            <div><dt className="text-sm font-bold text-[#ff6fb5]">Redes</dt><dd className="flex flex-wrap gap-x-6">
              <a href={EMPRESA.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center underline underline-offset-4 hover:text-amarelo">Instagram @thaisartesgraficas</a>
              <a href={EMPRESA.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center underline underline-offset-4 hover:text-amarelo">Facebook</a>
            </dd></div>
          </dl>
          <iframe title="Mapa: Thais Artes Gráficas, Av. Suíça, 500, Piracicaba" src={mapsEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="mt-8 aspect-[4/3] w-full rounded-[20px] border-0" />
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-12 items-center font-semibold text-amarelo underline underline-offset-4">Abrir no Google Maps</a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="on-dark bg-noite pb-6 text-white/80">
      <div className="container-site flex flex-col gap-4 border-t border-white/15 py-8 text-[15px] lg:flex-row lg:items-center lg:justify-between">
        <Marca />
        <p>{enderecoSemQuebra}</p>
        <div className="flex flex-wrap gap-x-5">
          <a href={EMPRESA.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center hover:text-amarelo">Instagram</a>
          <a href={EMPRESA.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center hover:text-amarelo">Facebook</a>
          <Link to="/privacidade" className="inline-flex min-h-12 items-center hover:text-amarelo">Privacidade</Link>
          <span className="inline-flex min-h-12 items-center">© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}

function WhatsFlutuante() {
  const [oculto, setOculto] = useState(true);
  useEffect(() => {
    const visiveis = new Set<Element>();
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => (e.isIntersecting ? visiveis.add(e.target) : visiveis.delete(e.target)));
      setOculto(visiveis.size > 0);
    });
    document.querySelectorAll("[data-cta], footer").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return (
    <a
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Pedir orçamento no WhatsApp"
      tabIndex={oculto ? -1 : 0}
      aria-hidden={oculto}
      className={`fixed bottom-4 right-4 z-30 inline-flex size-14 items-center justify-center gap-2 rounded-full bg-wa font-bold text-noite shadow-[0_8px_24px_#0B0A1F40] transition-opacity duration-300 sm:bottom-5 sm:right-5 sm:size-auto sm:min-h-14 sm:px-6 ${oculto ? "pointer-events-none opacity-0" : "opacity-100"}`}
    >
      <svg aria-hidden viewBox="0 0 24 24" className="size-6 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 19.5 5.6 16A8 8 0 1 1 8.4 18.6Z" />
        <path d="M9.2 9.6c.3 1.6 1.6 3.1 3.3 3.8l1-.9 1.8.8-.4 1.4c-2.6.1-5.5-2.6-5.8-5.3l1.3-.6.9 1.7Z" fill="currentColor" stroke="none" />
      </svg>
      <span className="sr-only sm:not-sr-only">Pedir orçamento</span>
    </a>
  );
}
