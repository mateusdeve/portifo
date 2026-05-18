'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════ */

const SKILLS = [
  { name: 'React / Next.js',       lvl: .96, years: '7 anos' },
  { name: 'TypeScript & JS',       lvl: .95, years: '7 anos' },
  { name: 'Node / Nest / Fastify', lvl: .88, years: '5 anos' },
  { name: 'n8n · Langchain · IA',  lvl: .82, years: '2 anos' },
  { name: 'Payload CMS · VTEX',    lvl: .80, years: '4 anos' },
  { name: 'PostgreSQL · MySQL',    lvl: .78, years: '5 anos' },
];

const TECH_STACK = [
  'Next.js', 'React', 'Vue', 'Astro', 'Tailwind',
  'Node', 'Nest', 'Fastify', 'Python', 'PHP',
  'Payload', 'VTEX IO',
];

const PROJECTS = [
  {
    n: '01',
    name: 'STJD',
    title: 'Superior Tribunal de Justiça Desportiva',
    desc: 'Site oficial do STJD: portal de notícias, base de jurisprudência, calendário de julgamentos e transmissão ao vivo das sessões plenárias. Liderei o desenvolvimento end-to-end.',
    tags: ['Next.js', 'Node', 'Tailwind', 'MySQL'],
    year: '2024',
    role: 'Lead Full Stack',
    client: 'Ready To Go',
    url: 'stjd.org.br',
    live: true,
  },
  {
    n: '02',
    name: 'ANRESF',
    title: 'Agência Reguladora do Fair Play Financeiro',
    desc: 'Site institucional do regulador apoiado pela CBF, com portal autenticado para clubes (\'Portal Fair Play\'). Stack Next.js + Payload CMS, do schema à UI.',
    tags: ['Next.js', 'Payload CMS', 'PostgreSQL'],
    year: '2024',
    role: 'Full Stack',
    client: 'Ready To Go',
    url: 'anresf.org.br',
    live: true,
  },
  {
    n: '03',
    name: 'Agente IA · S10x',
    title: 'Atendimento WhatsApp autônomo em produção',
    desc: 'Agente em produção no WhatsApp do produto S10x que responde dúvidas sozinho, integra base de conhecimento e libera o time humano para tarefas de maior valor.',
    tags: ['n8n', 'Langchain', 'Langgraph', 'OpenAI'],
    year: '2025',
    role: 'Engenheiro de IA',
    client: 'Ready To Go',
    url: null,
    live: false,
  },
  {
    n: '04',
    name: 'Comprar Bem',
    title: 'Loja completa na plataforma Shopify',
    desc: 'E-commerce do zero ao ar com tema customizado, integrações de pagamento, checkout otimizado e fluxos de pós-venda automatizados.',
    tags: ['Shopify', 'Liquid', 'TypeScript'],
    year: '2024',
    role: 'Full Stack',
    client: 'Cliente direto',
    url: 'comprarbem.store',
    live: true,
  },
  {
    n: '05',
    name: 'Track\'nMe',
    title: 'Sistema de rastreamento veicular',
    desc: 'Front-end completo de painel de rastreamento com mapas em tempo real, históricos de rota, alertas e gestão de frota.',
    tags: ['React', 'Redux', 'TypeScript'],
    year: '2021',
    role: 'Frontend Lead',
    client: 'Track\'nMe',
    url: null,
    live: false,
  },
  {
    n: '06',
    name: 'Lojas VTEX IO',
    title: 'Implantação de e-commerce headless',
    desc: 'Desenvolvimento de apps e implantação de múltiplas lojas na plataforma VTEX IO, com foco em performance e SEO técnico.',
    tags: ['VTEX IO', 'TypeScript', 'GraphQL'],
    year: '2020 – 2022',
    role: 'Frontend',
    client: 'CodeBy',
    url: null,
    live: false,
  },
];

const CONTACT = [
  { l: 'Email',    v: 'mateus.dev.ti@gmail.com',     href: 'mailto:mateus.dev.ti@gmail.com' },
  { l: 'Telefone', v: '(61) 98428-8058',             href: 'tel:+5561984288058' },
  { l: 'LinkedIn', v: '/in/mateussilveirapires',     href: 'https://linkedin.com/in/mateussilveirapires' },
  { l: 'GitHub',   v: '@mateusdeve',                 href: 'https://github.com/mateusdeve' },
];

/* ═══════════════════════════════════════════════════════
   SCENES
═══════════════════════════════════════════════════════ */

interface Scene {
  id: string;
  label: string;
  start: number;
  end: number;
}

const SCENES: Scene[] = [
  { id: 'intro',    label: 'Início',   start: 0,  end: 0  },
  { id: 'hero',     label: 'Hero',     start: 1,  end: 3  },
  { id: 'about',    label: 'Sobre',    start: 4,  end: 7  },
  { id: 'stack',    label: 'Stack',    start: 8,  end: 11 },
  { id: 'projects', label: 'Projetos', start: 12, end: 18 },
  { id: 'contact',  label: 'Contato',  start: 19, end: 20 },
];

const NAV_SCENES = SCENES.filter(s => s.id !== 'intro');
const TOTAL_STEPS = SCENES[SCENES.length - 1].end + 1;

const sceneOf = (step: number) =>
  SCENES.findIndex(s => step >= s.start && step <= s.end);

/* ═══════════════════════════════════════════════════════
   STEP-DRIVEN SCROLL HOOK
═══════════════════════════════════════════════════════ */

function useStepScroll(max: number) {
  const [step, setStep] = useState(0);
  const cooldownRef = useRef(false);
  const stepRef = useRef(0);
  stepRef.current = step;

  const advance = useCallback((delta: number) => {
    if (cooldownRef.current) return;
    const cur = stepRef.current;
    const next = Math.max(0, Math.min(max, cur + delta));
    if (next === cur) return;
    setStep(next);
    cooldownRef.current = true;
    setTimeout(() => { cooldownRef.current = false; }, 750);
  }, [max]);

  const jumpTo = useCallback((target: number) => {
    if (target === stepRef.current) return;
    setStep(Math.max(0, Math.min(max, target)));
    cooldownRef.current = true;
    setTimeout(() => { cooldownRef.current = false; }, 700);
  }, [max]);

  useEffect(() => {
    if (window.matchMedia('(max-width: 800px)').matches) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) < 8) return;
      advance(e.deltaY > 0 ? 1 : -1);
    };

    let touchStartY = 0, touchAcc = 0;
    const onTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; touchAcc = 0; };
    const onTouchMove = (e: TouchEvent) => { e.preventDefault(); touchAcc = touchStartY - e.touches[0].clientY; };
    const onTouchEnd = () => { if (Math.abs(touchAcc) > 40) advance(touchAcc > 0 ? 1 : -1); touchAcc = 0; };

    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (['ArrowDown', 'PageDown', ' ', 'ArrowRight'].includes(e.key)) { e.preventDefault(); advance(1); }
      else if (['ArrowUp', 'PageUp', 'ArrowLeft'].includes(e.key)) { e.preventDefault(); advance(-1); }
      else if (e.key === 'Home') { e.preventDefault(); jumpTo(0); }
      else if (e.key === 'End') { e.preventDefault(); jumpTo(max); }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKey);
    };
  }, [advance, jumpTo, max]);

  return { step, advance, jumpTo, setStep };
}

/* ═══════════════════════════════════════════════════════
   SPLASH HOOK
═══════════════════════════════════════════════════════ */

function useSplash() {
  useEffect(() => {
    const splash = document.getElementById('splash');
    const bar = document.getElementById('splash-bar');
    if (!splash || !bar) return;
    let p = 0;
    const id = setInterval(() => {
      p = Math.min(100, p + 10 + Math.random() * 12);
      bar.style.width = p + '%';
      if (p >= 100) { clearInterval(id); setTimeout(() => splash.classList.add('hidden'), 250); }
    }, 70);
    return () => clearInterval(id);
  }, []);
}

const rcls = (step: number, at: number, base = 'r') => `${base} ${step >= at ? 'in' : ''}`;

/* ═══════════════════════════════════════════════════════
   INTRO SCENE
═══════════════════════════════════════════════════════ */

function IntroScene({ active }: { active: boolean }) {
  const text = 'role para iniciar';
  const chars = Array.from(text);
  return (
    <div className={`scene intro-scene ${active ? 'active' : 'past'}`}>
      <div className="intro-content">
        <span className="intro-eyebrow">Mateus Pires · Portfolio 2026</span>
        <h1 className="intro-text">
          {chars.map((c, i) => (
            <span
              key={i}
              className={`ch ${c === ' ' ? 'sp' : ''}`}
              style={{ animationDelay: `${i * -120}ms` }}
            >
              {c === ' ' ? ' ' : c}
            </span>
          ))}
        </h1>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   HERO SCENE
═══════════════════════════════════════════════════════ */

function HeroScene({ step, active, jumpTo }: { step: number; active: boolean; jumpTo: (t: number) => void }) {
  const s = step - 1;
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active) v.play().catch(() => {});
    else v.pause();
  }, [active]);

  const isMobile = () => window.matchMedia('(max-width: 800px)').matches;

  const navTo = (sceneId: string, fallbackStep: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (isMobile()) {
      const el = document.getElementById(sceneId);
      if (el) window.scrollTo({ top: el.offsetTop - 60, behavior: 'smooth' });
    } else {
      jumpTo(fallbackStep);
    }
  };

  return (
    <div id="hero" className={`scene hero-scene ${active ? 'active' : (step > 3 ? 'past' : '')}`}>
      <div className="hero-video-wrap">
        <video
          ref={videoRef}
          className="hero-video"
          src="/hero-magnific.mp4"
          autoPlay muted loop playsInline preload="auto"
        />
      </div>
      <div className="hero-side-fade hero-side-fade--l" />
      <div className="hero-side-fade hero-side-fade--r" />
      <div className="hero-overlay" />
      <div className="hero-grain" />

      <div className="hero-inner">
        <div className="hero-meta">
          <span className={rcls(s, 0, 'r eyebrow')}>Brasília · DF — 7+ anos</span>
        </div>

        <h1 className="hero-name">
          <span className="ln">
            <span className={`wd ${s >= 0 ? 'in' : ''}`}>Mateus</span>
          </span>
          <span className="ln">
            <span className={`wd ${s >= 1 ? 'in' : ''}`}>Pires<em>.</em></span>
          </span>
        </h1>

        <div className="hero-foot">
          <p className={rcls(s, 1, 'r hero-role')}>
            <strong>Desenvolvedor Full Stack</strong> com 7+ anos construindo
            aplicações web — do front-end ao back-end. Atuei como dev principal
            em projetos institucionais do futebol brasileiro (STJD e ANRESF
            com apoio da CBF) e venho me especializando em agentes de IA.
          </p>
          <div className={rcls(s, 2, 'r hero-cta')}>
            <a href="#projects" className="btn btn-white" onClick={navTo('projects', 12)}>
              Ver projetos →
            </a>
            <a href="#contact" className="btn btn-ghost" onClick={navTo('contact', 19)}>
              Contato
            </a>
          </div>
        </div>
      </div>

      <div className={rcls(s, 2, 'r hero-bottom')}>
        <span>Brasília · UTC-3</span>
        <span>Continue scrollando ↓</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ABOUT SCENE
═══════════════════════════════════════════════════════ */

function AboutScene({ step, active }: { step: number; active: boolean }) {
  const s = step - 4;

  return (
    <div id="about" className={`scene ${active ? 'active' : (step > 7 ? 'past' : '')}`}>
      <div className="scene-inner">
        <div className="container-1320 about-grid">
          <div>
            <div>
              <span className={rcls(s, 0, 'r eyebrow')}>01 — Sobre</span>
              <h2 className={rcls(s, 0, 'r about-title')}>
                Engenharia que entende <em>negócio</em>,
                código que entende design.
              </h2>
            </div>
            <p className={rcls(s, 1, 'r about-p')}>
              <strong>Sou Mateus Pires</strong>, dev full stack baseado em Brasília
              com 7+ anos no jogo. Atuei como dev principal em projetos
              institucionais de alta visibilidade no ecossistema do futebol
              brasileiro (<em>STJD</em> e <em>ANRESF</em>, com apoio da CBF).
            </p>
            <p className={rcls(s, 1, 'r about-p')}>
              Forte vivência em React, Next.js e Node.js — e me especializando
              em <em>agentes de IA</em> com n8n, Langchain e Langgraph, incluindo
              um agente de WhatsApp em produção que atende clientes sozinho.
              Código limpo, boas práticas e produtos que entregam valor.
            </p>

            <div className={rcls(s, 2, 'r stats')}>
              <div className="stat">
                <div className="stat-n">7<span className="pct">+</span></div>
                <div className="stat-l">Anos de experiência</div>
              </div>
              <div className="stat">
                <div className="stat-n">06</div>
                <div className="stat-l">Projetos em destaque</div>
              </div>
              <div className="stat">
                <div className="stat-n">100<span className="pct">%</span></div>
                <div className="stat-l">Foco em entrega</div>
              </div>
            </div>
          </div>

          <div className={rcls(s, 3, 'r r-right about-photo-wrap')}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/avatar.png"
              alt="Mateus Pires"
              className="about-photo"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   STACK SCENE
═══════════════════════════════════════════════════════ */

function StackScene({ step, active }: { step: number; active: boolean }) {
  const s = step - 8;

  return (
    <div id="stack" className={`scene ${active ? 'active' : (step > 11 ? 'past' : '')}`}>
      <div className="scene-inner">
        <div className="container-1320 stack-layout">
          <div className="stack-left">
            <span className={rcls(s, 0, 'r eyebrow')}>02 — Tecnologias</span>
            <h2 className={rcls(s, 0, 'r about-title')}>
              Ferramentas que uso no <em>dia a dia</em>.
            </h2>
            <p className={rcls(s, 1, 'r about-p')}>
              Stack sólida em front-end e back-end, com especialização crescente
              em automação e <em>agentes de IA</em>. Cada tecnologia escolhida
              pelo impacto real que gera em produto.
            </p>

            <div className={rcls(s, 2, 'r tech-tags-big')}>
              {TECH_STACK.map((t, i) => (
                <span
                  key={t}
                  className="tech-tag-big"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className={rcls(s, 3, 'r r-right skills-card')}>
            <div className="skills-head">
              <h3>Stack &amp; habilidades</h3>
              <span>006 / 006</span>
            </div>
            {SKILLS.map((k, i) => (
              <div
                className={`skill ${s >= 3 ? 'in' : ''}`}
                key={k.name}
                style={{ '--lvl': k.lvl, transitionDelay: `${i * 80}ms` } as React.CSSProperties}
              >
                <div className="skill-top">
                  <span className="skill-name">{k.name}</span>
                  <span className="skill-meta">{k.years}</span>
                </div>
                <div className="skill-bar">
                  <div className="skill-fill" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PROJECTS SCENE
═══════════════════════════════════════════════════════ */

function ProjectsScene({ step, active }: { step: number; active: boolean }) {
  const s = step - 12;

  return (
    <div id="projects" className={`scene ${active ? 'active' : (step > 18 ? 'past' : '')}`}>
      <div className="scene-inner">
        <div className="container-1320 proj-stage">
          <div className="proj-head">
            <div>
              <span className={rcls(s, 0, 'r eyebrow')}>02 — Trabalhos selecionados</span>
              <h2 className={rcls(s, 0, 'r proj-head-l')}>
                Seis cases que <em>moveram</em> números reais.
              </h2>
            </div>
            <div className={rcls(s, 0, 'r proj-counter')}>
              {s <= 0 ? '00 / 06' : `${String(Math.min(s, 6)).padStart(2, '0')} / 06`}
            </div>
          </div>

          <div className="proj-card-stack">
            {PROJECTS.map((p, i) => {
              const cls = s - 1 === i ? 'show' : s - 1 > i ? 'past' : '';
              return (
                <article className={`proj-card ${cls}`} key={p.n}>
                  <div className="proj-info">
                    <div className="proj-head-row">
                      <span className="proj-num">{p.n} / 06</span>
                      <span className="proj-year">{p.year}</span>
                      {p.live && p.url && (
                        <a className="proj-url-pill" href={`https://${p.url}`} target="_blank" rel="noreferrer">
                          {p.url} <span className="arrow">↗</span>
                        </a>
                      )}
                    </div>
                    <h3 className="proj-name">
                      {p.name} <em>—</em> {p.title}
                    </h3>
                    <p className="proj-desc">{p.desc}</p>
                    <div className="proj-tags">
                      {p.tags.map((t) => <span className="proj-tag" key={t}>{t}</span>)}
                    </div>
                    <div className="proj-meta-row">
                      <span>Papel · <b>{p.role}</b></span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className={rcls(s, 0, 'r proj-dots')}>
            {PROJECTS.map((_, i) => (
              <span key={i} className={`proj-dot ${s - 1 === i ? 'on' : ''}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   CONTACT SCENE
═══════════════════════════════════════════════════════ */

function ContactScene({ step, active }: { step: number; active: boolean }) {
  const s = step - 19;
  return (
    <div id="contact" className={`scene contact-scene ${active ? 'active' : ''}`}>
      <div className="contact-inner">
        <div className="container-1320 contact-grid">
          <div>
            <span className={rcls(s, 0, 'r eyebrow')}>03 — Contato</span>
            <h2 className={rcls(s, 0, 'r contact-big')}>
              Vamos construir <em>algo bom</em> juntos?
            </h2>
          </div>
          <div className="contact-side">
            {CONTACT.map((c, i) => (
              <a
                key={c.l}
                className={rcls(s, 1, 'r contact-link')}
                style={{ transitionDelay: `${i * 80}ms` }}
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
              >
                <div>
                  <span className="label">{c.l}</span>
                  {c.v}
                </div>
                <span className="arrow">↗</span>
              </a>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   NAV
═══════════════════════════════════════════════════════ */

function Nav({ step, jumpTo }: { step: number; jumpTo: (t: number) => void }) {
  const activeScene = sceneOf(step);

  const handleNavClick = (sc: Scene) => {
    if (window.matchMedia('(max-width: 800px)').matches) {
      const el = document.getElementById(sc.id);
      if (el) window.scrollTo({ top: el.offsetTop - 60, behavior: 'smooth' });
    } else {
      jumpTo(sc.start);
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.matchMedia('(max-width: 800px)').matches) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      jumpTo(0);
    }
  };

  return (
    <header className="nav">
      <a href="#" className="logo" onClick={handleLogoClick}>
        Mateus Pires<span className="logo-dot" />
      </a>
      <nav>
        <ul className="nav-links">
          {NAV_SCENES.map((sc) => (
            <li key={sc.id} className={SCENES[activeScene]?.id === sc.id ? 'active' : ''}>
              <button onClick={() => handleNavClick(sc)}>{sc.label}</button>
            </li>
          ))}
        </ul>
      </nav>
      <div />
    </header>
  );
}

/* ═══════════════════════════════════════════════════════
   STEP RAIL & COUNTER
═══════════════════════════════════════════════════════ */

function StepRail({ step }: { step: number }) {
  return (
    <div className="step-rail" aria-hidden="true">
      {SCENES.map((sc) => {
        const stepCount = sc.end - sc.start + 1;
        return (
          <div className="step-rail-group" key={sc.id}>
            {Array.from({ length: stepCount }).map((_, i) => {
              const absStep = sc.start + i;
              let cls = '';
              if (absStep === step) cls = 'active';
              else if (absStep < step) cls = 'done';
              return <span key={i} className={`step-rail-tick ${cls}`} />;
            })}
          </div>
        );
      })}
    </div>
  );
}

function StepCounter({ step }: { step: number }) {
  const activeScene = sceneOf(step);
  const prog = step / (TOTAL_STEPS - 1);
  return (
    <div className="step-counter" style={{ '--prog': prog } as React.CSSProperties}>
      <span>
        <strong>{String(step + 1).padStart(2, '0')}</strong>
        <span> / {String(TOTAL_STEPS).padStart(2, '0')}</span>
      </span>
      <span className="step-counter-line" />
      <span>{SCENES[activeScene]?.label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   CURSOR
═══════════════════════════════════════════════════════ */

function Cursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const posRef  = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const rafRef  = useRef<number>(0);

  useEffect(() => {
    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const onMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };

    const loop = () => {
      const { x, y } = posRef.current;
      ringPos.current.x += (x - ringPos.current.x) * 0.12;
      ringPos.current.y += (y - ringPos.current.y) * 0.12;
      ring.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px)`;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    const expand   = () => ring.classList.add('expanded');
    const collapse = () => ring.classList.remove('expanded');
    document.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('mouseenter', expand);
      el.addEventListener('mouseleave', collapse);
    });

    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div ref={dotRef}  className="cur-dot"  aria-hidden="true" />
      <div ref={ringRef} className="cur-ring" aria-hidden="true" />
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   SPLASH
═══════════════════════════════════════════════════════ */

function Splash() {
  return (
    <div className="splash" id="splash">
      <span>Mateus Pires — carregando</span>
      <span className="splash-bar" id="splash-bar" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════ */

export default function Portfolio() {
  useSplash();

  const { step, jumpTo, setStep } = useStepScroll(TOTAL_STEPS - 1);

  useEffect(() => {
    (window as Window & { __jumpTo?: (t: number) => void }).__jumpTo = jumpTo;
  }, [jumpTo]);

  useEffect(() => {
    if (!window.matchMedia('(max-width: 800px)').matches) return;
    const observers = SCENES.map((sc) => {
      const el = document.getElementById(sc.id);
      if (!el) return null;
      const io = new IntersectionObserver(
        (entries) => entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio >= 0.45) setStep(sc.start);
        }),
        { threshold: [0.45, 0.55] }
      );
      io.observe(el);
      return io;
    });
    return () => observers.forEach((o) => o && o.disconnect());
  }, [setStep]);

  const activeIdx = sceneOf(step);

  return (
    <>
      <Cursor />
      <Splash />
      <Nav step={step} jumpTo={jumpTo} />
      <StepRail step={step} />
      <StepCounter step={step} />

      <div className="stage">
        <IntroScene    active={activeIdx === 0} />
        <HeroScene     step={step} active={activeIdx === 1} jumpTo={jumpTo} />
        <AboutScene    step={step} active={activeIdx === 2} />
        <StackScene    step={step} active={activeIdx === 3} />
        <ProjectsScene step={step} active={activeIdx === 4} />
        <ContactScene  step={step} active={activeIdx === 5} />
      </div>
    </>
  );
}
