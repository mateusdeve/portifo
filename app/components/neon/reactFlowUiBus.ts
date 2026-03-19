export const NEON_REACTFLOW_UI_EVENT = "neonflow:ui";

export type NeonReactFlowUiPayload = {
  locked?: boolean;
  clickEnabled?: boolean;
};

export function dispatchReactFlowUi(payload: NeonReactFlowUiPayload) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<NeonReactFlowUiPayload>(NEON_REACTFLOW_UI_EVENT, {
      detail: payload,
    }),
  );
}

