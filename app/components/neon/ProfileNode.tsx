"use client";

import { Handle, Position, type NodeProps } from "reactflow";
import { useEffect, useMemo, useState } from "react";
import profile from "../../../profile.json";
import projects from "../../../projects.json";

type ProfileNodeData = {
  tab?: "skills" | "social";
  header?: string;
  showProjectSummarizer?: boolean;
  showGithubSummarizer?: boolean;
};

export const PROFILE_NODE_ID = "profileNode";

export function ProfileNode({ data }: NodeProps<ProfileNodeData>) {
  const [tab, setTab] = useState<"skills" | "social">(
    data?.tab ?? "skills",
  );

  const [summarizing, setSummarizing] = useState(false);
  const [summaryKind, setSummaryKind] = useState<"projects" | "github">(
    "projects",
  );
  const [thinkingStep, setThinkingStep] = useState(0);
  const [summary, setSummary] = useState<string | null>(null);
  const allowProjects = data?.showProjectSummarizer !== false;
  const allowGithub = data?.showGithubSummarizer === true;

  // Se o workflow trocar e esconder um tipo, limpa o estado.
  useEffect(() => {
    if (summaryKind === "projects" && !allowProjects) {
      setSummary(null);
      setSummarizing(false);
      setThinkingStep(0);
    }
    if (summaryKind === "github" && !allowGithub) {
      setSummary(null);
      setSummarizing(false);
      setThinkingStep(0);
    }
  }, [allowGithub, allowProjects, summaryKind]);

  const skillsEntries = useMemo(
    () => Object.entries(profile.skills),
    [],
  );

  const projectsList = useMemo(() => {
    const list = projects as unknown as Array<{
      title?: string;
      description?: string;
      url?: string | null;
    }>;
    return list.filter((p) => typeof p.title === "string" && p.title.length > 0);
  }, []);

  const [githubRepos, setGithubRepos] = useState<
    Array<{
      id?: number;
      name?: string;
      description?: string | null;
      html_url?: string;
      stargazers_count?: number;
      language?: string | null;
      fork?: boolean;
    }>
  >([]);

  useEffect(() => {
    const username = "mateusdeve";
    const cacheKey = "neonflow:githubReposCache:v1";
    const cacheTtlMs = 1000 * 60 * 30;

    const fromCache = () => {
      const raw = window.localStorage.getItem(cacheKey);
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw) as { ts?: number; repos?: any[] };
        if (!parsed?.ts || parsed.ts < Date.now() - cacheTtlMs) return null;
        if (!Array.isArray(parsed.repos)) return null;
        return parsed.repos as any[];
      } catch {
        return null;
      }
    };

    const normalize = (repos: any[]) =>
      repos
        .filter((r) => typeof r?.name === "string" && typeof r?.html_url === "string")
        .map((r) => ({
          id: r.id as number | undefined,
          name: r.name as string | undefined,
          description: (typeof r.description === "string" ? r.description : null) as
            | string
            | null,
          html_url: r.html_url as string | undefined,
          stargazers_count: (typeof r.stargazers_count === "number"
            ? r.stargazers_count
            : 0) as number,
          language: (typeof r.language === "string" ? r.language : null) as
            | string
            | null,
          fork: Boolean(r.fork),
        }));

    const cached = fromCache();
    if (cached) {
      setGithubRepos(normalize(cached));
      return;
    }

    const run = async () => {
      try {
        const perPage = 100;
        let page = 1;
        const all: any[] = [];
        while (true) {
          const url = `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${page}`;
          const res = await fetch(url, {
            headers: { Accept: "application/vnd.github+json" },
          });
          if (!res.ok) break;
          const pageRepos = (await res.json()) as any[];
          if (!Array.isArray(pageRepos) || pageRepos.length === 0) break;
          all.push(...pageRepos);
          if (pageRepos.length < perPage) break;
          page++;
        }
        setGithubRepos(normalize(all));
      } catch {
        // sem github repos, ok
      }
    };

    void run();
  }, []);

  const pickRandom = <T,>(arr: T[]) =>
    arr[Math.floor(Math.random() * Math.max(1, arr.length))]!;

  const projectsSummaryResponses = useMemo(() => {
    const total = projectsList.length;
    const withUrl = projectsList.filter((p) => Boolean(p.url)).length;
    const topTitles = projectsList.slice(0, 4).map((p) => p.title).join(", ");
    const samples = projectsList
      .slice(0, 6)
      .map((p) => p.title)
      .filter(Boolean);

    const responses = [
      `Resumo rápido do portfolio:\n- Total: ${total}\n- Com link: ${withUrl}\n- Destaques: ${topTitles}\n\nPróximo passo: conecta esses nós e desenha o fluxo.`,
      `Eu li seus projetos e já deu pra ver o padrão: entrega + performance + UX.\n\n- Quantidade: ${total}\n- Públicos: ${withUrl}\n- Top: ${topTitles}`,
      `Ok, “modo resumidor” ativado.\n\nVocê tem ${total} projetos (com ${withUrl} publicáveis). Se eu tivesse que escolher 3 pra mostrar em 10s: ${samples.slice(0, 3).join(", ")}.`,
      `Seu portfolio está bem redondo.\n\n- Volume: ${total}\n- Links: ${withUrl}\n- Narrativa sugerida: “construo interfaces, automoção e integrações end‑to‑end”.`,
      `Resumo executivo:\n${total} projetos no catálogo, ${withUrl} com link.\nDestaques: ${topTitles}.\n\nSe quiser, eu monto um pitch de 30s em cima disso.`,
      `O que dá pra sentir pelos projetos: foco em solução prática.\n\nHoje eu apresentaria assim:\n- ${samples.slice(0, 1).join("")} (institucional)\n- ${samples.slice(1, 2).join("")} (conversão)\n- ${samples.slice(2, 3).join("")} (produto/sistema)`,
      `Resumo “em 4 bullets”:\n- ${total} projetos no total\n- ${withUrl} com link\n- Stack recorrente: Next.js/Tailwind + backend\n- Forte em páginas de venda e sistemas internos`,
      `Se eu fosse seu recruiter por 20s:\n“Mateus entrega produtos web completos. Tem ${total} projetos no portfolio e ${withUrl} com link. Destaques: ${topTitles}.”`,
      `Leitura do portfolio:\nVocê tem ${total} cases e dá pra organizar em 3 grupos: institucionais, landing pages e sistemas.\nOs mais chamativos agora: ${topTitles}.`,
      `Resumo com sugestão de ordem:\n1) ${samples.slice(0, 1).join("")}\n2) ${samples.slice(1, 2).join("")}\n3) ${samples.slice(2, 3).join("")}\n\nTotal: ${total} (links: ${withUrl}).`,
    ];

    return responses;
  }, [projectsList]);

  const githubSummaryResponses = useMemo(() => {
    const total = githubRepos.length;
    const forks = githubRepos.filter((r) => r.fork).length;
    const langs = githubRepos
      .map((r) => r.language)
      .filter(Boolean) as string[];
    const topLangs = Array.from(
      langs.reduce((m, l) => m.set(l, (m.get(l) ?? 0) + 1), new Map<string, number>()),
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([l]) => l)
      .join(", ");

    const topRepos = githubRepos
      .slice()
      .sort((a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0))
      .slice(0, 5)
      .map((r) => r.name)
      .filter(Boolean)
      .join(", ");

    const responses = [
      `Resumo GitHub (público):\n- Repos: ${total}\n- Forks: ${forks}\n- Linguagens mais comuns: ${topLangs || "—"}\n- Top por estrelas: ${topRepos || "—"}`,
      `Scan do GitHub completo.\nVocê tem ${total} repositórios públicos (forks: ${forks}).\nAs linguagens que mais aparecem: ${topLangs || "sem dados"}.\nTop repos: ${topRepos || "sem dados"}.`,
      `Resumo “neural” do GitHub:\n${total} repos detectados.\nConectei todos no seu perfil pra virar uma rede.\nDestaques: ${topRepos || "—"}.`,
      `Ok, eu “li” seu GitHub.\n- Total: ${total}\n- Forks: ${forks}\n- Stack predominante: ${topLangs || "—"}\n\nPróximo: transformar os melhores repos em um pitch.`,
      `Resumo GitHub (mockado, mas baseado nos dados):\nRepositórios: ${total}\nLinguagens: ${topLangs || "—"}\nTop: ${topRepos || "—"}\n\nQuer que eu filtre só os não-forks?`,
      `Se eu tivesse que mostrar 3 repos agora:\n${githubRepos
        .slice(0, 3)
        .map((r) => `- ${r.name}`)
        .join("\n") || "- (nenhum)"}\n\nTotal geral: ${total}.`,
      `GitHub overview:\n${total} repos no total.\nMais comuns: ${topLangs || "—"}.\nOs mais estrelados: ${topRepos || "—"}.\n\nTudo pronto pra virar “mapa mental” em nodes.`,
      `Resumo GitHub curto:\n${total} repos, ${forks} forks.\nTop linguagens: ${topLangs || "—"}.\nTop repos: ${topRepos || "—"}.`,
      `Leitura rápida do GitHub:\n- Volume: ${total}\n- Concentração: ${topLangs || "—"}\n- Destaques: ${topRepos || "—"}\n\nBora plugar isso no flow e salvar.`,
      `Ok, GitHub analisado.\nVocê tem ${total} repositórios e um mix interessante.\nSe eu fosse apresentar: “stack: ${topLangs || "—"}, repos destaque: ${topRepos || "—"}”.`,
    ];

    return responses;
  }, [githubRepos]);

  const startSummary = (kind: "projects" | "github") => {
    if (summarizing) return;
    setSummaryKind(kind);
    setSummary(null);
    setThinkingStep(0);
    setSummarizing(true);

    window.setTimeout(() => setThinkingStep(1), 900);
    window.setTimeout(() => setThinkingStep(2), 1600);

    window.setTimeout(() => {
      setSummarizing(false);
      setThinkingStep(0);
      setSummary(
        kind === "projects"
          ? pickRandom(projectsSummaryResponses)
          : pickRandom(githubSummaryResponses),
      );
    }, 3000);
  };

  return (
    <div
      className="relative overflow-hidden p-4 rounded-2xl glass-card border border-primary/30 w-[420px] bg-surface-container-low ring-1 ring-primary/20 shadow-[0_0_0_1px_rgba(107,254,156,0.2),0_0_35px_rgba(107,254,156,0.12)]"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Overlay visual para dar profundidade ao node */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-90"
        style={{
          background:
            "radial-gradient(circle at 20% 0%, rgba(107,254,156,0.22), transparent 55%), radial-gradient(circle at 95% 15%, rgba(0,220,255,0.16), transparent 50%), linear-gradient(rgba(19,19,19,0.25), rgba(19,19,19,0.25))",
        }}
      />

      <div className="relative z-10">
        {/* Alinha conexões: incoming no lado esquerdo e outgoing no lado direito. */}
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-10 h-10 rounded-full border-2 border-surface-container-low bg-surface-container-highest object-cover"
            />
            <div className="min-w-0">
              <div className="text-xs font-label uppercase tracking-[0.08em] text-on-surface-variant/80">
                {data?.header ?? "Perfil"}
              </div>
              <div className="text-sm font-headline font-semibold text-on-surface truncate">
                {profile.name}
              </div>
              <div className="text-[12px] text-on-surface-variant/80 truncate">
                {profile.role}
              </div>
            </div>
          </div>
          <div className="shrink-0 px-2.5 py-1 rounded-full border border-primary/25 bg-primary-container/10 text-primary text-[11px] font-medium">
            stack
          </div>
        </div>

        <div className="mt-4 flex gap-2">
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => setTab("skills")}
          className={[
            "flex-1 rounded-full px-3 py-2 text-xs font-medium border transition-colors",
            tab === "skills"
              ? "bg-linear-to-r from-primary-container to-primary-fixed-dim/70 text-on-primary-container border-primary-container/50 shadow-[0_0_0_1px_rgba(107,254,156,0.25)]"
              : "bg-transparent text-on-surface-variant hover:bg-surface-container-highest/30 border-outline-variant/20",
          ].join(" ")}
          type="button"
        >
          Skills
        </button>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => setTab("social")}
          className={[
            "flex-1 rounded-full px-3 py-2 text-xs font-medium border transition-colors",
            tab === "social"
              ? "bg-linear-to-r from-primary-container to-primary-fixed-dim/70 text-on-primary-container border-primary-container/50 shadow-[0_0_0_1px_rgba(107,254,156,0.25)]"
              : "bg-transparent text-on-surface-variant hover:bg-surface-container-highest/30 border-outline-variant/20",
          ].join(" ")}
          type="button"
        >
          Social
        </button>
        </div>

        <div className="mt-3 space-y-3">
        {tab === "skills" ? (
          <div className="max-h-[180px] overflow-y-auto pr-1 no-scrollbar">
            {skillsEntries.map(([group, items]) => (
              <div key={group} className="mb-4">
                <div className="text-[11px] font-label uppercase tracking-[0.05em] text-on-surface-variant">
                  {group}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {items.map((s) => (
                    <span
                      key={s}
                      className="text-[11px] px-2 py-1 rounded-full border border-outline-variant/20 bg-transparent text-on-surface-variant/90"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-h-[180px] overflow-y-auto pr-1 no-scrollbar">
            <a
              onMouseDown={(e) => e.stopPropagation()}
              href={profile.social.github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-xl border border-outline-variant/20 bg-transparent px-3 py-3 hover:bg-surface-container-highest/30 transition-colors mb-2"
            >
              <span className="text-xs font-medium text-on-surface-variant">
                GitHub
              </span>
              <span className="material-symbols-outlined text-primary">
                open_in_new
              </span>
            </a>
            <a
              onMouseDown={(e) => e.stopPropagation()}
              href={profile.social.linkedin}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-xl border border-outline-variant/20 bg-transparent px-3 py-3 hover:bg-surface-container-highest/30 transition-colors mb-2"
            >
              <span className="text-xs font-medium text-on-surface-variant">
                LinkedIn
              </span>
              <span className="material-symbols-outlined text-primary">
                open_in_new
              </span>
            </a>
            {profile.blog ? (
              <a
                onMouseDown={(e) => e.stopPropagation()}
                href={profile.blog}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl border border-outline-variant/20 bg-transparent px-3 py-3 hover:bg-surface-container-highest/30 transition-colors"
              >
                <span className="text-xs font-medium text-on-surface-variant">
                  Blog
                </span>
                <span className="material-symbols-outlined text-primary">
                  open_in_new
                </span>
              </a>
            ) : null}
          </div>
        )}
      </div>

      <div className="mt-4">
        {allowProjects ? (
          <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => startSummary("projects")}
          disabled={summarizing}
          className={[
            "w-full rounded-xl px-3 py-3 border transition-colors flex items-center justify-center gap-2",
            summarizing
              ? "bg-surface-container-highest/30 border-outline-variant/20 text-on-surface-variant cursor-wait"
              : "bg-transparent hover:bg-surface-container-highest/30 border-outline-variant/20 text-on-surface-variant",
          ].join(" ")}
        >
          <span className="material-symbols-outlined text-primary">
            {summarizing ? "auto_awesome" : "summarize"}
          </span>
          <span className="text-xs font-medium">
            {summarizing ? "Pensando..." : "Resumidor (Projetos)"}
          </span>
        </button>
        ) : null}

        {allowGithub ? (
          <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={() => startSummary("github")}
          disabled={summarizing}
          className={[
            (allowProjects ? "mt-2 " : "") +
              "w-full rounded-xl px-3 py-3 border transition-colors flex items-center justify-center gap-2",
            summarizing
              ? "bg-surface-container-highest/30 border-outline-variant/20 text-on-surface-variant cursor-wait"
              : "bg-transparent hover:bg-surface-container-highest/30 border-outline-variant/20 text-on-surface-variant",
          ].join(" ")}
        >
          <span className="material-symbols-outlined text-primary">
            {summarizing ? "auto_awesome" : "code"}
          </span>
          <span className="text-xs font-medium">
            {summarizing ? "Pensando..." : "Resumidor (GitHub)"}
          </span>
        </button>
        ) : null}

        {summarizing ? (
          <div className="mt-3 rounded-xl border border-outline-variant/20 bg-surface-container-highest/20 p-3">
            <div className="flex items-center gap-2 text-[12px] text-on-surface-variant/90">
              <span className="material-symbols-outlined animate-spin text-primary">
                progress_activity
              </span>
              <span>
                {thinkingStep === 0
                  ? summaryKind === "github"
                    ? "Lendo seus repositórios públicos..."
                    : "Analisando seus projetos..."
                  : thinkingStep === 1
                    ? "Organizando informações..."
                    : "Montando o resumo..."}
              </span>
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-3 w-11/12 rounded-full bg-on-surface-variant/10 animate-pulse" />
              <div className="h-3 w-9/12 rounded-full bg-on-surface-variant/10 animate-pulse" />
              <div className="h-3 w-7/12 rounded-full bg-on-surface-variant/10 animate-pulse" />
            </div>
          </div>
        ) : summary ? (
          <div className="mt-3 rounded-xl border border-outline-variant/20 bg-surface-container-low p-3">
            <div className="text-[11px] font-label uppercase tracking-[0.05em] text-on-surface-variant/80">
              {summaryKind === "github"
                ? "Resumo do GitHub"
                : "Resumo dos projetos"}
            </div>
            <pre className="mt-2 whitespace-pre-wrap text-[12.5px] leading-relaxed text-on-surface-variant/90 font-mono">
              {summary}
            </pre>
          </div>
        ) : null}
        </div>
      </div>
    </div>
  );
}

