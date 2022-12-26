import { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { CanvasDirection } from "reaflow";
import { defaultJson, defaultYaml } from "src/constants/data";
import create from "zustand";

interface ConfigActions {
  setJson: (json: string) => void;
  setYaml: (yaml: string) => void;
  setConfig: (key: keyof Config, value: unknown) => void;
  getJson: () => string;
  zoomIn: () => void;
  zoomOut: () => void;
  centerView: () => void;
}

const initialStates = {
  json: defaultJson,
  yaml: defaultYaml,
  cursorMode: "move" as "move" | "navigation",
  layout: "DOWN" as CanvasDirection,
  expand: true,
  hideEditor: false,
  performanceMode: true,
  disableLoading: false,
  zoomPanPinch: undefined as ReactZoomPanPinchRef | undefined,
};

export type Config = typeof initialStates;

const useConfig = create<Config & ConfigActions>()((set, get) => ({
  ...initialStates,
  getJson: () => get().json,
  setJson: (json: string) => set({ json }),
  getYaml: () => get().yaml,
  setYaml: (yaml: string) => set({yaml}),
  zoomIn: () => {
    const zoomPanPinch = get().zoomPanPinch;
    if (zoomPanPinch) {
      zoomPanPinch.setTransform(
        zoomPanPinch?.state.positionX,
        zoomPanPinch?.state.positionY,
        zoomPanPinch?.state.scale + 0.4
      );
    }
  },
  zoomOut: () => {
    const zoomPanPinch = get().zoomPanPinch;
    if (zoomPanPinch) {
      zoomPanPinch.setTransform(
        zoomPanPinch?.state.positionX,
        zoomPanPinch?.state.positionY,
        zoomPanPinch?.state.scale - 0.4
      );
    }
  },
  centerView: () => {
    const zoomPanPinch = get().zoomPanPinch;
    const canvas = document.querySelector(".jsoncrack-canvas") as HTMLElement;
    if (zoomPanPinch && canvas) zoomPanPinch.zoomToElement(canvas);
  },
  setConfig: (setting: keyof Config, value: unknown) => set({ [setting]: value }),
}));

export default useConfig;
