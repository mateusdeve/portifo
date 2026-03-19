"use client";

import { useEffect, useMemo, useState } from "react";
import profile from "../../../profile.json";

type TabKey = "skills" | "social";

export function ProfileMiniCard({
  defaultTab = "skills",
}: {
  defaultTab?: TabKey;
}) {
  const [tab, setTab] = useState<TabKey>(defaultTab);

  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  const skillsEntries = useMemo(
    () => Object.entries(profile.skills),
    [],
  );

  return (
    <div
      className="fixed right-6 top-20 z-50 w-[320px] rounded-2xl glass-card border border-outline-variant/20 shadow-[0_40px_100px_rgba(0,0,0,0.45)] overflow-hidden"
      aria-label="Perfil (mini card)"
    >
      <div className="p-4 border-b border-surface-container-high">
        <div className="flex items-center gap-3">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-10 h-10 rounded-full border-2 border-surface-container-low bg-surface-container-highest object-cover"
          />

          <div className="min-w-0">
            <div className="text-xs font-label uppercase tracking-[0.05em] text-on-surface-variant">
              {profile.company}
            </div>
            <div className="text-sm font-headline font-semibold text-on-surface truncate">
              {profile.name}
            </div>
            <div className="text-[12px] text-on-surface-variant/80 truncate">
              {profile.role}
            </div>
          </div>
        </div>
      </div>

      <div className="p-3">
        <div className="flex gap-2">
          <button
            onClick={() => setTab("skills")}
            className={[
              "flex-1 rounded-full px-3 py-2 text-xs font-medium border transition-colors",
              tab === "skills"
                ? "bg-primary-container text-on-primary-container border-primary-container"
                : "bg-transparent text-on-surface-variant hover:bg-surface-container-highest/30 border-outline-variant/20",
            ].join(" ")}
          >
            Skills
          </button>
          <button
            onClick={() => setTab("social")}
            className={[
              "flex-1 rounded-full px-3 py-2 text-xs font-medium border transition-colors",
              tab === "social"
                ? "bg-primary-container text-on-primary-container border-primary-container"
                : "bg-transparent text-on-surface-variant hover:bg-surface-container-highest/30 border-outline-variant/20",
            ].join(" ")}
          >
            Social
          </button>
        </div>

        <div className="mt-3 space-y-3">
          {tab === "skills" ? (
            <div className="max-h-[240px] overflow-y-auto pr-1 no-scrollbar">
              {skillsEntries.map(([group, items]) => (
                <div key={group}>
                  <div className="text-[11px] font-label uppercase tracking-[0.05em] text-on-surface-variant">
                    {group}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {items.map((s) => (
                      <span
                        key={s}
                        className="text-[11px] px-2 py-1 rounded-full border border-outline-variant/20 bg-transparent text-on-surface-variant/90"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-h-[240px] overflow-y-auto pr-1 no-scrollbar">
              <a
                href={profile.social.github}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl border border-outline-variant/20 bg-transparent px-3 py-2 hover:bg-surface-container-highest transition-colors mb-2"
              >
                <span className="text-xs font-medium text-on-surface-variant">
                  GitHub
                </span>
                <span className="material-symbols-outlined text-primary">
                  open_in_new
                </span>
              </a>
              <a
                href={profile.social.linkedin}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl border border-outline-variant/20 bg-transparent px-3 py-2 hover:bg-surface-container-highest transition-colors mb-2"
              >
                <span className="text-xs font-medium text-on-surface-variant">
                  LinkedIn
                </span>
                <span className="material-symbols-outlined text-primary">
                  open_in_new
                </span>
              </a>

              {profile.blog ? (
                <a
                  href={profile.blog}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-xl border border-outline-variant/20 bg-transparent px-3 py-2 hover:bg-surface-container-highest transition-colors"
                >
                  <span className="text-xs font-medium text-on-surface-variant">
                    Blog
                  </span>
                  <span className="material-symbols-outlined text-primary">
                    open_in_new
                  </span>
                </a>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

