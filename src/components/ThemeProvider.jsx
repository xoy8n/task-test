"use client";

import { useEffect } from "react";
import useCanvasStore from "@/store/useCanvasStore";
import ThemeToggle from "./ThemeToggle";

export default function ThemeProvider({ children }) {
  const { isDarkMode } = useCanvasStore();

  // 다크 모드 클래스를 HTML 요소에 적용
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div className="relative">
      {/* 테마 토글 버튼 */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      {children}
    </div>
  );
}
