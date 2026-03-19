"use client";

import { useEffect, useMemo, useState } from "react";
import { dispatchAgentLog } from "./agentLogBus";
import projects from "../../../projects.json";

type Project = {
  title?: string;
  image?: string;
  url?: string | null;
  category?: string;
};

export function MobileNavDrawer() {
  const [open, setOpen] = useState(false);
  const [githubReposCount, setGithubReposCount] = useState<number | null>(null);

  const projectsList = useMemo(
    () => (projects as unknown as Project[]).filter((p) => Boolean(p.image)),
    [],
  );

  const lastTwo = projectsList.slice(-2);
  const remainingCount = Math.max(0, projectsList.length - 2);

  const GITHUB_REPOS_LIMIT = 4;

  const dispatchSave = () => {
    window.dispatchEvent(new CustomEvent("neonflow:save"));
  };

  const dispatchPreset = (preset: string) => {
    window.dispatchEvent(
      new CustomEvent("neonflow:preset", { detail: { preset } }),
    );
  };

  useEffect(() => {
    const raw = window.localStorage.getItem("neonflow:githubReposCache:v1");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { repos?: any[] };
      if (!Array.isArray(parsed.repos)) return;
      setGithubReposCount(Math.min(parsed.repos.length, GITHUB_REPOS_LIMIT));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        className="fixed z-60 top-4 left-4 md:hidden w-10 h-10 rounded-xl glass-card border border-outline-variant/20 shadow-[0_18px_60px_rgba(0,0,0,0.6)] flex items-center justify-center"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        title="Menu"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Drawer */}
      {open ? (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="presentation"
          onMouseDown={() => setOpen(false)}
        >
          <div
            className="absolute inset-0 bg-black/50"
            aria-hidden="true"
          />

          <aside
            className="absolute left-0 top-0 h-full w-[320px] max-w-[86vw] bg-transparent-container-low border-r border-surface-container-high"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">
                    deployed_code
                  </span>
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-label uppercase tracking-[0.05em] text-on-surface-variant">
                    MATEUS PIRES
                  </div>
                  <div className="text-sm font-semibold font-headline">
                    Portfolio
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="w-10 h-10 rounded-xl glass-card border border-outline-variant/20 flex items-center justify-center"
                onClick={() => setOpen(false)}
                aria-label="Fechar menu"
                title="Fechar"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="px-4 pb-6 space-y-4">
              <div
                className="p-4 rounded-xl glass-card border border-outline-variant/10 cursor-pointer hover:bg-surface-container-highest/30 transition-colors"
                role="button"
                tabIndex={0}
                onClick={() => {
                  dispatchAgentLog({ group: "team" });
                  dispatchSave();
                  window.setTimeout(() => {
                    dispatchPreset("projectsOnly");
                  }, 0);
                  setOpen(false);
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-label uppercase text-on-surface-variant">
                    Projetos
                  </span>
                </div>

                <div className="flex -space-x-2">
                  <img
                    alt={lastTwo[0]?.title ?? "Projeto 1"}
                    className="w-8 h-8 rounded-full border-2 border-surface-container-low"
                    src={lastTwo[0]?.image ?? ""}
                  />
                  <img
                    alt={lastTwo[1]?.title ?? "Projeto 2"}
                    className="w-8 h-8 rounded-full border-2 border-surface-container-low"
                    src={lastTwo[1]?.image ?? ""}
                  />
                  <div className="w-8 h-8 rounded-full border-2 border-surface-container-low bg-surface-container-highest flex items-center justify-center text-[10px] text-on-surface-variant">
                    +{remainingCount}
                  </div>
                </div>
              </div>

              <div
                className="p-4 rounded-xl glass-card border border-outline-variant/10 cursor-pointer hover:bg-surface-container-highest/30 transition-colors"
                role="button"
                tabIndex={0}
                onClick={() => {
                  dispatchAgentLog({
                    group: "generic",
                    text: "Abrindo repositórios no flow.",
                  });
                  dispatchSave();
                  window.setTimeout(() => {
                    dispatchPreset("githubReposOnly");
                  }, 0);
                  setOpen(false);
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-label uppercase text-on-surface-variant">
                    GitHub
                  </span>
                  <span className="material-symbols-outlined text-primary">code</span>
                </div>

                <div className="text-[11px] text-on-surface-variant/90 leading-relaxed">
                  Repositórios no flow:{" "}
                  <span className="text-primary">
                    {githubReposCount ?? 0}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] text-on-surface-variant/80">
                    Abrir nodes conectados
                  </span>
                  <span className="material-symbols-outlined text-primary">
                    chevron_right
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}

