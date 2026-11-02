import { render, screen } from "@testing-library/react";

import CapabilitySlider from "./CapabilitySlider";
import { resolveCardsPerView } from "@/components/UI/useHorizontalSlider";

beforeAll(() => {
  if (!("ResizeObserver" in window)) {
    (window as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
      observe() {}
      disconnect() {}
    };
  }
});

const skill = (id: string, title: string) => ({
  id,
  title,
  summary: `Resumen de ${title}`,
  body: "",
  imageUrls: [],
  tags: ["go", "skill"],
});

describe("CapabilitySlider", () => {
  it("renders every capability as a non-clickable tile with its anchor", () => {
    const { container } = render(
      <>
        <h2 id="caps">Capacidades</h2>
        <CapabilitySlider
          title="Capacidades"
          labelledBy="caps"
          items={[skill("a", "Desarrollo de software"), skill("b", "Gobierno y seguridad")]}
        />
      </>,
    );

    expect(screen.getByRole("region", { name: "Capacidades" })).toBeInTheDocument();
    expect(screen.getByText("Desarrollo de software")).toBeInTheDocument();
    expect(container.querySelectorAll(".capability-slide a")).toHaveLength(0);
    expect(container.querySelector("#skill-a")).not.toBeNull();
    expect(screen.getByText("GS")).toBeInTheDocument();
    expect(screen.queryByText("skill")).not.toBeInTheDocument();
  });

  it("shows the empty message without items", () => {
    render(<CapabilitySlider title="Capacidades" labelledBy="caps" items={[]} emptyMessage="Nada todavía" />);
    expect(screen.getByText("Nada todavía")).toBeInTheDocument();
  });
});

describe("resolveCardsPerView", () => {
  it("matches the track breakpoints", () => {
    expect(resolveCardsPerView(375)).toBe(1);
    expect(resolveCardsPerView(800)).toBe(2);
    expect(resolveCardsPerView(1280)).toBe(3);
  });
});
