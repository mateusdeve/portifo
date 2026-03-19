export const NEON_AGENT_LOG_EVENT = "neonflow:agentlog";

export type AgentLogKind = "info" | "neon" | "success" | "warn" | "error";

export type AgentLogGroup =
  | "welcome"
  | "team"
  | "times"
  | "reactflow"
  | "toolbox"
  | "chat"
  | "generic";

export type AgentLogPayload = {
  group?: AgentLogGroup;
  kind?: AgentLogKind;
  text?: string;
  emoji?: string;
};

export function dispatchAgentLog(payload: AgentLogPayload) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<AgentLogPayload>(NEON_AGENT_LOG_EVENT, {
      detail: payload,
    }),
  );
}

