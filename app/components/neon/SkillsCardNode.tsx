"use client";

import { Handle, Position, type NodeProps } from "reactflow";

type SkillsCardData = {
  expanded?: boolean;
  skills?: string[];
};

export function SkillsCardNode({ data }: NodeProps<SkillsCardData>) {
  return (
    <div className="p-4 rounded-xl glass-card border border-outline-variant/10 w-72 bg-surface-container-low">
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-label uppercase text-on-surface-variant">
          Times
        </span>
      </div>

      <div className="flex -space-x-2">
        <img
          alt="User 1"
          className="w-8 h-8 rounded-full border-2 border-surface-container-low"
          data-alt="Female software developer portrait"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPxIEgS7TKAfiskuthg6XI32C1bnguzBhp5UJ-_t0-MDiLLVrYx23QlNWL2IEiS60B0erMBFuqz3RFYKeZ5j7PiLKekNt6YqFNMVkz-Ec-1PzwtJggleMPSsGQSLkNI4CEyIRi1Df8tOwxErOKMQWV9al-yZCYQ0Q70YfMwxowy6dgxI3GAAkjd8APUQL_-XUN7kDdeX3r8sh4g89Zi6IQfnTTbMG4Ps_3yMLLq1PBrX9YPgwK518J61v5B20TRJGbx52OgzRrr8k"
        />
        <img
          alt="User 2"
          className="w-8 h-8 rounded-full border-2 border-surface-container-low"
          data-alt="Male designer portrait"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpdBVYKMQN1oCXxzqIzHmSSw5ku02Rx-s6ps2hUMJA7XoKmHVpIjQcOAcNaSqGkCbP3Y1g8IIQGoKC4VkMMXMVoWCumELAE2MM9dw0nJYlOFDTK_xWeCVAe0PvCIKM2jUNRjO6icf7kE46U--lAg4lSe6N341ou0wtP7cZiVUsSspYv8fGbagICj9l5bk9Po6aSMYBwFGOhmjCSDFSM0sSgjM6VKt20oo2qerTKK9RCRtUh-347pe_KmnJt9BsZmS7dQ7E8N1R4_M"
        />
        <div className="w-8 h-8 rounded-full border-2 border-surface-container-low bg-surface-container-highest flex items-center justify-center text-[10px] text-on-surface-variant">
          +2
        </div>
      </div>

      {data?.expanded ? (
        <div className="mt-3">
          <div className="text-sm font-headline font-semibold mb-2 text-on-surface">
            Meus Times
          </div>
          <ul className="space-y-1">
            {(data.skills ?? ["Skill 1", "Skill 2", "Skill 3"]).map((s) => (
              <li
                key={s}
                className="text-on-surface-variant/90 text-sm bg-transparent"
              >
                • {s}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mt-3 text-sm text-on-surface-variant/90">
          Clique para ver meus times
        </div>
      )}
    </div>
  );
}

