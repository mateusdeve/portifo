export const NEON_REACTFLOW_ADD_TEXT_NODE_EVENT =
  "neonflow:addTextNode";

export type NeonReactFlowAddTextNodePayload = {
  text: string;
};

export function dispatchReactFlowAddTextNode(payload: NeonReactFlowAddTextNodePayload) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<NeonReactFlowAddTextNodePayload>(NEON_REACTFLOW_ADD_TEXT_NODE_EVENT, {
      detail: payload,
    }),
  );
}

