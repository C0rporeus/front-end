import Link from "next/link";
import { TOOL_CATEGORIES } from "./tools-config";

const ToolsOverviewGrid = () => {
  return (
    <div className="space-y-10">
      {TOOL_CATEGORIES.map((category) => (
        <section key={category.id}>
          <h2 className="mb-4 text-xl font-semibold text-text-primary">
            <span className="mr-2">{category.icon}</span>
            {category.label}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {category.tools.map((tool) => {
              const isComingSoon = tool.status === "coming-soon";

              if (isComingSoon) {
                return (
                  <div
                    key={tool.slug}
                    className="rounded-2xl border border-slate-700/50 bg-surface-800/35 p-5 opacity-50"
                  >
                    <h3 className="text-base font-medium text-text-muted">
                      {tool.label}
                      <span className="ml-2 text-xs">(pronto)</span>
                    </h3>
                    <p className="mt-1 text-sm text-text-muted/70">{tool.description}</p>
                  </div>
                );
              }

              return (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="group rounded-2xl border border-slate-700/80 bg-surface-800/65 p-5 shadow-soft transition-colors duration-200 hover:border-brand-400/70"
                >
                  <h3 className="text-base font-medium text-text-primary group-hover:text-brand-400">
                    {tool.label}
                    {tool.status === "beta" && (
                      <span className="ml-2 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-300">
                        beta
                      </span>
                    )}
                  </h3>
                  <p className="mt-1 text-sm text-text-secondary">{tool.description}</p>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};

export default ToolsOverviewGrid;
