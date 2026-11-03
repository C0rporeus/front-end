/**
 * Certificados X.509 autofirmados generados 100 % en el navegador.
 *
 * - La clave se crea con WebCrypto (RSA-2048) y nunca sale del equipo del usuario.
 * - No se persiste nada: ni localStorage, ni sessionStorage, ni cookies, ni red.
 * - `node-forge` se carga bajo demanda solo para firmar el certificado y empaquetar el .pfx.
 */

import type { pki } from "node-forge";
import { isValidIPv4 } from "@/utils/input-validation";

export const CERT_LIMITS = {
  maxNames: 10,
  minDays: 1,
  maxDays: 3650,
  maxNameLength: 253,
  maxFieldLength: 100,
  maxPasswordLength: 128,
} as const;

export type SelfSignedCertOptions = {
  commonName: string;
  organization: string;
  validDays: number;
  /** Nombres DNS y/o IPv4 para el Subject Alternative Name. */
  altNames: string[];
  /** Si se indica, también se genera un .pfx protegido con esta contraseña. */
  pfxPassword?: string;
};

export type SelfSignedCertResult = {
  certPem: string;
  /** Clave privada en PKCS#8 ("BEGIN PRIVATE KEY"). */
  keyPem: string;
  /** .pfx (PKCS#12) con cifrado 3DES (compatible con Windows, Java y OpenSSL 3). */
  pfx?: Uint8Array;
  /** Nombres que quedaron en el SAN. */
  altNames: string[];
  notBefore: Date;
  notAfter: Date;
};

const HOSTNAME_REGEX = /^(\*\.)?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/;
const DEFAULT_SAN = ["localhost", "127.0.0.1"];
const CLOCK_SKEW_MS = 5 * 60 * 1000;

/** Acepta `localhost`, `dev.local`, `api.example.com` y `*.example.com` (nombres internos incluidos). */
export function isValidSanHostname(name: string): boolean {
  return name.length > 0 && name.length <= CERT_LIMITS.maxNameLength && HOSTNAME_REGEX.test(name);
}

export function parseAltNames(raw: string): string[] {
  return raw
    .split(/[\s,;]+/)
    .map((name) => name.trim().toLowerCase())
    .filter((name) => name.length > 0);
}

/** Devuelve la lista final y única de nombres del SAN o lanza Error con un mensaje para el usuario. */
export function normalizeAltNames(commonName: string, altNames: string[]): string[] {
  const requested = altNames.length > 0 ? altNames : [...DEFAULT_SAN];
  const names = Array.from(new Set([commonName, ...requested].map((name) => name.trim().toLowerCase()).filter(Boolean)));
  if (names.length > CERT_LIMITS.maxNames) {
    throw new Error(`Máximo ${CERT_LIMITS.maxNames} nombres en el SAN`);
  }
  for (const name of names) {
    if (!isValidIPv4(name) && !isValidSanHostname(name)) {
      throw new Error(`"${name}" no es un nombre DNS ni una IPv4 válidos`);
    }
  }
  return names;
}

function assertOptions(options: SelfSignedCertOptions): void {
  if (!isValidSanHostname(options.commonName.toLowerCase()) && !isValidIPv4(options.commonName)) {
    throw new Error("El Common Name debe ser un nombre DNS o una IPv4 válidos");
  }
  if (options.organization.length > CERT_LIMITS.maxFieldLength) {
    throw new Error(`La organización excede ${CERT_LIMITS.maxFieldLength} caracteres`);
  }
  if (!Number.isInteger(options.validDays) || options.validDays < CERT_LIMITS.minDays || options.validDays > CERT_LIMITS.maxDays) {
    throw new Error(`Los días de validez deben estar entre ${CERT_LIMITS.minDays} y ${CERT_LIMITS.maxDays}`);
  }
  if ((options.pfxPassword ?? "").length > CERT_LIMITS.maxPasswordLength) {
    throw new Error(`La contraseña excede ${CERT_LIMITS.maxPasswordLength} caracteres`);
  }
}

function toPem(label: string, der: ArrayBuffer): string {
  const bytes = new Uint8Array(der);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  const lines = btoa(binary).match(/.{1,64}/g) ?? [];
  return `-----BEGIN ${label}-----\n${lines.join("\n")}\n-----END ${label}-----\n`;
}

function randomSerialHex(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[0] &= 0x7f; // entero positivo
  bytes[0] |= 0x01; // evita un serial que empiece con ceros
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function generateSelfSignedCertificate(options: SelfSignedCertOptions): Promise<SelfSignedCertResult> {
  assertOptions(options);
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error("Este navegador no ofrece WebCrypto (se requiere HTTPS o localhost)");
  }
  const altNames = normalizeAltNames(options.commonName.trim(), options.altNames);

  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"],
  );
  const pkcs8 = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

  const forge = (await import("node-forge")).default;
  const privateKey = forge.pki.privateKeyFromAsn1(
    forge.asn1.fromDer(forge.util.createBuffer(new Uint8Array(pkcs8))),
  ) as pki.rsa.PrivateKey;
  const publicKey = forge.pki.setRsaPublicKey(privateKey.n, privateKey.e);

  const notBefore = new Date(Date.now() - CLOCK_SKEW_MS);
  const notAfter = new Date(Date.now() + options.validDays * 24 * 60 * 60 * 1000);

  const cert = forge.pki.createCertificate();
  cert.publicKey = publicKey;
  cert.serialNumber = randomSerialHex();
  cert.validity.notBefore = notBefore;
  cert.validity.notAfter = notAfter;
  const subject: pki.CertificateField[] = [{ name: "commonName", value: options.commonName.trim() }];
  if (options.organization.trim()) subject.push({ name: "organizationName", value: options.organization.trim() });
  cert.setSubject(subject);
  cert.setIssuer(subject);
  cert.setExtensions([
    { name: "basicConstraints", cA: false, critical: true },
    { name: "keyUsage", digitalSignature: true, keyEncipherment: true, critical: true },
    { name: "extKeyUsage", serverAuth: true, clientAuth: true },
    {
      name: "subjectAltName",
      altNames: altNames.map((name) => (isValidIPv4(name) ? { type: 7, ip: name } : { type: 2, value: name })),
    },
    { name: "subjectKeyIdentifier" },
  ]);
  cert.sign(privateKey, forge.md.sha256.create());

  let pfx: Uint8Array | undefined;
  if (options.pfxPassword) {
    const p12 = forge.pkcs12.toPkcs12Asn1(privateKey, [cert], options.pfxPassword, {
      algorithm: "3des",
      friendlyName: options.commonName.trim(),
    });
    const der = forge.asn1.toDer(p12).getBytes();
    pfx = Uint8Array.from(der, (char) => char.charCodeAt(0));
  }

  return {
    certPem: forge.pki.certificateToPem(cert),
    keyPem: toPem("PRIVATE KEY", pkcs8),
    pfx,
    altNames,
    notBefore,
    notAfter,
  };
}
