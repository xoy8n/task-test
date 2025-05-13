"use client";

import { useEffect, useRef, useState } from "react";
import useCanvasStore from "@/store/useCanvasStore";

export default function Canvas() {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isFabricLoaded, setIsFabricLoaded] = useState(false);

  const currentTool = useCanvasStore((state) => state.currentTool);
  const currentColor = useCanvasStore((state) => state.currentColor);
  const brushSize = useCanvasStore((state) => state.brushSize);
  const opacity = useCanvasStore((state) => state.opacity);
  const addToHistory = useCanvasStore((state) => state.addToHistory);

  // Fabric.js 동적 로드
  useEffect(() => {
    // SSR에서는 window 객체가 없으므로 확인
    if (typeof window === "undefined") return;

    const loadFabric = async () => {
      try {
        // fabric 모듈을 직접 import하여 사용
        const fabricModule = await import("fabric");
        setIsFabricLoaded(true);
      } catch (error) {
        console.error("Fabric.js 로드 중 오류 발생:", error);
      }
    };

    loadFabric();
  }, []);

  // 캔버스 크기 계산 함수
  const calculateCanvasSize = () => {
    if (!containerRef.current || typeof window === "undefined")
      return { width: 800, height: 600 };

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    return {
      width: containerWidth - 40, // 좌우 패딩 고려
      height: containerHeight - 40, // 상하 패딩 고려
    };
  };

  // Fabric.js 캔버스 초기화
  useEffect(() => {
    if (
      !isFabricLoaded ||
      !canvasRef.current ||
      typeof window === "undefined" ||
      !containerRef.current
    )
      return;

    // 이미 초기화된 경우 중복 초기화 방지
    if (fabricCanvasRef.current) return;

    const initCanvas = async () => {
      try {
        // fabric 모듈을 다시 가져와서 Canvas 클래스와 PencilBrush 사용
        const { Canvas, PencilBrush } = await import("fabric");

        const canvasSize = calculateCanvasSize();

        // 캔버스 생성
        const fabricCanvas = new Canvas(canvasRef.current, {
          isDrawingMode: true,
          width: canvasSize.width,
          height: canvasSize.height,
          backgroundColor: "#fff",
        });

        // freeDrawingBrush 초기화 - Fabric.js v6에서는 명시적으로 생성해야 함
        fabricCanvas.freeDrawingBrush = new PencilBrush(fabricCanvas);
        fabricCanvas.freeDrawingBrush.color = currentColor;
        fabricCanvas.freeDrawingBrush.width = brushSize;

        // 현재 상태 저장
        fabricCanvasRef.current = fabricCanvas;

        // 전역에서 접근 가능하도록 설정 (Toolbar에서 사용)
        window._canvas = fabricCanvas;

        // 이벤트 리스너 등록 - 그리기 완료시 히스토리에 추가
        fabricCanvas.on("mouse:up", () => {
          if (fabricCanvas.isDrawingMode) {
            // JSON으로 직렬화한 캔버스 상태를 히스토리에 추가
            addToHistory(fabricCanvas.toJSON());
          }
        });

        // 창 크기 변경시 캔버스 크기 조정
        const handleResize = () => {
          const newSize = calculateCanvasSize();
          fabricCanvas.setDimensions({
            width: newSize.width,
            height: newSize.height,
          });
          fabricCanvas.renderAll();
        };

        window.addEventListener("resize", handleResize);

        // 브러시 상태 초기화
        updateBrush(fabricCanvas);

        return () => {
          window.removeEventListener("resize", handleResize);
          fabricCanvas.dispose();
          fabricCanvasRef.current = null;
          window._canvas = null;
        };
      } catch (error) {
        console.error("캔버스 초기화 중 오류 발생:", error);
      }
    };

    initCanvas();
  }, [isFabricLoaded, addToHistory, currentColor, brushSize]);

  // 브러시 업데이트 함수
  const updateBrush = async (canvas) => {
    if (!canvas) return;

    try {
      // PencilBrush 클래스 가져오기
      const { PencilBrush } = await import("fabric");

      if (currentTool === "pen") {
        canvas.isDrawingMode = true;
        // 기존 브러시가 없으면 새로 생성
        if (!canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush = new PencilBrush(canvas);
        }
        canvas.freeDrawingBrush.color = currentColor;
        canvas.freeDrawingBrush.width = brushSize;
      } else if (currentTool === "eraser") {
        canvas.isDrawingMode = true;
        // 기존 브러시가 없으면 새로 생성
        if (!canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush = new PencilBrush(canvas);
        }
        canvas.freeDrawingBrush.color = "#ffffff";
        canvas.freeDrawingBrush.width = brushSize;
      } else {
        canvas.isDrawingMode = false;
      }
    } catch (error) {
      console.error("브러시 업데이트 중 오류 발생:", error);
    }
  };

  // 도구 변경시 이벤트 처리
  useEffect(() => {
    if (
      !fabricCanvasRef.current ||
      !isFabricLoaded ||
      typeof window === "undefined"
    )
      return;

    const canvas = fabricCanvasRef.current;
    updateBrush(canvas);
  }, [currentTool, currentColor, brushSize, isFabricLoaded]);

  // 브러시 속성 업데이트
  useEffect(() => {
    if (
      !fabricCanvasRef.current ||
      !fabricCanvasRef.current.freeDrawingBrush ||
      !isFabricLoaded ||
      typeof window === "undefined"
    )
      return;

    // 지우개가 아닌 경우에만 색상 변경
    if (currentTool !== "eraser") {
      fabricCanvasRef.current.freeDrawingBrush.color = currentColor;
    }

    fabricCanvasRef.current.freeDrawingBrush.width = brushSize;

    // opacity 설정은 fabric.js 버전에 따라 다를 수 있음
    if (
      typeof fabricCanvasRef.current.freeDrawingBrush.opacity !== "undefined"
    ) {
      fabricCanvasRef.current.freeDrawingBrush.opacity = opacity;
    }
  }, [currentColor, brushSize, opacity, currentTool, isFabricLoaded]);

  return (
    <div
      ref={containerRef}
      className="canvas-container flex justify-center items-center p-4 h-full w-full 
                bg-neutral-50 dark:bg-neutral-900 rounded-lg shadow-sm border 
                border-neutral-200 dark:border-neutral-800"
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
