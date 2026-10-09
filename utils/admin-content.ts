import type { Experience } from "@/interfaces/Experience";
import { resolveContentKind, type ContentKind } from "@/utils/content-kind";

export type AdminContentView = "blog" | "experiences" | "skills" | "portfolio" | "ops";

const VIEW_KIND: Record<Exclude<AdminContentView, "ops">, ContentKind> = {
  blog: "blog",
  experiences: "experience",
  skills: "skill",
  portfolio: "portfolio",
};

export function filterAdminContent(items: Experience[], view: AdminContentView): Experience[] {
  if (view === "ops") return [];
  return items.filter((item) => resolveContentKind(item) === VIEW_KIND[view]);
}
