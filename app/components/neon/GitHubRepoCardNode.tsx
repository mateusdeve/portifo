"use client";

import { Handle, Position, type NodeProps } from "reactflow";

type GitHubRepoCardData = {
  header?: string;
  title?: string;
  description?: string | null;
  stars?: number;
  url?: string | null;
};

export function GitHubRepoCardNode({ data }: NodeProps<GitHubRepoCardData>) {
  const header = data?.header ?? "Repositório";
  const title = data?.title ?? "Projeto";

  const stars =
    typeof data?.stars === "number" && Number.isFinite(data.stars)
      ? data.stars
      : null;
  const url = data?.url ?? null;

  return (
    <div
      className="relative w-[280px] p-4 rounded-2xl glass-card border border-outline-variant/20 bg-surface-container-highest/10 shadow-[0_0_0_1px_rgba(107,254,156,0.12),0_0_35px_rgba(107,254,156,0.06)]"
      title={title}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Handles laterais para permitir conexões */}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-label uppercase tracking-[0.08em] text-on-surface-variant/70 truncate">
            {header}
          </div>
          <div className="mt-1 text-sm font-headline font-semibold text-on-surface-variant/95 truncate">
            {title}
          </div>
        </div>

        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            onMouseDown={(e) => e.stopPropagation()}
            className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg border border-outline-variant/20 bg-surface-container-highest/20 hover:bg-surface-container-highest/30 transition-colors"
            aria-label="Visitar repositório"
            title="Visitar"
          >
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant/90">
              open_in_new
            </span>
          </a>
        ) : null}
      </div>

      {data?.description ? (
        <div className="mt-2 text-[12.5px] leading-relaxed text-on-surface-variant/80 max-h-[72px] overflow-y-auto pr-1 no-scrollbar">
          {data.description}
        </div>
      ) : null}

      <div className="mt-3 flex items-center gap-2 text-[11px] text-on-surface-variant/70">
        <span className="material-symbols-outlined text-[15px] text-primary">
          star
        </span>
        <span className="truncate">
          {stars !== null ? `${stars.toLocaleString()} estrelas` : "—"}
        </span>
      </div>
    </div>
  );
}

