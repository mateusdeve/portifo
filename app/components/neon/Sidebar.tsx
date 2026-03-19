"use client";

import { useEffect, useState } from "react";
import { AgentLog } from "./AgentLog";
import { dispatchAgentLog } from "./agentLogBus";
import projects from "../../../projects.json";
import profile from "../../../profile.json";

export function NeonSidebar() {
  type Project = {
    title?: string;
    image?: string;
    url?: string | null;
  };

  const projectsList = (projects as unknown as Project[]).filter(
    (p) => typeof p.image === "string" && p.image.length > 0,
  );

  const lastTwo = projectsList.slice(-2);
  const remainingCount = Math.max(0, projectsList.length - 2);

  const GITHUB_REPOS_LIMIT = 4;
  const publicProjectsCount = projectsList
    .filter((p) => Boolean((p as Project).url))
    .slice(-GITHUB_REPOS_LIMIT).length;

  const [githubReposCount, setGithubReposCount] = useState<number | null>(null);

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

  const dispatchSave = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("neonflow:save"));
  };

  const dispatchPreset = (preset: string) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("neonflow:preset", {
        detail: { preset },
      }),
    );
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-[calc(100vh-0rem)] w-72 flex-col z-40 bg-transparent-container-low border-r border-surface-container-high">
      <div className="p-5 flex-1">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">
              deployed_code
            </span>
          </div>
          <div>
            <h3 className="text-xs font-label uppercase tracking-[0.05em] text-on-surface-variant">
              MATEUS PIRES
            </h3>
            <p className="text-sm font-semibold font-headline">Portfolio</p>
          </div>
        </div>

        <div className="space-y-4">
          <div
            className="p-4 rounded-xl glass-card border border-outline-variant/10 cursor-pointer hover:bg-surface-container-highest/30 transition-colors"
            role="button"
            tabIndex={0}
            onClick={() => {
              dispatchAgentLog({ group: "team" });
              dispatchSave();
              // garante que o save rode antes do preset aplicar (evita timing)
              window.setTimeout(() => {
                dispatchPreset("projectsOnly");
              }, 0);
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
                data-alt={lastTwo[0]?.title ?? "Projeto 1"}
                src={lastTwo[0]?.image ?? ""}
              />
              <img
                alt={lastTwo[1]?.title ?? "Projeto 2"}
                className="w-8 h-8 rounded-full border-2 border-surface-container-low"
                data-alt={lastTwo[1]?.title ?? "Projeto 2"}
                src={lastTwo[1]?.image ?? ""}
              />
              <div className="w-8 h-8 rounded-full border-2 border-surface-container-low bg-surface-container-highest flex items-center justify-center text-[10px] text-on-surface-variant">
                +{remainingCount}
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4 mt-5">
          <div
            className="p-4 rounded-xl glass-card border border-outline-variant/10 cursor-pointer hover:bg-surface-container-highest/30 transition-colors"
            role="button"
            tabIndex={0}
            onClick={() => {
              dispatchAgentLog({ group: "generic", text: "Abrindo repositórios no flow." });
              dispatchSave();
              window.setTimeout(() => {
                dispatchPreset("githubReposOnly");
              }, 0);
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
                {githubReposCount ?? publicProjectsCount}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-on-surface-variant/80">
                Abrir nodes conectados
              </span>
              <span className="material-symbols-outlined text-primary">chevron_right</span>
            </div>
          </div>
        </div>
      </div>

      <AgentLog />
    </aside>
  );
}

