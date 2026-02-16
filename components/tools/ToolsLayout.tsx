import { useState } from "react";
import LandingHeader from "@/components/layout/landing/LandingHeader";
import ToolsSidebar from "./ToolsSidebar";

type ToolsLayoutProps = {
  children: React.ReactNode;
};

const ToolsLayout = ({ children }: ToolsLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <LandingHeader />
      <div className="flex pt-[72px]">
        <ToolsSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <button
          type="button"
          className="fixed bottom-4 right-4 z-30 rounded-full border border-slate-500/60 bg-surface-800/90 p-3 text-text-secondary shadow-lg backdrop-blur-sm hover:bg-surface-700/90 hover:text-text-primary md:hidden"
          onClick={() => setSidebarOpen((prev) => !prev)}
          aria-label={sidebarOpen ? "Cerrar menu de herramientas" : "Abrir menu de herramientas"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        <main className="min-h-[calc(100vh-72px)] w-full md:ml-64">
          <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8 md:py-12">
            {children}
          </div>
        </main>
      </div>
    </>
  );
};

export default ToolsLayout;
