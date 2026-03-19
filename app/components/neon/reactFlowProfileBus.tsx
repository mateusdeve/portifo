export const NEON_REACTFLOW_PROFILE_EVENT = "neonflow:profileNode";

export function dispatchReactFlowProfileNode() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<null>(NEON_REACTFLOW_PROFILE_EVENT, {
      detail: null,
    }),
  );
}

