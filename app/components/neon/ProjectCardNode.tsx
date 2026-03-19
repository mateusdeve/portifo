"use client";

import { Handle, Position, type NodeProps } from "reactflow";

type ProjectCardData = {
  title?: string;
  header?: string;
  description?: string | null;
  image?: string | null;
  expanded?: boolean;
  url?: string | null;
};

export function ProjectCardNode({ data }: NodeProps<ProjectCardData>) {
  const expanded = Boolean(data?.expanded);
  const wrapperClassName = expanded
    ? "p-4 rounded-xl border border-primary/30 w-80 bg-[#f7f7f7] text-[#0e0e0e] shadow-[0_0_0_1px_rgba(107,254,156,0.15)]"
    : "p-4 rounded-xl glass-card border border-outline-variant/10 w-80 bg-surface-container-low text-on-surface-variant";

  const url = data?.url ?? null;

  return (
    <div className={wrapperClassName}>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <div className="flex items-start justify-between gap-2">
        <div
          className={
            expanded
              ? "text-[10px] font-label uppercase text-black/60"
              : "text-[10px] font-label uppercase text-on-surface-variant"
          }
        >
          {data?.header ?? "Projeto"}
        </div>

        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            onMouseDown={(e) => e.stopPropagation()}
            className={[
              "shrink-0 inline-flex items-center justify-center",
              "w-8 h-8 rounded-lg border transition-colors",
              expanded
                ? "border-primary/20 bg-[#ffffff]/80 hover:bg-[#ffffff] text-[#0e0e0e]"
                : "border-outline-variant/20 bg-transparent hover:bg-surface-container-highest/30 text-on-surface-variant",
            ].join(" ")}
            aria-label="Visitar"
            title="Visitar"
          >
            <span className="material-symbols-outlined text-[16px] align-middle">
              open_in_new
            </span>
          </a>
        ) : null}
      </div>

      {data?.image ? (
        <img
          alt={data.title ?? "Projeto"}
          src={data.image}
          className="mt-3 w-full h-20 rounded-xl object-cover border border-outline-variant/20"
        />
      ) : null}

      <div
        className={
          expanded
            ? "mt-3 text-sm font-semibold text-black/80"
            : "mt-3 text-sm font-semibold text-on-surface-variant/90"
        }
      >
        {data?.title ?? "Projeto"}
      </div>

      {data?.expanded && data?.description ? (
        <div className="mt-2 text-[13px] leading-relaxed text-black/80 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
          {data.description}
        </div>
      ) : null}
    </div>
  );
}

