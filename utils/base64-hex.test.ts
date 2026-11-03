import { base64ToHex, hexToBase64 } from "./base64-hex";

describe("base64 <-> hex (RFC 4648 test vectors)", () => {
  const vectors: Array<[string, string, string]> = [
    // texto, hex, base64 estándar
    ["f", "66", "Zg=="],
    ["fo", "666f", "Zm8="],
    ["foo", "666f6f", "Zm9v"],
    ["foob", "666f6f62", "Zm9vYg=="],
    ["fooba", "666f6f6261", "Zm9vYmE="],
    ["foobar", "666f6f626172", "Zm9vYmFy"],
  ];

  test.each(vectors)("%s", (_text, hex, b64) => {
    expect(base64ToHex(b64)).toBe(hex);
    expect(hexToBase64(hex)).toBe(b64);
  });

  test("url-safe alphabet without padding", () => {
    expect(hexToBase64("fbff", "url")).toBe("-_8");
    expect(hexToBase64("fbff", "std")).toBe("+/8=");
    expect(base64ToHex("-_8")).toBe("fbff");
    expect(base64ToHex("+/8=")).toBe("fbff");
  });

  test("accepts 0x prefix, spaces and uppercase hex", () => {
    expect(hexToBase64("0x66 6F 6F")).toBe("Zm9v");
  });

  test("empty input round-trips to empty", () => {
    expect(base64ToHex("")).toBe("");
    expect(hexToBase64("")).toBe("");
  });

  test("rejects invalid hex", () => {
    expect(() => hexToBase64("abc")).toThrow(/hexadecimal/);
    expect(() => hexToBase64("zz")).toThrow(/hexadecimal/);
  });

  test("rejects invalid base64", () => {
    expect(() => base64ToHex("%%%")).toThrow(/base64/);
    expect(() => base64ToHex("A")).toThrow(/base64/);
  });
});
