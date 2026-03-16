import {
  containsDangerousPatterns,
  isValidEmail,
  isValidDomain,
  isValidIPv4,
  isValidCIDR,
  isValidIPv4OrDomain,
  isValidURL,
  isValidPassword,
  stripTags,
  INPUT_LIMITS,
} from "./input-validation";

describe("input-validation", () => {
  describe("containsDangerousPatterns", () => {
    it("detects script tags", () => {
      expect(containsDangerousPatterns("<script>alert(1)</script>")).toBe(true);
      expect(containsDangerousPatterns("<script >x")).toBe(true);
    });
    it("detects javascript: URI", () => {
      expect(containsDangerousPatterns("javascript:alert(1)")).toBe(true);
    });
    it("detects onerror= event handlers", () => {
      expect(containsDangerousPatterns('img onerror="x"')).toBe(true);
    });
    it("detects data:text/html", () => {
      expect(containsDangerousPatterns("data:text/html,<h1>")).toBe(true);
    });
    it("detects vbscript:", () => {
      expect(containsDangerousPatterns("vbscript:msgbox()")).toBe(true);
    });
    it("returns false for safe text", () => {
      expect(containsDangerousPatterns("Hello world!")).toBe(false);
      expect(containsDangerousPatterns("https://example.com")).toBe(false);
    });
  });

  describe("isValidEmail", () => {
    it("accepts valid emails", () => {
      expect(isValidEmail("user@example.com")).toBe(true);
      expect(isValidEmail("a.b+c@sub.domain.org")).toBe(true);
    });
    it("rejects invalid emails", () => {
      expect(isValidEmail("not-an-email")).toBe(false);
      expect(isValidEmail("@domain.com")).toBe(false);
      expect(isValidEmail("user@")).toBe(false);
    });
    it("rejects emails exceeding max length", () => {
      expect(isValidEmail("a".repeat(INPUT_LIMITS.email + 1) + "@x.co")).toBe(false);
    });
  });

  describe("isValidDomain", () => {
    it("accepts valid domains", () => {
      expect(isValidDomain("example.com")).toBe(true);
      expect(isValidDomain("sub.domain.org")).toBe(true);
    });
    it("rejects invalid domains", () => {
      expect(isValidDomain("not a domain")).toBe(false);
      expect(isValidDomain("192.168.1.1")).toBe(false);
    });
    it("rejects domains exceeding max length", () => {
      expect(isValidDomain("a".repeat(INPUT_LIMITS.domain + 1) + ".com")).toBe(false);
    });
  });

  describe("isValidIPv4", () => {
    it("accepts valid IPs", () => {
      expect(isValidIPv4("192.168.1.1")).toBe(true);
      expect(isValidIPv4("0.0.0.0")).toBe(true);
      expect(isValidIPv4("255.255.255.255")).toBe(true);
    });
    it("rejects octets > 255", () => {
      expect(isValidIPv4("256.1.1.1")).toBe(false);
    });
    it("rejects non-IP strings", () => {
      expect(isValidIPv4("example.com")).toBe(false);
      expect(isValidIPv4("1.2.3")).toBe(false);
    });
  });

  describe("isValidCIDR", () => {
    it("accepts valid CIDR", () => {
      expect(isValidCIDR("192.168.1.0/24")).toBe(true);
      expect(isValidCIDR("10.0.0.0/8")).toBe(true);
    });
    it("rejects invalid prefix", () => {
      expect(isValidCIDR("192.168.1.0/33")).toBe(false);
    });
    it("rejects bad IP in CIDR", () => {
      expect(isValidCIDR("999.168.1.0/24")).toBe(false);
    });
    it("rejects non-CIDR strings", () => {
      expect(isValidCIDR("example.com")).toBe(false);
    });
  });

  describe("isValidIPv4OrDomain", () => {
    it("accepts IPv4", () => expect(isValidIPv4OrDomain("10.0.0.1")).toBe(true));
    it("accepts domain", () => expect(isValidIPv4OrDomain("example.com")).toBe(true));
    it("rejects random string", () => expect(isValidIPv4OrDomain("not valid!")).toBe(false));
  });

  describe("isValidURL", () => {
    it("accepts http and https URLs", () => {
      expect(isValidURL("https://example.com/path?q=1")).toBe(true);
      expect(isValidURL("http://localhost:3000")).toBe(true);
    });
    it("rejects data: URLs", () => {
      expect(isValidURL("data:image/png;base64,abc")).toBe(false);
    });
    it("rejects URLs exceeding 2048 chars", () => {
      expect(isValidURL("https://x.com/" + "a".repeat(2040))).toBe(false);
    });
    it("rejects malformed URLs", () => {
      expect(isValidURL("not a url")).toBe(false);
    });
  });

  describe("isValidPassword", () => {
    it("accepts strong passwords", () => {
      expect(isValidPassword("Strong1Password")).toBe(true);
    });
    it("rejects too short", () => {
      expect(isValidPassword("Ab1")).toBe(false);
    });
    it("rejects too long", () => {
      expect(isValidPassword("A1" + "a".repeat(INPUT_LIMITS.password))).toBe(false);
    });
    it("rejects missing uppercase", () => {
      expect(isValidPassword("alllower1")).toBe(false);
    });
    it("rejects missing digit", () => {
      expect(isValidPassword("NoDigitHere")).toBe(false);
    });
  });

  describe("stripTags", () => {
    it("removes HTML tags", () => {
      expect(stripTags("<p>Hello <b>world</b></p>")).toBe("Hello world");
    });
    it("returns plain text unchanged", () => {
      expect(stripTags("no tags here")).toBe("no tags here");
    });
  });
});
