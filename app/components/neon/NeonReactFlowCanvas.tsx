"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  type NodeMouseHandler,
  type Connection,
  type Edge,
  type Node,
  useEdgesState,
  useNodesState,
} from "reactflow";

import "reactflow/dist/style.css";

import {
  presetTeamOnly,
  presetProjectsOnly,
  presetTimesOnly,
  presetGitHubReposOnly,
  GITHUB_REPO_NODE_TYPE,
  CATEGORY_NODE_TYPE,
  SKILLS_NODE_ID,
  TEAM_NODE_ID,
} from "./workflowPresets";

import { dispatchAgentLog } from "./agentLogBus";
import {
  NEON_REACTFLOW_UI_EVENT,
  type NeonReactFlowUiPayload,
} from "./reactFlowUiBus";

import { TeamCardNode } from "./TeamCardNode";
import { SkillsCardNode } from "./SkillsCardNode";
import { ProjectCardNode } from "./ProjectCardNode";
import { ProfileNode, PROFILE_NODE_ID } from "./ProfileNode";
import { TextNode } from "./TextNode";
import { GitHubRepoCardNode } from "./GitHubRepoCardNode";
import { CategoryNode } from "./CategoryNode";
import {
  NEON_REACTFLOW_ADD_TEXT_NODE_EVENT,
  type NeonReactFlowAddTextNodePayload,
} from "./reactFlowUserNodeBus";

const NEON_REACTFLOW_PROFILE_EVENT = "neonflow:profileNode";
const NEONFLOW_LOCAL_STORAGE_KEY = "neonflow:v1";
const NEONFLOW_SAVE_EVENT = "neonflow:save";

const nodeTypes = {
  teamCard: TeamCardNode,
  skillsCard: SkillsCardNode,
  projectCard: ProjectCardNode,
  profileCard: ProfileNode,
  textCard: TextNode,
  [GITHUB_REPO_NODE_TYPE]: GitHubRepoCardNode,
  [CATEGORY_NODE_TYPE]: CategoryNode,
};

export function NeonReactFlowCanvas() {
  const initial = useMemo(() => presetTeamOnly, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);

  const [clickEnabled, setClickEnabled] = useState(true);
  const [dirty, setDirty] = useState(false);
  const lastSavedSnapshotRef = useRef<string | null>(null);
  const lastPresetRef = useRef<string>("projectsOnly");

  const updateProfileSummarizersForPreset = useCallback(
    (preset: string) => {
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id !== PROFILE_NODE_ID) return n;
          return {
            ...n,
            data: {
              ...(n.data as any),
              showProjectSummarizer: preset === "projectsOnly",
              showGithubSummarizer: preset === "githubReposOnly",
            },
          };
        }),
      );
    },
    [setNodes],
  );

  const applyProjectsOnlyPreset = useCallback(() => {
    lastPresetRef.current = "projectsOnly";
    setNodes(presetProjectsOnly.nodes);
    setEdges(presetProjectsOnly.edges);
    window.setTimeout(
      () => updateProfileSummarizersForPreset("projectsOnly"),
      0,
    );
  }, [dispatchAgentLog, setEdges, setNodes, updateProfileSummarizersForPreset]);

  const applyGitHubReposOnlyPreset = useCallback(() => {
    lastPresetRef.current = "githubReposOnly";
    const username = "mateusdeve";
    const cacheKey = "neonflow:githubReposCache:v1";
    const cacheTtlMs = 1000 * 60 * 30; // 30 minutos

    const load = async () => {
      try {
        dispatchAgentLog({
          group: "toolbox",
          text: "Carregando repositórios do GitHub...",
        });

        const now = Date.now();
        const cachedRaw = window.localStorage.getItem(cacheKey);
        if (cachedRaw) {
          try {
            const parsed = JSON.parse(cachedRaw) as {
              ts?: number;
              repos?: any[];
            };
            if (parsed?.ts && parsed.ts > now - cacheTtlMs && Array.isArray(parsed.repos)) {
              return buildFromRepos(parsed.repos);
            }
          } catch {
            // ignorar cache inválido
          }
        }

        const fetchAll = async () => {
          const perPage = 100;
          let page = 1;
          const all: any[] = [];

          while (true) {
            const url = `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${page}`;
            const res = await fetch(url, {
              headers: { Accept: "application/vnd.github+json" },
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const pageRepos = (await res.json()) as any[];
            if (!Array.isArray(pageRepos) || pageRepos.length === 0) break;

            all.push(...pageRepos);

            if (pageRepos.length < perPage) break;
            page++;
          }

          return all;
        };

        const repos = await fetchAll();
        window.localStorage.setItem(
          cacheKey,
          JSON.stringify({ ts: now, repos }),
        );
        return buildFromRepos(repos);
      } catch (e) {
        dispatchAgentLog({
          group: "toolbox",
          text: "Falha ao carregar GitHub; usando fallback local.",
        });
        setNodes(presetGitHubReposOnly.nodes);
        setEdges(presetGitHubReposOnly.edges);
      }
    };

    const buildFromRepos = (repos: any[]) => {
      const normalized = repos
        .filter(
          (r) =>
            typeof r?.name === "string" && typeof r?.html_url === "string",
        )
        .map((r) => ({
          id: r.id as number | undefined,
          name: r.name as string,
          html_url: r.html_url as string,
          description:
            typeof r.description === "string" ? (r.description as string) : null,
          language: typeof r.language === "string" ? (r.language as string) : "Outros",
          stargazers_count:
            typeof r.stargazers_count === "number" ? (r.stargazers_count as number) : 0,
          fork: Boolean(r.fork),
        }))
        .sort((a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0));

      const currentNodes = nodesRef.current;
      const existingProfile = currentNodes.find((n) => n.id === PROFILE_NODE_ID);

      const profileNode = existingProfile
        ? {
            ...existingProfile,
            data: {
              ...(existingProfile.data as any),
              showProjectSummarizer: false,
              showGithubSummarizer: true,
            },
          }
        : null;

      // Layout "bonito" para GitHub:
      // ROOT central -> Categorias (linguagens) em bolinhas -> Repos em leque
      const rootId = "github-root";
      const rootPos = { x: 520, y: 280 };
      const rootNode: Node = {
        id: rootId,
        type: CATEGORY_NODE_TYPE,
        position: rootPos,
        data: {
          variant: "root",
          title: "GitHub",
          subtitle: "Repositórios públicos",
          count: normalized.length,
        },
      };

      const maxLangs = 8;
      const maxReposPerLang = 6;
      const maxTotalRepos = 28;
      const radius = 260;

      const langCounts = new Map<string, number>();
      for (const r of normalized) {
        langCounts.set(r.language, (langCounts.get(r.language) ?? 0) + 1);
      }

      const langs = Array.from(langCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxLangs)
        .map(([lang]) => lang);

      const langNodes: Node[] = langs.map((lang, idx) => {
        const count = Math.max(1, langs.length);
        const theta = (idx / count) * Math.PI * 2 - Math.PI / 2;
        const x = rootPos.x + radius * Math.cos(theta);
        const y = rootPos.y + radius * Math.sin(theta);

        return {
          id: `gh-lang-${lang}`,
          type: CATEGORY_NODE_TYPE,
          position: { x, y },
          data: {
            variant: "circle",
            title: lang,
            count: langCounts.get(lang) ?? 0,
          },
        };
      });

      const byLang = new Map<string, typeof normalized>();
      for (const l of langs) byLang.set(l, []);
      for (const r of normalized) {
        if (!byLang.has(r.language)) continue;
        byLang.get(r.language)!.push(r);
      }

      const repoNodes: Node[] = [];
      const repoIdsByLang = new Map<string, string[]>();

      const cols = 2;
      const lateralSpacing = 320;
      const outwardStart = 165;
      const outwardStep = 175;

      let totalRepos = 0;
      for (const lang of langs) {
        const langNode = langNodes.find((n) => n.id === `gh-lang-${lang}`);
        if (!langNode) continue;

        const items = byLang.get(lang) ?? [];
        const picked = items.slice(0, maxReposPerLang);

        const ids: string[] = [];

        const dirX = (langNode.position.x - rootPos.x) / radius || 0;
        const dirY = (langNode.position.y - rootPos.y) / radius || 0;
        const perpX = -dirY;
        const perpY = dirX;

        for (let localIdx = 0; localIdx < picked.length; localIdx++) {
          if (totalRepos >= maxTotalRepos) break;

          const r = picked[localIdx];
          const repoId =
            typeof r.id === "number" ? `github-repo-${r.id}` : `github-repo-${lang}-${localIdx}`;

          const row = Math.floor(localIdx / cols);
          const col = localIdx % cols;
          const lateral = (col - (cols - 1) / 2) * lateralSpacing;
          const outward = outwardStart + row * outwardStep;

          const x = langNode.position.x + dirX * outward + perpX * lateral;
          const y = langNode.position.y + dirY * outward + perpY * lateral;

          repoNodes.push({
            id: repoId,
            type: GITHUB_REPO_NODE_TYPE,
            position: { x, y },
            data: {
              header: lang,
              title: r.name,
              description: r.description,
              url: r.html_url,
              stars: r.stargazers_count,
            },
          });

          ids.push(repoId);
          totalRepos++;
        }

        repoIdsByLang.set(lang, ids);
        if (totalRepos >= maxTotalRepos) break;
      }

      // Conexões: root->lang, lang->repo, repo->perfil (se existir) + extras leves.
      const edges: Edge[] = [];

      for (const lang of langs) {
        edges.push({
          id: `e-${rootId}-to-gh-lang-${lang}`,
          source: rootId,
          target: `gh-lang-${lang}`,
          animated: true,
        });

        const ids = repoIdsByLang.get(lang) ?? [];
        ids.forEach((repoId, idx) => {
          edges.push({
            id: `e-gh-lang-${lang}-to-${repoId}`,
            source: `gh-lang-${lang}`,
            target: repoId,
            animated: true,
          });

          if (profileNode) {
            edges.push({
              id: `e-${repoId}-to-${PROFILE_NODE_ID}`,
              source: repoId,
              target: PROFILE_NODE_ID,
              animated: true,
            });
          }

          // "neural" leve: cadeia local
          const next = ids[idx + 1];
          if (next && idx < 4) {
            edges.push({
              id: `e-${repoId}-to-${next}-chain`,
              source: repoId,
              target: next,
              animated: true,
            });
          }
        });
      }

      // Conexões cruzadas (amostra) para efeito de rede sem poluir demais.
      const repoNodesByStars = [...repoNodes].sort((a, b) => {
        const as = (a.data as any)?.stars;
        const bs = (b.data as any)?.stars;
        return (bs ?? 0) - (as ?? 0);
      });
      const crossCount = Math.min(14, repoNodesByStars.length);
      for (let i = 0; i < crossCount; i += 3) {
        const a = repoNodesByStars[i];
        const b = repoNodesByStars[(i + 5) % repoNodesByStars.length];
        if (!a || !b || a.id === b.id) continue;

        const aLang = (a.data as any)?.header;
        const bLang = (b.data as any)?.header;
        if (aLang && bLang && aLang === bLang) continue;

        edges.push({
          id: `e-cross-${a.id}-to-${b.id}`,
          source: a.id,
          target: b.id,
          animated: true,
        });
      }

      const nextNodes: Node[] = profileNode
        ? [rootNode, ...langNodes, ...repoNodes, profileNode]
        : [rootNode, ...langNodes, ...repoNodes];

      setNodes(nextNodes);
      setEdges(edges);
    };

    void load();
  }, [setEdges, setNodes]);

  const applyTimesOnlyPreset = useCallback(() => {
    setNodes(presetTimesOnly.nodes);
    setEdges(presetTimesOnly.edges);
  }, [setEdges, setNodes]);

  const nodesRef = useRef<Node[]>(initial.nodes);
  const edgesRef = useRef<Edge[]>(initial.edges);

  useEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [nodes, edges]);

  // Load/save do fluxo do usuário (nodes + edges) no localStorage.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem(NEONFLOW_LOCAL_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { nodes?: Node[]; edges?: Edge[] };
        if (Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
          setNodes(parsed.nodes);
          setEdges(parsed.edges);
          lastSavedSnapshotRef.current = raw;
          setDirty(false);
          return;
        }
      } catch {
        // ignorar payload inválido
      }
    }

    lastSavedSnapshotRef.current = JSON.stringify({ nodes, edges });
    setDirty(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!lastSavedSnapshotRef.current) return;
    setDirty(JSON.stringify({ nodes, edges }) !== lastSavedSnapshotRef.current);
  }, [nodes, edges]);

  const applyProfileNodeToCurrentGraph = useCallback(() => {
    const currentNodes = nodesRef.current;
    const currentEdges = edgesRef.current;

    const hasProfileNode = currentNodes.some((n) => n.id === PROFILE_NODE_ID);
    const profileNode = {
      id: PROFILE_NODE_ID,
      type: "profileCard",
      position: { x: 720, y: 110 },
      data: {
        tab: "skills",
        header: "Perfil",
        showProjectSummarizer: lastPresetRef.current === "projectsOnly",
        showGithubSummarizer: lastPresetRef.current === "githubReposOnly",
      },
    };

    // Quando o perfil "entra" no grafo, empurra todos os outros nodes para
    // mais longe dele (bem mais do que o repulsor de projetos).
    const nextNodes = (() => {
      if (hasProfileNode) return currentNodes;

      const profilePos = profileNode.position;
      const minDist = 680; // mais longe
      const pushScale = 140;
      const iterations = 10;

      const movedNodes = currentNodes.map((n) => ({
        ...n,
        position: { ...(n.position as any) },
      }));

      for (let it = 0; it < iterations; it++) {
        for (let i = 0; i < movedNodes.length; i++) {
          const node = movedNodes[i];
          const dx = node.position.x - profilePos.x;
          const dy = node.position.y - profilePos.y;
          const dist = Math.hypot(dx, dy) || 0.001;

          if (dist < minDist) {
            const overlap = (minDist - dist) / minDist; // 0..1
            const push = overlap * pushScale;
            const ux = dx / dist;
            const uy = dy / dist;

            node.position.x += ux * push;
            node.position.y += uy * push;
          }
        }
      }

      return [...movedNodes, profileNode];
    })();

    const profileEdges = currentNodes
      .filter((n) => n.id !== PROFILE_NODE_ID)
      .map((n) => ({
        id: `e-${n.id}-to-${PROFILE_NODE_ID}`,
        source: n.id,
        target: PROFILE_NODE_ID,
        animated: true,
      }));

    const nextEdges = [
      ...currentEdges.filter((e) => e.target !== PROFILE_NODE_ID),
      ...profileEdges,
    ];

    setNodes(nextNodes);
    setEdges(nextEdges);
  }, [setEdges, setNodes]);

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<{ preset?: string }>;
      if (custom?.detail?.preset === "projectsOnly") {
        lastPresetRef.current = "projectsOnly";
        applyProjectsOnlyPreset();
      }
      if (custom?.detail?.preset === "timesOnly") {
        lastPresetRef.current = "timesOnly";
        applyTimesOnlyPreset();
      }
      if (custom?.detail?.preset === "githubReposOnly") {
        lastPresetRef.current = "githubReposOnly";
        applyGitHubReposOnlyPreset();
      }
      if (typeof custom?.detail?.preset === "string") {
        updateProfileSummarizersForPreset(custom.detail.preset);
      }
    };

    window.addEventListener("neonflow:preset", handler);
    return () => window.removeEventListener("neonflow:preset", handler);
  }, [
    applyGitHubReposOnlyPreset,
    applyTimesOnlyPreset,
    applyProjectsOnlyPreset,
    updateProfileSummarizersForPreset,
  ]);

  useEffect(() => {
    const handler = () => applyProfileNodeToCurrentGraph();
    window.addEventListener(NEON_REACTFLOW_PROFILE_EVENT, handler);
    return () =>
      window.removeEventListener(NEON_REACTFLOW_PROFILE_EVENT, handler);
  }, [applyProfileNodeToCurrentGraph]);

  useEffect(() => {
    const uiHandler = (event: Event) => {
      const custom = event as CustomEvent<NeonReactFlowUiPayload>;
      if (typeof custom?.detail?.clickEnabled === "boolean") {
        setClickEnabled(custom.detail.clickEnabled);
      }
    };

    window.addEventListener(NEON_REACTFLOW_UI_EVENT, uiHandler);
    return () => window.removeEventListener(NEON_REACTFLOW_UI_EVENT, uiHandler);
  }, []);

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      if (!clickEnabled) return;
      if (node.id === TEAM_NODE_ID) {
        applyProjectsOnlyPreset();
        dispatchAgentLog({ group: "team" });
      }

      if (node.id === SKILLS_NODE_ID) {
        applyTimesOnlyPreset();
        dispatchAgentLog({ group: "times" });
      }

      if (node.type === "projectCard") {
        const currentNodes = nodesRef.current;
        const clickedNode = currentNodes.find((n) => n.id === node.id);
        const clickedExpanded = (clickedNode?.data as any)?.expanded as
          | boolean
          | undefined;
        const willExpand = !clickedExpanded;

        const nextNodes = currentNodes.map((n) => {
          if (n.type !== "projectCard") return n;
          const shouldExpand = n.id === node.id ? willExpand : false;
          return {
            ...n,
            data: {
              ...(n.data as any),
              expanded: shouldExpand,
            },
          };
        });

        // Quando abrir o detalhe, “empurra” (repelir) cards próximos pra não colar.
        if (willExpand) {
          const clickedPos = clickedNode?.position ?? { x: 0, y: 0 };
          const projectNodes = currentNodes.filter(
            (n) => n.type === "projectCard",
          );

          const closeRadius = 520;
          const closeNodes = projectNodes.filter((n) => {
            const dx = n.position.x - clickedPos.x;
            const dy = n.position.y - clickedPos.y;
            return Math.hypot(dx, dy) < closeRadius;
          });

          const minDist = 380;
          const iterations = 12;
          const pushScale = 28;

          const posById = new Map<string, { x: number; y: number }>();
          for (const n of closeNodes) {
            posById.set(n.id, { x: n.position.x, y: n.position.y });
          }

          const getPos = (id: string) => posById.get(id)!;

          for (let it = 0; it < iterations; it++) {
            for (let i = 0; i < closeNodes.length; i++) {
              for (let j = i + 1; j < closeNodes.length; j++) {
                const a = closeNodes[i];
                const b = closeNodes[j];

                const pa = getPos(a.id);
                const pb = getPos(b.id);

                const dx = pa.x - pb.x;
                const dy = pa.y - pb.y;
                const dist = Math.hypot(dx, dy) || 0.001;

                if (dist < minDist) {
                  const overlap = (minDist - dist) / minDist; // 0..1
                  const push = overlap * pushScale;

                  const ux = dx / dist;
                  const uy = dy / dist;

                  // Mantém o card clicado no lugar; só "empurra" os próximos.
                  if (a.id !== clickedNode?.id) {
                    pa.x += ux * push;
                    pa.y += uy * push;
                  }
                  if (b.id !== clickedNode?.id) {
                    pb.x -= ux * push;
                    pb.y -= uy * push;
                  }
                }
              }
            }
          }

          const nextNodesWithPositions = nextNodes.map((n) => {
            if (n.type !== "projectCard") return n;
            const p = posById.get(n.id);
            if (!p) return n;
            return { ...n, position: { x: p.x, y: p.y } };
          });

          setNodes(nextNodesWithPositions);
        } else {
          setNodes(nextNodes);
        }

        const title = (node.data as any)?.title as string | undefined;
        dispatchAgentLog({
          group: "reactflow",
          text: title
            ? `Detalhando projeto: ${title}`
            : "Detalhando projeto",
        });
      }
    },
    [applyTimesOnlyPreset, applyProjectsOnlyPreset, clickEnabled, setNodes],
  );

  const saveNow = useCallback(() => {
    // Usa refs para capturar o estado mais recente do graph.
    const payload = { nodes: nodesRef.current, edges: edgesRef.current };
    const snapshot = JSON.stringify(payload);
    window.localStorage.setItem(NEONFLOW_LOCAL_STORAGE_KEY, snapshot);
    lastSavedSnapshotRef.current = snapshot;
    setDirty(false);
    dispatchAgentLog({ group: "toolbox", text: "Fluxo salvo no localStorage." });
  }, [dispatchAgentLog]);

  useEffect(() => {
    const handler = () => saveNow();
    window.addEventListener(NEONFLOW_SAVE_EVENT, handler);
    return () => window.removeEventListener(NEONFLOW_SAVE_EVENT, handler);
  }, [saveNow]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
          },
          eds,
        ),
      );
    },
    [setEdges],
  );

  const addTextNodeToGraph = useCallback(
    (payload: NeonReactFlowAddTextNodePayload) => {
      const text = payload.text.trim();
      if (!text) return;

      const currentNodes = nodesRef.current;

      const profileNode = currentNodes.find((n) => n.id === PROFILE_NODE_ID);
      const baseX =
        typeof profileNode?.position?.x === "number" ? profileNode.position.x : 220;
      const baseY =
        typeof profileNode?.position?.y === "number" ? profileNode.position.y : 220;

      const count = currentNodes.filter((n) => n.id.startsWith("text-")).length;
      const x = baseX - 240 + (count % 3) * 240;
      const y = baseY + 120 + Math.floor(count / 3) * 140;

      const newNodeId = `text-${Date.now()}-${Math.random().toString(16).slice(2)}`;

      const node: Node = {
        id: newNodeId,
        type: "textCard",
        position: { x, y },
        data: { text, header: "Texto" },
      };

      setNodes([...currentNodes, node]);
    },
    [setNodes],
  );

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<NeonReactFlowAddTextNodePayload>;
      if (!custom?.detail) return;
      addTextNodeToGraph(custom.detail);
    };

    window.addEventListener(NEON_REACTFLOW_ADD_TEXT_NODE_EVENT, handler);
    return () =>
      window.removeEventListener(NEON_REACTFLOW_ADD_TEXT_NODE_EVENT, handler);
  }, [addTextNodeToGraph]);

  return (
    <div className="absolute inset-0 z-0">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
        nodesDraggable
        nodesConnectable
        onConnect={onConnect}
        elementsSelectable
      >
        <Background gap={24} size={1} />
        {/* <Controls showInteractive={false} /> */}
      </ReactFlow>

      <button
        type="button"
        onClick={saveNow}
        className="fixed bottom-6 right-6 z-50 bg-surface-container-lowest/60 hover:bg-surface-container-lowest text-on-surface p-3 rounded-full border border-outline-variant/20 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all hover:scale-105 active:scale-95"
        aria-label={dirty ? "Salvar fluxo (alterado)" : "Fluxo salvo"}
        title={dirty ? "Salvar alterações no fluxo" : "Sem alterações"}
      >
        <span className="material-symbols-outlined">
          {dirty ? "save" : "check_circle"}
        </span>
      </button>
    </div>
  );
}

