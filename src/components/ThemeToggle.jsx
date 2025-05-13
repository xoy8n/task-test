"use client";

import { Button } from "@/components/ui/button";
import useCanvasStore from "@/store/useCanvasStore";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useCanvasStore();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleDarkMode}
      className="rounded-full"
    >
      {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
