import Link from "next/link";
import { useRouter } from "next/router";
import { TOOL_CATEGORIES } from "./tools-config";

type ToolsSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ToolsSidebar = ({ isOpen, onClose }: ToolsSidebarProps) => {
  const router = useRouter();
  const currentPath = router.asPath;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-[72px] z-40 h-[calc(100vh-72px)] w-64 overflow-y-auto border-r border-slate-700/60 bg-surface-900/95 backdrop-blur-md transition-transform duration-200 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Navegacion de herramientas"
      >
        <nav className="p-4">
          <Link
            href="/tools"
            className={`mb-4 block rounded-md px-3 py-2 text-sm font-medium ${
              currentPath === "/tools"
                ? "border-l-2 border-brand-400 bg-brand-600/25 text-text-primary"
                : "text-text-secondary hover:bg-surface-800/45 hover:text-text-primary"
            }`}
            onClick={onClose}
          >
            Todas las herramientas
          </Link>

          {TOOL_CATEGORIES.map((category) => (
            <div key={category.id} className="mb-4">
              <h3 className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                <span className="mr-1.5">{category.icon}</span>
                {category.label}
              </h3>
              <ul className="space-y-0.5">
                {category.tools.map((tool) => {
                  const href = `/tools/${tool.slug}`;
                  const isActive = currentPath === href;
                  const isComingSoon = tool.status === "coming-soon";

                  return (
                    <li key={tool.slug}>
                      {isComingSoon ? (
                        <span className="block cursor-not-allowed rounded-md px-3 py-2 text-sm text-text-muted/50">
                          {tool.label}
                          <span className="ml-1.5 text-xs">(pronto)</span>
                        </span>
                      ) : (
                        <Link
                          href={href}
                          className={`block rounded-md px-3 py-2 text-sm ${
                            isActive
                              ? "border-l-2 border-brand-400 bg-brand-600/25 text-text-primary"
                              : "text-text-secondary hover:bg-surface-800/45 hover:text-text-primary"
                          }`}
                          aria-current={isActive ? "page" : undefined}
                          onClick={onClose}
                        >
                          {tool.label}
                          {tool.status === "beta" && (
                            <span className="ml-1.5 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-300">
                              beta
                            </span>
                          )}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default ToolsSidebar;
