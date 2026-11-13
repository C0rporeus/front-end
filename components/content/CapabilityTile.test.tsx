import { fireEvent, render } from "@testing-library/react";

import { CapabilityTileContent, initials } from "./CapabilityTile";

describe("initials", () => {
  it("skips connector words", () => {
    expect(initials("Gobierno y seguridad en Kubernetes")).toBe("GS");
    expect(initials("Infraestructura como código y nube")).toBe("IC");
    expect(initials("Software para dispositivos médicos e IoT")).toBe("SD");
  });

  it("ignores leading punctuation", () => {
    expect(initials("(SRE) Resiliencia")).toBe("SR");
  });

  it("handles one word and empty titles", () => {
    expect(initials("Backend")).toBe("B");
    expect(initials("")).toBe("");
  });
});

describe("CapabilityTileContent mark", () => {
  const item = {
    id: "1",
    title: "Seguridad y cumplimiento",
    summary: "Resumen",
    body: "",
    imageUrls: ["https://cdn.test/full.jpg"],
    thumbUrl: "https://cdn.test/full-w640.jpg",
    tags: [],
  };

  it("uses the thumbnail first, then the original, then the initials", () => {
    const { container } = render(<CapabilityTileContent item={item} />);
    const image = () => container.querySelector("img");
    expect(image()?.getAttribute("src")).toBe(item.thumbUrl);

    fireEvent.error(image() as HTMLImageElement);
    expect(image()?.getAttribute("src")).toBe(item.imageUrls[0]);

    fireEvent.error(image() as HTMLImageElement);
    expect(image()).toBeNull();
    expect(container.querySelector(".capability-mark")?.textContent).toBe("SC");
  });

  it("falls back to the original when there is no thumbnail", () => {
    const { container } = render(<CapabilityTileContent item={{ ...item, thumbUrl: undefined }} />);
    expect(container.querySelector("img")?.getAttribute("src")).toBe(item.imageUrls[0]);
  });
});
