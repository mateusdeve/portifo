export function StatusPill() {
  return (
    <div className="absolute bottom-24 left-80 flex items-center gap-2 bg-surface-container-highest px-3 py-1.5 rounded-full border border-outline-variant/20 shadow-lg">
      <span className="material-symbols-outlined text-[16px] text-tertiary">
        cloud
      </span>
      <span className="text-[10px] font-label font-bold tracking-wider">
        73%
      </span>
    </div>
  );
}

