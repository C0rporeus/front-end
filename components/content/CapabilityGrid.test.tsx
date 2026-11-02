import { initials } from "./CapabilityGrid";

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
