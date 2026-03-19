"use client";

import { useMemo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";

type TextNodeData = {
  text?: string;
  header?: string;
};

export function TextNode({ data }: NodeProps<TextNodeData>) {
  const text = data?.text ?? "";
  const header = data?.header ?? "Texto";

  const lines = useMemo(() => text.split("\n"), [text]);

  return (
    <div
      className="p-4 rounded-2xl glass-card border border-outline-variant/20 w-[380px] bg-surface-container-low"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <div className="flex items-center justify-between gap-3">
        <div className="text-[10px] font-label uppercase tracking-[0.05em] text-on-surface-variant">
          {header}
        </div>
        <div className="text-[10px] text-on-surface-variant/60">↔</div>
      </div>

      <div className="mt-3">
        <div className="font-mono text-[12px] text-on-surface-variant/90 whitespace-pre-wrap leading-relaxed">
          {lines.map((l, i) => (
            <div key={`${i}-${l}`}>{l || "\u00A0"}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

