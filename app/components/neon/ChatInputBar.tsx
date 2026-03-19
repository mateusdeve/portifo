"use client";

import { useCallback, useState } from "react";

import { dispatchAgentLog } from "./agentLogBus";

const NEON_REACTFLOW_PROFILE_EVENT = "neonflow:profileNode";

function dispatchReactFlowProfileNode() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<null>(NEON_REACTFLOW_PROFILE_EVENT, { detail: null }),
  );
}

export function ChatInputBar() {
  const [value, setValue] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);

  const send = useCallback(() => {
    const msg = value.trim();
    if (!msg || loadingProfile) return;

    dispatchAgentLog({ group: "generic", text: `Você: ${msg}` });
    setValue("");

    setLoadingProfile(true);

    window.setTimeout(() => {
      setLoadingProfile(false);
      dispatchReactFlowProfileNode();
    }, 3000);
  }, [value, loadingProfile]);

  return (
    <>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 max-md:px-4 max-md:bottom-6">
        <div className="relative glass-card rounded-3xl border border-outline-variant/20 shadow-[0_20px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl z-50">
          {/* Brilho suave por cima */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-60 bg-[radial-gradient(circle_at_15%_30%,rgba(107,254,156,0.25),transparent_55%),radial-gradient(circle_at_85%_10%,rgba(0,220,255,0.18),transparent_50%)]" />

          <div className="relative flex items-center gap-3 px-5 py-3.5 max-md:px-4 max-md:py-3">
            <div className="shrink-0 flex items-center justify-center h-9 w-14 rounded-2xl border border-outline-variant/20 bg-surface-container-highest/10 text-on-surface-variant/90">
              <span className="text-[18px] leading-none">✨</span>
            </div>

            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              className="flex-1 bg-transparent text-on-surface placeholder:text-on-surface-variant/40 outline-none font-body text-[14px] max-md:text-[13.5px]"
              placeholder="Comece a conversa..."
              type="text"
              aria-label="Mensagem"
            />

            <div className="flex items-center gap-2">
              <button
                className="h-10 w-10 rounded-2xl border border-outline-variant/20 bg-surface-container-highest/10 hover:bg-surface-container-highest/20 text-on-surface-variant transition-colors active:scale-95"
                onClick={() => dispatchAgentLog({ group: "generic" })}
                aria-label="Microfone"
                title="Microfone"
                type="button"
              >
                <span className="material-symbols-outlined">mic</span>
              </button>
              <button
                className="h-10 w-10 rounded-2xl border border-outline-variant/20 bg-surface-container-highest/10 hover:bg-surface-container-highest/20 text-on-surface-variant transition-colors active:scale-95"
                onClick={() => dispatchAgentLog({ group: "generic" })}
                aria-label="Anexar"
                title="Anexar"
                type="button"
              >
                <span className="material-symbols-outlined">attach_file</span>
              </button>

              {loadingProfile ? (
                <button
                  type="button"
                  className="h-10 w-10 rounded-2xl bg-primary/20 text-on-surface-variant border border-primary/30 cursor-wait flex items-center justify-center active:scale-95 transition-transform"
                  aria-label="IA processando..."
                  disabled
                >
                  <span className="material-symbols-outlined animate-spin">
                    progress_activity
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  className="h-10 w-10 rounded-2xl bg-primary text-on-primary flex items-center justify-center active:scale-95 transition-transform hover:shadow-[0_0_18px_rgba(107,254,156,0.25)]"
                  onClick={send}
                  aria-label="Enviar"
                  title="Enviar"
                >
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

    </>
  );
}

