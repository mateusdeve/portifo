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
  type ReactFlowInstance,
  useEdgesState,
  useNodesState,
} from "reactflow";

import "reactflow/dist/style.css";

import {
  presetTeamOnly,
  presetProjectsOnlyManual,
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
  // Bloqueia qualquer interação que altere o grafo (nodes/edges).
  const graphLocked = false;
  const initial = useMemo(() => presetTeamOnly, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);

  const [clickEnabled, setClickEnabled] = useState(true);
  const [dirty, setDirty] = useState(false);
  const lastSavedSnapshotRef = useRef<string | null>(null);
  const lastPresetRef = useRef<string>("projectsOnly");
  const rfInstanceRef = useRef<ReactFlowInstance | null>(null);
  const [viewportSyncNonce, setViewportSyncNonce] = useState(0);
  const [projectsZoomLockEnabled, setProjectsZoomLockEnabled] = useState(false);
  const [projectsLockedZoom, setProjectsLockedZoom] = useState<number | null>(null);
  const [projectsModalNode, setProjectsModalNode] = useState<Node | null>(null);

  const onReactFlowInit = useCallback((instance: ReactFlowInstance) => {
    rfInstanceRef.current = instance;
    instance.fitView({ padding: 0.2, duration: 0 });
  }, []);

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
    setProjectsZoomLockEnabled(false);
    setProjectsLockedZoom(null);
    setProjectsModalNode(null);

    const next = presetProjectsOnlyManual;
    setNodes(next.nodes);
    setEdges(next.edges);

    // Garante que ao recarregar a página o "Projetos" volte do mesmo jeito.
    window.localStorage.setItem(
      NEONFLOW_LOCAL_STORAGE_KEY,
      JSON.stringify({ nodes: next.nodes, edges: next.edges }),
    );

    setViewportSyncNonce((n) => n + 1);
    window.setTimeout(
      () => updateProfileSummarizersForPreset("projectsOnly"),
      0,
    );
  }, [dispatchAgentLog, setEdges, setNodes, updateProfileSummarizersForPreset]);

  const applyGitHubReposOnlyPreset = useCallback(() => {
    lastPresetRef.current = "githubReposOnly";
    setProjectsZoomLockEnabled(false);
    setProjectsLockedZoom(null);
    setProjectsModalNode(null);
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
        setViewportSyncNonce((n) => n + 1);
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

      // Layout no mesmo estilo do workflow de Projetos:
      // root (esquerda) -> categorias (coluna central) -> repos (coluna direita)
      const rootId = "github-root";
      const rootPos = { x: -943.0847058823533, y: 274.29411764705884 };
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

      const maxLangs = 6;
      const maxReposPerLang = 4;
      const maxTotalRepos = 24;

      const langCounts = new Map<string, number>();
      for (const r of normalized) {
        langCounts.set(r.language, (langCounts.get(r.language) ?? 0) + 1);
      }

      const langs = Array.from(langCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxLangs)
        .map(([lang]) => lang);

      const categoryColumnX = -486;
      const categoryStartY = -4;
      const categorySpacingY = 124;
      const repoColumnX = 110;
      const repoSpacingY = 190;

      const langNodes: Node[] = langs.map((lang, idx) => {
        const y = categoryStartY + idx * categorySpacingY;
        return {
          id: `gh-lang-${lang}`,
          type: CATEGORY_NODE_TYPE,
          position: { x: categoryColumnX, y },
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

      let totalRepos = 0;
      for (const lang of langs) {
        const langNode = langNodes.find((n) => n.id === `gh-lang-${lang}`);
        if (!langNode) continue;

        const items = byLang.get(lang) ?? [];
        const picked = items.slice(0, maxReposPerLang);

        const ids: string[] = [];
        const startY =
          langNode.position.y - ((Math.max(1, picked.length) - 1) * repoSpacingY) / 2;

        for (let localIdx = 0; localIdx < picked.length; localIdx++) {
          if (totalRepos >= maxTotalRepos) break;

          const r = picked[localIdx];
          const repoId =
            typeof r.id === "number" ? `github-repo-${r.id}` : `github-repo-${lang}-${localIdx}`;
          const x = repoColumnX;
          const y = startY + localIdx * repoSpacingY;

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

      // Conexões no mesmo padrão de Projetos: root->categoria e categoria->repo.
      const edges: Edge[] = [];

      for (const lang of langs) {
        edges.push({
          id: `e-${rootId}-to-gh-lang-${lang}`,
          source: rootId,
          target: `gh-lang-${lang}`,
          animated: true,
        });

        const ids = repoIdsByLang.get(lang) ?? [];
        ids.forEach((repoId) => {
          edges.push({
            id: `e-gh-lang-${lang}-to-${repoId}`,
            source: `gh-lang-${lang}`,
            target: repoId,
            animated: true,
          });
        });
      }

      const nextNodes: Node[] = profileNode
        ? [rootNode, ...langNodes, ...repoNodes, profileNode]
        : [rootNode, ...langNodes, ...repoNodes];

      setNodes(nextNodes);
      setEdges(edges);
      setViewportSyncNonce((n) => n + 1);
    };

    void load();
  }, [setEdges, setNodes]);

  const applyTimesOnlyPreset = useCallback(() => {
    setNodes(presetTimesOnly.nodes);
    setEdges(presetTimesOnly.edges);
    setProjectsZoomLockEnabled(false);
    setProjectsLockedZoom(null);
    setProjectsModalNode(null);
    setViewportSyncNonce((n) => n + 1);
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
          const isProjectsGraph = parsed.nodes.some(
            (n) =>
              n.id === "projects-root" ||
              n.id.startsWith("cat-") ||
              n.id.startsWith("project-"),
          );

          setNodes(parsed.nodes);
          setEdges(parsed.edges);
          lastSavedSnapshotRef.current = raw;

          // Desbloqueado (usuário deve conseguir dar zoom/pan normalmente).
          setProjectsZoomLockEnabled(false);
          setProjectsLockedZoom(null);
          setProjectsModalNode(null);

          lastPresetRef.current = isProjectsGraph ? "projectsOnly" : lastPresetRef.current;

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

  useEffect(() => {
    if (!rfInstanceRef.current) return;
    rfInstanceRef.current.fitView({ padding: 0.2, duration: 0 });
  }, [viewportSyncNonce]);

  useEffect(() => {
    if (!projectsModalNode) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProjectsModalNode(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [projectsModalNode]);

  const applyProfileNodeToCurrentGraph = useCallback(() => {
    const currentNodes = nodesRef.current;
    const currentEdges = edgesRef.current;
    const projectsRootNode = currentNodes.find((n) => n.id === "projects-root");

    const existingProfileNode = currentNodes.find(
      (n) => n.id === PROFILE_NODE_ID,
    );

    const hasProfileNode = Boolean(existingProfileNode);

    const profilePosition = projectsRootNode
      ? {
          // "à frente" do card Projetos: perfil à esquerda, alinhado verticalmente.
          x: projectsRootNode.position.x - 520,
          y: projectsRootNode.position.y,
        }
      : {
          x: 720,
          y: 110,
        };

    const profileNode = {
      id: PROFILE_NODE_ID,
      type: "profileCard",
      position: profilePosition,
      data: {
        tab: "skills",
        header: "Perfil",
        showProjectSummarizer: lastPresetRef.current === "projectsOnly",
        showGithubSummarizer: lastPresetRef.current === "githubReposOnly",
      },
    };

    const nextNodes = hasProfileNode
      ? currentNodes.map((n) =>
          n.id === PROFILE_NODE_ID
            ? {
                ...n,
                position: profilePosition,
                data: {
                  ...(n.data as any),
                  ...(profileNode.data as any),
                },
              }
            : n,
        )
      : [...currentNodes, profileNode];

    // Mantém apenas uma conexão do lado direito do perfil
    // para o lado esquerdo do card Projetos (projects-root).
    const nextEdgesBase = currentEdges.filter(
      (e) => e.source !== PROFILE_NODE_ID && e.target !== PROFILE_NODE_ID,
    );
    const profileToProjectsEdge: Edge | null = projectsRootNode
      ? {
          id: `e-${PROFILE_NODE_ID}-to-projects-root`,
          source: PROFILE_NODE_ID,
          target: "projects-root",
          animated: true,
        }
      : null;
    const nextEdges = profileToProjectsEdge
      ? [...nextEdgesBase, profileToProjectsEdge]
      : nextEdgesBase;

    setNodes(nextNodes);
    setEdges(nextEdges);

    // Centraliza a viewport no card de perfil.
    window.setTimeout(() => {
      if (!rfInstanceRef.current) return;
      rfInstanceRef.current.fitView({
        nodes: [{ id: PROFILE_NODE_ID }],
        padding: 0.2,
        duration: 450,
      });
    }, 0);
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
      const isProjectsGraphNode =
        node.id === "projects-root" ||
        node.id.startsWith("cat-") ||
        node.id.startsWith("project-");

      if (isProjectsGraphNode) {
        setProjectsModalNode(node);
        return;
      }

      if (!clickEnabled) return;
      if (node.id === TEAM_NODE_ID) {
        applyProjectsOnlyPreset();
        dispatchAgentLog({ group: "team" });
        return;
      }

      if (node.id === SKILLS_NODE_ID) {
        applyTimesOnlyPreset();
        dispatchAgentLog({ group: "times" });
        return;
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
    if (graphLocked) return;
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
      if (graphLocked) return;
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
      if (graphLocked) return;
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
        onNodesChange={(changes) => {
          if (graphLocked) return;
          onNodesChange(changes);
        }}
        onEdgesChange={(changes) => {
          if (graphLocked) return;
          onEdgesChange(changes);
        }}
        onNodeClick={handleNodeClick}
        fitView={false}
        onInit={onReactFlowInit}
        nodesDraggable
        nodesConnectable
        onConnect={onConnect}
        elementsSelectable
        panOnDrag={projectsZoomLockEnabled ? false : true}
        panActivationKeyCode={projectsZoomLockEnabled ? null : undefined}
        zoomActivationKeyCode={projectsZoomLockEnabled ? null : undefined}
        preventScrolling={projectsZoomLockEnabled}
        minZoom={projectsZoomLockEnabled && projectsLockedZoom !== null ? projectsLockedZoom : undefined}
        maxZoom={projectsZoomLockEnabled && projectsLockedZoom !== null ? projectsLockedZoom : undefined}
        zoomOnScroll={!projectsZoomLockEnabled}
        zoomOnPinch={!projectsZoomLockEnabled}
        zoomOnDoubleClick={!projectsZoomLockEnabled}
        panOnScroll={!projectsZoomLockEnabled}
      >
        <Background gap={24} size={1} />
        {/* <Controls showInteractive={false} /> */}
      </ReactFlow>

      {projectsModalNode ? (
        (() => {
          type ProjectCardData = {
            header?: string;
            title?: string;
            description?: string | null;
            image?: string | null;
            url?: string | null;
            expanded?: boolean;
          };

          type CategoryCardData = {
            variant?: "root" | "category" | "circle";
            title?: string;
            subtitle?: string;
            count?: number;
          };

          const node = projectsModalNode;

          const projectData = node.data as ProjectCardData;
          const categoryData = node.data as CategoryCardData;

          return (
            <div
              className="fixed inset-0 z-10000 bg-[#0e0e0e]/60 backdrop-blur-2xl flex items-center justify-center px-6"
              role="dialog"
              aria-modal="true"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) setProjectsModalNode(null);
              }}
            >
              <div
                className="w-full max-w-2xl rounded-3xl glass-card border border-outline-variant/20 shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-surface-container-high flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-xs font-label uppercase tracking-[0.08em] text-on-surface-variant/70">
                      {node.type === "projectCard" ? "Projeto" : "Categoria"}
                    </div>
                    <div className="mt-1 text-sm font-headline font-semibold text-on-surface truncate">
                      {node.type === "projectCard" ? projectData.title : categoryData.title}
                    </div>
                    <div className="mt-1 text-[12px] text-on-surface-variant/80 wrap-break-word">
                      {node.id}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setProjectsModalNode(null)}
                    className="rounded-full px-3 py-2 border border-outline-variant/20 hover:bg-surface-container-highest transition-colors"
                    aria-label="Fechar"
                    title="Fechar"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {node.type === "projectCard" ? (
                    <>
                      {projectData.header ? (
                        <div className="shrink-0 px-3 py-1 rounded-full border border-primary/25 bg-primary-container/10 text-primary text-[11px] font-medium w-fit">
                          {projectData.header}
                        </div>
                      ) : null}

                      {projectData.image ? (
                        <img
                          src={projectData.image}
                          alt={projectData.title ?? "Projeto"}
                          className="w-full max-h-[220px] object-cover rounded-2xl border border-outline-variant/20"
                        />
                      ) : null}

                      {projectData.description ? (
                        <p className="text-[13px] leading-relaxed text-on-surface-variant/90 whitespace-pre-wrap max-h-[260px] overflow-y-auto pr-1 no-scrollbar">
                          {projectData.description}
                        </p>
                      ) : null}

                      <div className="flex items-center gap-3">
                        {projectData.url ? (
                          <a
                            href={projectData.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 bg-primary text-on-primary hover:shadow-[0_0_10px_rgba(107,254,156,0.25)] transition-all active:scale-95"
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            <span className="material-symbols-outlined">open_in_new</span>
                            Visitar
                          </a>
                        ) : (
                          <div className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 border border-outline-variant/20 bg-surface-container-highest/10 text-on-surface-variant/60">
                            Sem link
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {categoryData.subtitle ? (
                        <div className="text-[13px] leading-relaxed text-on-surface-variant/80 whitespace-pre-wrap">
                          {categoryData.subtitle}
                        </div>
                      ) : null}

                      {typeof categoryData.count === "number" ? (
                        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl border border-outline-variant/20 bg-surface-container-highest/10 text-on-surface-variant/90">
                          <span className="material-symbols-outlined text-[18px] text-primary">
                            apps
                          </span>
                          <span>{categoryData.count} itens</span>
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })()
      ) : null}

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

