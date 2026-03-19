"use client";

import { useEffect, useMemo, useState } from "react";
import profile from "../../../profile.json";

type Profile = typeof profile;

type TabKey = "skills" | "social";

export function ProfileModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [tab, setTab] = useState<TabKey>("skills");

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const skillsEntries = useMemo(() => Object.entries(profile.skills), []);

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0e0e0e]/70 backdrop-blur-xl flex items-center justify-center px-6"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg rounded-3xl glass-card border border-outline-variant/20 shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-6 border-b border-surface-container-high">
          <div className="flex items-center gap-4">
            <img
              src={profile.avatar_original}
              alt={profile.name}
              className="w-14 h-14 rounded-full border-2 border-surface-container-low bg-surface-container-highest object-cover"
            />

            <div>
              <div className="text-xs font-label uppercase tracking-[0.05em] text-on-surface-variant">
                {profile.name}
              </div>
              <div className="text-sm font-headline font-semibold text-on-surface">
                {profile.role}
              </div>
              <div className="text-[12px] text-on-surface-variant/80">
                {profile.company}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full px-3 py-2 border border-outline-variant/20 hover:bg-surface-container-highest transition-colors"
            aria-label="Fechar"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="px-6 pt-5">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setTab("skills")}
              className={[
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                tab === "skills"
                  ? "bg-primary-container text-on-primary-container"
                  : "text-on-surface-variant hover:bg-surface-container-highest",
              ].join(" ")}
            >
              Skills
            </button>
            <button
              onClick={() => setTab("social")}
              className={[
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                tab === "social"
                  ? "bg-primary-container text-on-primary-container"
                  : "text-on-surface-variant hover:bg-surface-container-highest",
              ].join(" ")}
            >
              Social
            </button>
          </div>

          <div className="space-y-4">
            <div className="text-[12px] text-on-surface-variant/90 leading-relaxed">
              {profile.bio}
            </div>

            {tab === "skills" ? (
              <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-4">
                <div className="text-xs font-label uppercase tracking-[0.05em] text-on-surface-variant mb-3">
                  Skills por área
                </div>
                <div className="space-y-3">
                  {skillsEntries.map(([group, items]) => (
                    <div key={group}>
                      <div className="text-sm font-headline font-semibold">
                        {group}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {items.map((s) => (
                          <span
                            key={s}
                            className="text-[12px] px-3 py-1 rounded-full border border-outline-variant/20 bg-transparent"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-4">
                <div className="text-xs font-label uppercase tracking-[0.05em] text-on-surface-variant mb-3">
                  Links
                </div>
                <div className="space-y-3">
                  <a
                    href={profile.social.github}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-xl border border-outline-variant/20 px-4 py-3 hover:bg-surface-container-highest transition-colors"
                  >
                    <span className="material-symbols-outlined align-middle mr-2 text-primary">
                      code
                    </span>
                    GitHub
                  </a>
                  <a
                    href={profile.social.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-xl border border-outline-variant/20 px-4 py-3 hover:bg-surface-container-highest transition-colors"
                  >
                    <span className="material-symbols-outlined align-middle mr-2 text-primary">
                      link
                    </span>
                    LinkedIn
                  </a>
                  {profile.blog ? (
                    <a
                      href={profile.blog}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-xl border border-outline-variant/20 px-4 py-3 hover:bg-surface-container-highest transition-colors"
                    >
                      <span className="material-symbols-outlined align-middle mr-2 text-primary">
                        article
                      </span>
                      Blog
                    </a>
                  ) : null}
                </div>
              </div>
            )}

            <div className="text-[12px] text-on-surface-variant/80 leading-relaxed">
              {profile.journey}
            </div>
          </div>
        </div>

        <div className="p-6 pt-4 border-t border-surface-container-high flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full text-sm font-medium text-on-surface hover:bg-surface-container-highest transition-colors active:scale-95"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

