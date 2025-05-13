"use client";

import Toolbar from "@/components/Toolbar";
import Canvas from "@/components/Canvas";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen p-4 md:p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-center">캔버스 드로잉 앱</h1>
        <p className="text-sm text-center text-muted-foreground">
          Next.js와 Fabric.js로 만든 간단한 드로잉 애플리케이션
        </p>
      </header>

      <main className="flex-1 flex flex-col">
        <Toolbar />
        <div className="flex-1 relative overflow-hidden">
          <Canvas />
        </div>
      </main>

      <footer className="mt-6 text-center text-sm text-muted-foreground">
        <p>© 2025 Canvas Drawing App. 모든 권리 보유.</p>
      </footer>
    </div>
  );
}
