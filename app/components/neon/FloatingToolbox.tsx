"use client";

import { useCallback, useState } from "react";

import { dispatchAgentLog } from "./agentLogBus";
import { dispatchReactFlowUi } from "./reactFlowUiBus";
import { dispatchReactFlowAddTextNode } from "./reactFlowUserNodeBus";

export function FloatingToolbox() {
  const [clickEnabled, setClickEnabled] = useState(true);
  const [draft, setDraft] = useState("");
  const [creating, setCreating] = useState(false);

  const openCreate = useCallback(() => {
    setDraft("");
    setCreating(true);
  }, []);

  const closeCreate = useCallback(() => {
    setCreating(false);
    setDraft("");
  }, []);

  const confirmCreate = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    dispatchReactFlowAddTextNode({ text });
    dispatchAgentLog({ group: "toolbox", text: `Criando node: ${text}` });
    closeCreate();
  }, [draft, closeCreate]);

  const toggleClick = useCallback(() => {
    const next = !clickEnabled;
    setClickEnabled(next);
    dispatchReactFlowUi({ clickEnabled: next });
    dispatchAgentLog({ group: "toolbox", text: next ? "Clique habilitado." : "Clique desabilitado." });
  }, [clickEnabled]);

  return (
    <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-surface-container-low rounded-2xl flex flex-col items-center py-6 space-y-6 w-14 shadow-2xl border border-surface-container-high">
      <button
        className="text-outline-variant hover:text-[#6bfe9c] transition-all hover:scale-110"
        onClick={toggleClick}
      >
        <span className="material-symbols-outlined">
          {clickEnabled ? "touch_app" : "touch_app"}
        </span>
      </button>
      <button
        className="text-outline-variant hover:text-[#6bfe9c] transition-all hover:scale-110"
        onClick={() => dispatchAgentLog({ group: "generic" })}
      >
        <span className="material-symbols-outlined">pan_tool</span>
      </button>
      <button
        className="text-outline-variant hover:text-[#6bfe9c] transition-all hover:scale-110"
        onClick={() => dispatchAgentLog({ group: "generic" })}
      >
        <span className="material-symbols-outlined">image</span>
      </button>
      <button
        className="text-outline-variant hover:text-[#6bfe9c] transition-all hover:scale-110"
        onClick={() => dispatchAgentLog({ group: "generic" })}
      >
        <span className="material-symbols-outlined">palette</span>
      </button>
      <button
        className="text-outline-variant hover:text-[#6bfe9c] transition-all hover:scale-110"
        onClick={openCreate}
      >
        <span className="material-symbols-outlined">auto_awesome</span>
      </button>

      {creating ? (
        <div className="absolute -left-[320px] top-1/2 -translate-y-1/2 w-80 rounded-3xl glass-card border border-outline-variant/20 shadow-[0_40px_100px_rgba(0,0,0,0.55)] p-4 z-50">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-label uppercase tracking-[0.05em] text-on-surface-variant">
              Novo node
            </div>
            <button
              className="rounded-full p-2 border border-outline-variant/20 hover:bg-surface-container-highest transition-colors"
              onClick={closeCreate}
              aria-label="Fechar"
              type="button"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/40 rounded-2xl border border-outline-variant/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 shadow-2xl font-body p-3"
            placeholder="Digite um texto para o node..."
            rows={4}
          />

          <div className="mt-3 flex gap-2">
            <button
              className="flex-1 px-4 py-2 rounded-full text-sm font-medium text-on-surface-variant hover:bg-surface-container-highest transition-colors active:scale-95 border border-outline-variant/20"
              onClick={closeCreate}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="flex-1 px-4 py-2 rounded-full text-sm font-medium bg-primary-container text-on-primary-container hover:shadow-[0_0_10px_rgba(107,254,156,0.2)] transition-all active:scale-95"
              onClick={confirmCreate}
              type="button"
            >
              Criar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

