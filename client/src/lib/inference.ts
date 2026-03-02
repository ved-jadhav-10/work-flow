export type InferenceMode = "cloud" | "local";

export const INFERENCE_MODE_KEY = "inference_mode";

export function getInferenceMode(): InferenceMode {
  if (typeof window === "undefined") return "cloud";
  return (localStorage.getItem(INFERENCE_MODE_KEY) as InferenceMode) ?? "cloud";
}

export function setInferenceMode(mode: InferenceMode) {
  localStorage.setItem(INFERENCE_MODE_KEY, mode);
  window.dispatchEvent(new CustomEvent("inferenceModeChanged", { detail: mode }));
}
