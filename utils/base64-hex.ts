/** Conversión base64 ↔ hex en el navegador: el contenido nunca se envía al servidor. */

const HEX_REGEX = /^(?:[0-9a-fA-F]{2})*$/;

function bytesToBinary(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return binary;
}

/** Acepta base64 estándar o url-safe, con o sin relleno. Lanza Error si no es válido. */
export function base64ToBytes(value: string): Uint8Array {
  const normalized = value.trim().replace(/-/g, "+").replace(/_/g, "/").replace(/=+$/, "");
  if (!/^[A-Za-z0-9+/]*$/.test(normalized) || normalized.length % 4 === 1) {
    throw new Error("El valor no es base64 válido");
  }
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export function base64ToHex(value: string): string {
  return Array.from(base64ToBytes(value), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** `variant` "url" produce base64url sin relleno (RFC 4648 §5). */
export function hexToBase64(value: string, variant: "std" | "url" = "std"): string {
  const hex = value.trim().replace(/^0x/i, "").replace(/\s+/g, "");
  if (!HEX_REGEX.test(hex)) {
    throw new Error("El valor no es hexadecimal válido (longitud par y solo 0-9 a-f)");
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  const std = btoa(bytesToBinary(bytes));
  return variant === "url" ? std.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : std;
}
