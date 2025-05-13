import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCanvasStore = create(
  persist(
    (set, get) => ({
      // 현재 선택된 도구
      currentTool: "pen",

      // 현재 선택된 색상
      currentColor: "#000000",

      // 현재 브러시 두께
      brushSize: 5,

      // 현재 투명도 (0-1)
      opacity: 1,

      // 다크 모드 상태
      isDarkMode: false,

      // 히스토리 관리를 위한 상태
      canvasHistory: {
        past: [],
        future: [],
      },

      // 상태 업데이트 함수들
      setCurrentTool: (tool) => set({ currentTool: tool }),
      setCurrentColor: (color) => set({ currentColor: color }),
      setBrushSize: (size) => set({ brushSize: size }),
      setOpacity: (opacity) => set({ opacity: opacity }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

      // 캔버스 히스토리 관리 함수들
      addToHistory: (canvasState) => {
        // SSR에서 window 객체를 확인
        if (typeof window === "undefined") return;

        // 히스토리에 추가하기 전에 전역 캔버스가 있는지 확인
        if (!window._canvas) return;

        set((state) => ({
          canvasHistory: {
            past: [...state.canvasHistory.past, canvasState],
            future: [],
          },
        }));
      },

      undo: () => {
        // SSR에서 window 객체를 확인
        if (typeof window === "undefined") return;

        const { canvasHistory } = get();
        const { past, future } = canvasHistory;

        if (past.length === 0) return;

        const newPast = [...past];
        const lastState = newPast.pop();

        set({
          canvasHistory: {
            past: newPast,
            future: [lastState, ...future],
          },
        });

        // 전역 캔버스가 있을 경우 상태 복원
        if (window._canvas) {
          // 과거 상태가 있으면 해당 상태로 복원
          if (newPast.length > 0) {
            window._canvas.loadFromJSON(newPast[newPast.length - 1], () => {
              window._canvas.renderAll();
            });
          } else {
            // 과거 상태가 없으면 빈 캔버스로 초기화
            window._canvas.clear();
            window._canvas.backgroundColor = "#ffffff";
            window._canvas.renderAll();
          }
        }
      },

      redo: () => {
        // SSR에서 window 객체를 확인
        if (typeof window === "undefined") return;

        const { canvasHistory } = get();
        const { past, future } = canvasHistory;

        if (future.length === 0) return;

        const newFuture = [...future];
        const nextState = newFuture.shift();

        set({
          canvasHistory: {
            past: [...past, nextState],
            future: newFuture,
          },
        });

        // 전역 캔버스가 있을 경우 상태 복원
        if (window._canvas && nextState) {
          window._canvas.loadFromJSON(nextState, () => {
            window._canvas.renderAll();
          });
        }
      },

      clearHistory: () =>
        set({
          canvasHistory: {
            past: [],
            future: [],
          },
        }),
    }),
    {
      name: "canvas-storage", // 로컬 스토리지에 저장될 때 사용되는 키 이름
      partialize: (state) => ({
        // 로컬 스토리지에 저장할 상태만 선택
        currentTool: state.currentTool,
        currentColor: state.currentColor,
        brushSize: state.brushSize,
        opacity: state.opacity,
        isDarkMode: state.isDarkMode,
        // 캔버스 히스토리는 저장하지 않음
      }),
    }
  )
);

export default useCanvasStore;
