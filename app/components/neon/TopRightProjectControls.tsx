"use client";

import { useEffect, useState } from "react";
import { dispatchAgentLog } from "./agentLogBus";

export function TopRightProjectControls() {
  const username = "mateusdeve";
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showResumePreview, setShowResumePreview] = useState(false);
  const [resumeModalMode, setResumeModalMode] = useState<"preview" | "share">(
    "preview",
  );
  const resumeUrl = "/curriculo.pdf";
  const [portfolioUrl, setPortfolioUrl] = useState<string>(""); // usado no modal de compartilhar
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const cacheKey = "neonflow:githubUserAvatar:v1";
    const cacheRaw = window.localStorage.getItem(cacheKey);
    if (cacheRaw) {
      try {
        const parsed = JSON.parse(cacheRaw) as { url?: string; ts?: number };
        if (parsed?.url && parsed.ts && parsed.ts > Date.now() - 1000 * 60 * 60) {
          setAvatarUrl(parsed.url);
          return;
        }
      } catch {
        // ignorar cache inválido
      }
    }

    const run = async () => {
      try {
        const res = await fetch(`https://api.github.com/users/${username}`, {
          headers: { Accept: "application/vnd.github+json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { avatar_url?: string | null };
        const url = typeof data.avatar_url === "string" ? data.avatar_url : null;
        if (url) {
          window.localStorage.setItem(
            cacheKey,
            JSON.stringify({ url, ts: Date.now() }),
          );
          setAvatarUrl(url);
        }
      } catch {
        // sem avatar, mantém placeholder
      }
    };

    void run();
  }, []);

  useEffect(() => {
    if (!copySuccess) return;
    const t = window.setTimeout(() => setCopySuccess(false), 1800);
    return () => window.clearTimeout(t);
  }, [copySuccess]);

  return (
    <div className="flex items-center gap-4 fixed right-6 top-6 z-100 max-md:gap-2 max-md:right-3 max-md:top-3 max-md:flex-col max-md:items-end">
      <div className="flex items-center gap-3">
        <button
          className="px-6 py-2 rounded-full text-sm font-medium text-on-surface hover:bg-surface-container-highest transition-all active:scale-95 max-md:px-3 max-md:py-1.5 max-md:text-xs max-md:rounded-xl"
          onClick={() => {
            dispatchAgentLog({ group: "generic", text: "Abrindo prévia do currículo." });
            setResumeModalMode("preview");
            setShowResumePreview(true);
          }}
        >
          <span className="material-symbols-outlined text-[16px] align-middle mr-2">
            download_for_offline
          </span>
          Curriculo
        </button>

        <button
          className="px-6 py-2 rounded-full text-sm font-medium bg-primary-container text-on-primary-container hover:shadow-[0_0_10px_rgba(107,254,156,0.2)] transition-all active:scale-95 max-md:px-3 max-md:py-1.5 max-md:text-xs max-md:rounded-xl"
          onClick={() => {
            dispatchAgentLog({ group: "generic", text: "Abrindo compartilhamento do currículo." });
            setResumeModalMode("share");
            setPortfolioUrl(window.location.href);
            setShowResumePreview(true);
          }}
        >
          <span className="material-symbols-outlined text-[16px] align-middle mr-2">
            share
          </span>
          Compartilhar
        </button>
      </div>

      {showResumePreview ? (
        <div
          className="fixed inset-0 z-50"
          onMouseDown={() => setShowResumePreview(false)}
          onClick={() => setShowResumePreview(false)}
          role="presentation"
        >
          <div
            className="absolute right-6 top-16 w-[360px] rounded-2xl glass-card border border-outline-variant/20 shadow-[0_30px_90px_rgba(0,0,0,0.6)] overflow-hidden max-md:absolute max-md:right-1/2 max-md:-translate-x-1/2 max-md:top-12 max-md:w-[92vw]"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
            {resumeModalMode === "preview" ? (
              <div className="rounded-xl border border-outline-variant/20 overflow-hidden bg-surface-container-lowest/40">
                <iframe
                  title="Currículo"
                  src={`${resumeUrl}#page=1&view=FitH`}
                  className="w-full h-[200px]"
                />
              </div>
            ) : null}

              {resumeModalMode === "preview" ? (
                <a
                  href={resumeUrl}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 bg-primary text-on-primary hover:shadow-[0_0_10px_rgba(107,254,156,0.25)] transition-all active:scale-95"
                  onClick={() => setShowResumePreview(false)}
                >
                  <span className="material-symbols-outlined">download</span>
                  Download
                </a>
              ) : (
                <div className="mt-3 space-y-2">
                  <div className="rounded-xl border border-outline-variant/20 bg-surface-container-highest/10 overflow-hidden">
                    <div className="p-3">
                      <div className="flex items-center gap-2">
                        <input
                          value={portfolioUrl}
                          readOnly
                          className="flex-1 bg-transparent text-on-surface-variant/90 text-[12.5px] outline-none select-text"
                        />
                        <button
                          type="button"
                          className="shrink-0 rounded-lg border border-outline-variant/20 bg-surface-container-highest/20 hover:bg-surface-container-highest/30 px-2 py-2 transition-colors"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(
                                portfolioUrl || window.location.href,
                              );
                              dispatchAgentLog({
                                group: "generic",
                                text: "Link do portfólio copiado.",
                              });
                              setCopySuccess(true);
                            } catch {
                              dispatchAgentLog({
                                group: "generic",
                                text: "Não foi possível copiar. Selecione e copie manualmente.",
                              });
                            } finally {
                              // não feche o modal; apenas mostra feedback
                            }
                          }}
                          aria-label="Copiar link"
                          title="Copiar link"
                        >
                          <span
                            className={`material-symbols-outlined text-[16px] ${
                              copySuccess ? "text-primary" : "text-on-surface-variant/90"
                            }`}
                          >
                            {copySuccess ? "check_circle" : "content_copy"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-surface-container-high flex items-center justify-center overflow-hidden">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="GitHub avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="material-symbols-outlined text-primary">
            account_circle
          </span>
        )}
      </div>
    </div>
  );
}

