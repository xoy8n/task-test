"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Pencil,
  Eraser,
  Undo2,
  Redo2,
  Save,
  Trash2,
  Palette,
} from "lucide-react";
import useCanvasStore from "@/store/useCanvasStore";

export default function Toolbar() {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isBrowser, setIsBrowser] = useState(false);

  const currentTool = useCanvasStore((state) => state.currentTool);
  const currentColor = useCanvasStore((state) => state.currentColor);
  const brushSize = useCanvasStore((state) => state.brushSize);
  const setCurrentTool = useCanvasStore((state) => state.setCurrentTool);
  const setCurrentColor = useCanvasStore((state) => state.setCurrentColor);
  const setBrushSize = useCanvasStore((state) => state.setBrushSize);
  const undo = useCanvasStore((state) => state.undo);
  const redo = useCanvasStore((state) => state.redo);

  // 브라우저 환경 확인
  useEffect(() => {
    setIsBrowser(typeof window !== "undefined");
  }, []);

  // 이미지 내보내기 처리
  const handleExport = () => {
    if (!isBrowser) return;

    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    // 링크 생성 및 다운로드
    const link = document.createElement("a");
    link.download = "canvas-drawing.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  // 캔버스 초기화
  const handleClear = () => {
    if (!isBrowser) return;

    const fabricCanvas = window._canvas;
    if (fabricCanvas) {
      fabricCanvas.clear();
      fabricCanvas.backgroundColor = "#ffffff";
      fabricCanvas.renderAll();
    }
  };

  // 색상 선택 배열
  const colors = [
    "#000000",
    "#ffffff",
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#00ffff",
    "#ff00ff",
    "#c0c0c0",
    "#808080",
  ];

  return (
    <div className="toolbar p-3 md:p-4 mb-4 bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 flex flex-wrap items-center justify-center md:justify-start gap-3">
      {/* 툴 선택 그룹 */}
      <div className="tool-group flex gap-2">
        <Toggle
          pressed={currentTool === "pen"}
          onPressedChange={() => setCurrentTool("pen")}
          aria-label="펜"
          className="data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
        >
          <Pencil className="h-4 w-4" />
          <span className="sr-only md:not-sr-only md:ml-2 md:text-xs">펜</span>
        </Toggle>

        <Toggle
          pressed={currentTool === "eraser"}
          onPressedChange={() => setCurrentTool("eraser")}
          aria-label="지우개"
          className="data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
        >
          <Eraser className="h-4 w-4" />
          <span className="sr-only md:not-sr-only md:ml-2 md:text-xs">
            지우개
          </span>
        </Toggle>
      </div>

      <Separator orientation="vertical" className="h-8 hidden md:block" />

      {/* 색상 선택기 */}
      <div className="color-picker-group relative">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => setShowColorPicker(!showColorPicker)}
        >
          <div
            className="color-preview w-4 h-4 rounded-full border border-neutral-300"
            style={{ backgroundColor: currentColor }}
          />
          <Palette className="h-4 w-4" />
          <span className="sr-only md:not-sr-only md:text-xs">색상</span>
        </Button>

        {showColorPicker && (
          <div className="color-picker-dropdown absolute top-full left-0 mt-1 p-2 bg-white dark:bg-neutral-800 rounded-md shadow-lg border border-neutral-200 dark:border-neutral-700 grid grid-cols-5 gap-1 z-50">
            {colors.map((color) => (
              <div
                key={color}
                className="color-option w-6 h-6 rounded-full cursor-pointer border border-neutral-300 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => {
                  setCurrentColor(color);
                  setShowColorPicker(false);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <Separator orientation="vertical" className="h-8 hidden md:block" />

      {/* 브러시 두께 조절 */}
      <div className="brush-size-group flex items-center gap-2">
        <span className="text-xs hidden md:inline">두께:</span>
        <Slider
          value={[brushSize]}
          min={1}
          max={30}
          step={1}
          className="w-16 md:w-24"
          onValueChange={(value) => setBrushSize(value[0])}
        />
        <span className="text-xs">{brushSize}px</span>
      </div>

      <Separator orientation="vertical" className="h-8 hidden md:block" />

      {/* 실행 취소/다시 실행 */}
      <div className="history-group flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={undo}
          className="px-2 md:px-3"
        >
          <Undo2 className="h-4 w-4" />
          <span className="sr-only md:not-sr-only md:ml-2 md:text-xs">
            실행 취소
          </span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={redo}
          className="px-2 md:px-3"
        >
          <Redo2 className="h-4 w-4" />
          <span className="sr-only md:not-sr-only md:ml-2 md:text-xs">
            다시 실행
          </span>
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8 hidden md:block" />

      {/* 기타 기능 */}
      <div className="actions-group flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="px-2 md:px-3"
        >
          <Save className="h-4 w-4" />
          <span className="sr-only md:not-sr-only md:ml-2 md:text-xs">
            저장
          </span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="px-2 md:px-3"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only md:not-sr-only md:ml-2 md:text-xs">
            지우기
          </span>
        </Button>
      </div>
    </div>
  );
}
