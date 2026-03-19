"use client";

import { Handle, Position, type NodeProps } from "reactflow";

type CategoryNodeData = {
  title?: string;
  subtitle?: string;
  count?: number;
  variant?: "root" | "category" | "circle";
};

export function CategoryNode({ data }: NodeProps<CategoryNodeData>) {
  const title = data?.title ?? "Categoria";
  const subtitle = data?.subtitle ?? "";
  const count = typeof data?.count === "number" ? data.count : undefined;
  const variant = data?.variant ?? "category";

  // Linguagens no workflow do GitHub: renderização compacta em "bolinha".
  if (variant === "circle") {
    return (
      <div
        className="relative w-[78px] h-[78px] rounded-full border shadow-[0_0_0_1px_rgba(107,254,156,0.12),0_0_35px_rgba(107,254,156,0.06)] bg-surface-container-low/60 flex items-center justify-center px-2"
        onMouseDown={(e) => e.stopPropagation()}
        title={title}
      >
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />

        <div className="text-center">
          <div className="text-[10px] font-mono text-on-surface-variant/90 leading-tight truncate">
            {title}
          </div>
          {typeof count === "number" ? (
            <div className="mt-1 inline-flex items-center gap-1 px-2 py-[2px] rounded-full border border-outline-variant/20 bg-surface-container-highest/20 text-[10px] text-on-surface-variant/70">
              {count}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className={[
        "rounded-2xl border shadow-[0_0_0_1px_rgba(107,254,156,0.12),0_0_35px_rgba(107,254,156,0.06)]",
        variant === "root" ? "bg-primary-container/20 border-primary/25" : "bg-surface-container-low border-outline-variant/20",
      ].join(" ")}
      onMouseDown={(e) => e.stopPropagation()}
      style={{ width: 260 }}
    >
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-label uppercase tracking-[0.08em] text-on-surface-variant/70">
              {variant === "root" ? "Workflow" : "Categoria"}
            </div>
            <div className="mt-1 text-sm font-headline font-semibold text-on-surface truncate">
              {title}
            </div>
            {subtitle ? (
              <div className="mt-1 text-[12px] text-on-surface-variant/80 truncate">
                {subtitle}
              </div>
            ) : null}
          </div>

          {typeof count === "number" ? (
            <div className="shrink-0 px-2.5 py-1 rounded-full border border-outline-variant/20 bg-surface-container-highest/20 text-[11px] text-on-surface-variant/90">
              {count}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

