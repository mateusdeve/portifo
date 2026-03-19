import type { Edge, Node } from "reactflow";

import projects from "../../../projects.json";
import presetProjectsOnlyManualRaw from "./presetProjectsOnlyManual.json";

export const TEAM_NODE_ID = "team";
export const SKILLS_NODE_ID = "skills";
export const PROJECT_NODE_TYPE = "projectCard";
export const GITHUB_REPO_NODE_TYPE = "githubRepoCard";
export const CATEGORY_NODE_TYPE = "categoryCard";

export type WorkflowPreset = {
  nodes: Node[];
  edges: Edge[];
};

type Project = {
  title?: string;
  description?: string;
  image?: string;
  url?: string | null;
  category?: string;
};

const projectsList = (projects as unknown as Project[]).filter(
  (p) => typeof p.title === "string" && p.title.length > 0,
);

const githubReposList = projectsList.filter(
  (p) => typeof p.url === "string" && p.url.length > 0,
);

const GITHUB_REPOS_LIMIT = 4;

const githubProjectsChainList = (() => {
  const source =
    githubReposList.length > 0 ? githubReposList : projectsList.slice();
  return source.slice(-GITHUB_REPOS_LIMIT);
})();

export const presetTeamOnly: WorkflowPreset = {
  nodes: [
    {
      id: TEAM_NODE_ID,
      type: PROJECT_NODE_TYPE,
      position: { x: 273.081342996492, y: -37.62110027073885 },
      data: {
        header: "Projetos",
        title: "Landing Page – Clínica Viver",
        description:
          "Landing page desenvolvida para a Clínica Viver, com foco em atrair pacientes para consultas particulares. O projeto prioriza carregamento rápido, design responsivo e uma estrutura otimizada para conversões em campanhas digitais.",
        image:
          "https://blog.clipy.ia.br/_next/image?url=%2Fstatic%2Fimages%2Fprojects%2Fviver.jpg&w=1200&q=75",
      },
      width: 320,
      height: 173,
      selected: true,
      positionAbsolute: { x: 273.081342996492, y: -37.62110027073885 },
      dragging: false,
    },
  ],
  edges: [],
};

export const presetTeamToTimes: WorkflowPreset = {
  nodes: [
    {
      id: TEAM_NODE_ID,
      type: "teamCard",
      position: { x: 120, y: 140 },
      data: { title: "Team" },
    },
    {
      id: SKILLS_NODE_ID,
      type: "skillsCard",
      position: { x: 520, y: 140 },
      data: { expanded: true, skills: ["Time A", "Time B", "Time C"] },
    },
  ],
  edges: [
    {
      id: "e-team-to-times",
      source: TEAM_NODE_ID,
      target: SKILLS_NODE_ID,
      animated: true,
    },
  ],
};

export const presetTimesOnly: WorkflowPreset = {
  nodes: [
    {
      id: SKILLS_NODE_ID,
      type: "skillsCard",
      position: { x: 360, y: 140 },
      data: { expanded: true, skills: ["Time A", "Time B", "Time C"] },
    },
  ],
  edges: [],
};

export const presetProjectsOnly: WorkflowPreset = {
  nodes: (() => {
    const rootId = "projects-root";
    const categories = Array.from(
      new Set(
        projectsList
          .map((p) => (typeof p.category === "string" ? p.category : "outros"))
          .filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b));

    const rootPos = { x: 520, y: 280 };
    const orbitRadius = 260;
    const catCount = Math.max(1, categories.length);

    const rootNode: Node = {
      id: rootId,
      type: CATEGORY_NODE_TYPE,
      position: rootPos,
      data: {
        variant: "root",
        title: "Projetos",
        subtitle: "Por categoria",
        count: projectsList.length,
      },
    };

    const categoryPositions = categories.map((_, idx) => {
      const theta = (idx / catCount) * Math.PI * 2 - Math.PI / 2;
      return {
        x: rootPos.x + orbitRadius * Math.cos(theta),
        y: rootPos.y + orbitRadius * Math.sin(theta),
      };
    });

    const categoryNodes: Node[] = categories.map((cat, idx) => ({
      id: `cat-${cat}`,
      type: CATEGORY_NODE_TYPE,
      position: categoryPositions[idx]!,
      data: {
        // Bolinhas para dar o mesmo feeling do GitHub workflow
        variant: "circle",
        title: cat,
        count: projectsList.filter((p) => (p.category ?? "outros") === cat).length,
      },
    }));

    const projectNodes: Node[] = [];
    for (const cat of categories) {
      const items = projectsList.filter((p) => (p.category ?? "outros") === cat);

      const catPos = categoryNodes.find((n) => n.id === `cat-${cat}`)?.position ?? {
        x: rootPos.x,
        y: rootPos.y,
      };

      const dx = catPos.x - rootPos.x;
      const dy = catPos.y - rootPos.y;
      const dist = Math.hypot(dx, dy) || 1;
      const dirX = dx / dist;
      const dirY = dy / dist;
      const perpX = -dirY;
      const perpY = dirX;

      const cols = 2;
      const lateralSpacing = 360;
      const outwardStart = 190;
      const outwardStep = 210;

      items.forEach((p, idx) => {
        const row = Math.floor(idx / cols);
        const col = idx % cols;
        const outward = outwardStart + row * outwardStep;
        const lateral = (col - (cols - 1) / 2) * lateralSpacing;

        projectNodes.push({
          id: `project-${cat}-${idx}`,
          type: PROJECT_NODE_TYPE,
          position: {
            x: catPos.x + dirX * outward + perpX * lateral,
            y: catPos.y + dirY * outward + perpY * lateral,
          },
          data: {
            header: cat,
            title: p.title,
            description: p.description ?? null,
            image: p.image ?? null,
            url: p.url ?? null,
          },
        });
      });
    }

    return [rootNode, ...categoryNodes, ...projectNodes];
  })(),
  edges: (() => {
    const rootId = "projects-root";
    const categories = Array.from(
      new Set(
        projectsList
          .map((p) => (typeof p.category === "string" ? p.category : "outros"))
          .filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b));

    const edges: Edge[] = [];
    for (const cat of categories) {
      edges.push({
        id: `e-${rootId}-to-cat-${cat}`,
        source: rootId,
        target: `cat-${cat}`,
        animated: true,
      });

      const items = projectsList.filter((p) => (p.category ?? "outros") === cat);
      items.forEach((_, idx) => {
        edges.push({
          id: `e-cat-${cat}-to-project-${cat}-${idx}`,
          source: `cat-${cat}`,
          target: `project-${cat}-${idx}`,
          animated: true,
        });
      });
    }

    return edges;
  })(),
};

export const presetProjectsOnlyManual: WorkflowPreset = {
  ...(presetProjectsOnlyManualRaw as unknown as WorkflowPreset),
};

export const presetGitHubReposOnly: WorkflowPreset = {
  nodes: githubProjectsChainList.map((p, idx) => ({
    id: `repo-${idx}`,
    type: GITHUB_REPO_NODE_TYPE,
    position: (() => {
      const perRow = 3;
      const row = Math.floor(idx / perRow);
      const col = idx % perRow;
      return {
        x: 120 + col * 360,
        y: 120 + row * 200,
      };
    })(),
    data: {
      header: "Repositório",
      title: p.title,
      description: p.description ?? null,
      image: p.image ?? null,
      url: p.url ?? null,
    },
  })),
  edges: Array.from({
    length: Math.max(0, githubProjectsChainList.length - 1),
  }).map((_, i) => {
    const n = githubProjectsChainList.length;
    const sourceIdx = n - 1 - i; // último -> anterior
    const targetIdx = n - 2 - i;
    return {
      id: `e-repo-${sourceIdx}-to-${targetIdx}`,
      source: `repo-${sourceIdx}`,
      target: `repo-${targetIdx}`,
      animated: true,
    };
  }),
};

// Backwards-compatible aliases
export const presetTeamToSkills = presetTeamToTimes;
export const presetSkillsOnly = presetTimesOnly;
export const presetProjectsOnlyAlias = presetProjectsOnly;

