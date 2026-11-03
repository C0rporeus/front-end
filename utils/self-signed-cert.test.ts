/**
 * @jest-environment node
 */
import { X509Certificate, createPrivateKey, createPublicKey } from "node:crypto";
import { createSecureContext } from "node:tls";
import {
  CERT_LIMITS,
  generateSelfSignedCertificate,
  isValidSanHostname,
  normalizeAltNames,
  parseAltNames,
} from "./self-signed-cert";

jest.setTimeout(30_000);

const base = { commonName: "dev.local", organization: "Acme", validDays: 30, altNames: ["localhost", "127.0.0.1"] };

describe("generateSelfSignedCertificate (validado con el parser X.509 y TLS de Node)", () => {
  test("produces a certificate browsers accept: SAN, server auth, not a CA, self-signed", async () => {
    const result = await generateSelfSignedCertificate(base);
    const cert = new X509Certificate(result.certPem);

    expect(cert.subject).toContain("CN=dev.local");
    expect(cert.subject).toContain("O=Acme");
    expect(cert.subjectAltName).toContain("DNS:localhost");
    expect(cert.subjectAltName).toContain("IP Address:127.0.0.1");
    expect(cert.subjectAltName).toContain("DNS:dev.local"); // el CN siempre entra en el SAN
    expect(cert.checkHost("localhost")).toBe("localhost");
    expect(cert.checkIP("127.0.0.1")).toBe("127.0.0.1");
    expect(cert.ca).toBe(false);
    expect(cert.keyUsage).toContain("1.3.6.1.5.5.7.3.1"); // serverAuth
    expect(cert.verify(cert.publicKey)).toBe(true);
    expect(cert.issuer).toBe(cert.subject);
  });

  test("validity window starts slightly in the past and honours validDays", async () => {
    const result = await generateSelfSignedCertificate({ ...base, validDays: 10 });
    const cert = new X509Certificate(result.certPem);
    const days = (new Date(cert.validTo).getTime() - Date.now()) / 86_400_000;
    expect(days).toBeGreaterThan(9.9);
    expect(days).toBeLessThan(10.1);
    expect(new Date(cert.validFrom).getTime()).toBeLessThanOrEqual(Date.now());
  });

  test("the private key (PKCS#8) matches the certificate public key", async () => {
    const result = await generateSelfSignedCertificate(base);
    expect(result.keyPem).toMatch(/^-----BEGIN PRIVATE KEY-----\n/);
    const fromKey = createPublicKey(createPrivateKey(result.keyPem)).export({ type: "spki", format: "pem" });
    const fromCert = new X509Certificate(result.certPem).publicKey.export({ type: "spki", format: "pem" });
    expect(fromKey).toBe(fromCert);
  });

  test("RSA-2048 with SHA-256 signature", async () => {
    const cert = new X509Certificate((await generateSelfSignedCertificate(base)).certPem);
    expect(cert.publicKey.asymmetricKeyDetails?.modulusLength).toBe(2048);
    expect(cert.toString()).not.toMatch(/sha1/i);
  });

  test("supports wildcard names and IP addresses", async () => {
    const result = await generateSelfSignedCertificate({ ...base, commonName: "*.example.test", altNames: ["*.example.test", "10.0.0.5"] });
    const cert = new X509Certificate(result.certPem);
    expect(cert.checkHost("api.example.test")).toBe("*.example.test"); // devuelve el nombre del SAN que coincidió
    expect(cert.checkHost("example.test")).toBeUndefined(); // el comodín no cubre el apex
    expect(cert.checkIP("10.0.0.5")).toBe("10.0.0.5");
  });

  test("serial numbers are random and positive", async () => {
    const first = new X509Certificate((await generateSelfSignedCertificate(base)).certPem).serialNumber;
    const second = new X509Certificate((await generateSelfSignedCertificate(base)).certPem).serialNumber;
    expect(first).not.toBe(second);
    expect(first).toMatch(/^[0-9A-F]+$/);
  });

  test("builds a .pfx that the TLS engine can load only with the right password", async () => {
    const result = await generateSelfSignedCertificate({ ...base, pfxPassword: "s3cret!" });
    expect(result.pfx).toBeInstanceOf(Uint8Array);
    const pfx = Buffer.from(result.pfx as Uint8Array);
    expect(() => createSecureContext({ pfx, passphrase: "s3cret!" })).not.toThrow();
    expect(() => createSecureContext({ pfx, passphrase: "wrong" })).toThrow();
  });

  test("no .pfx is generated without a password", async () => {
    expect((await generateSelfSignedCertificate(base)).pfx).toBeUndefined();
  });

  test("uses localhost and 127.0.0.1 when no alt names are given", async () => {
    const result = await generateSelfSignedCertificate({ ...base, altNames: [] });
    expect(result.altNames).toEqual(["dev.local", "localhost", "127.0.0.1"]);
  });
});

describe("input validation", () => {
  test.each([
    ["localhost", true],
    ["dev.local", true],
    ["api.example.com", true],
    ["*.example.com", true],
    ["mi-servicio", true],
    ["-bad.example.com", false],
    ["bad_name.example.com", false],
    ["a..b", false],
    ["*.*.example.com", false],
    ["exa mple.com", false],
    ["", false],
  ])("isValidSanHostname(%s) = %s", (name, expected) => {
    expect(isValidSanHostname(name)).toBe(expected);
  });

  test("parseAltNames splits on commas, spaces, semicolons and lowercases", () => {
    expect(parseAltNames("Localhost, 127.0.0.1;API.example.com\n*.x.test")).toEqual([
      "localhost",
      "127.0.0.1",
      "api.example.com",
      "*.x.test",
    ]);
  });

  test("normalizeAltNames dedupes and rejects invalid or too many names", () => {
    expect(normalizeAltNames("a.test", ["a.test", "A.test", "b.test"])).toEqual(["a.test", "b.test"]);
    expect(() => normalizeAltNames("a.test", ["no es valido"])).toThrow(/no es un nombre DNS/);
    expect(() => normalizeAltNames("a.test", ["999.1.1.1.x_"])).toThrow();
    const many = Array.from({ length: CERT_LIMITS.maxNames + 1 }, (_, i) => `h${i}.test`);
    expect(() => normalizeAltNames("a.test", many)).toThrow(/Máximo/);
  });

  test.each([
    [{ ...base, validDays: 0 }, /días de validez/],
    [{ ...base, validDays: CERT_LIMITS.maxDays + 1 }, /días de validez/],
    [{ ...base, validDays: 1.5 }, /días de validez/],
    [{ ...base, commonName: "not valid!" }, /Common Name/],
    [{ ...base, organization: "x".repeat(CERT_LIMITS.maxFieldLength + 1) }, /organización/],
    [{ ...base, pfxPassword: "x".repeat(CERT_LIMITS.maxPasswordLength + 1) }, /contraseña/],
  ])("rejects invalid options %#", async (options, message) => {
    await expect(generateSelfSignedCertificate(options)).rejects.toThrow(message);
  });
});
