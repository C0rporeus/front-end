/**
 * Shared input validation and sanitization utilities for frontend forms.
 * These complement backend validation — defense in depth.
 */

const DANGEROUS_PATTERNS = [
  /<script[\s>]/i,
  /javascript\s*:/i,
  /on\w+\s*=/i,
  /data\s*:\s*text\/html/i,
  /vbscript\s*:/i,
];

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const DOMAIN_REGEX =
  /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
const IPV4_REGEX = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
const CIDR_REGEX = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}$/;

/** Maximum input lengths matching backend constants */
export const INPUT_LIMITS = {
  title: 200,
  summary: 500,
  body: 50000,
  tag: 50,
  maxTags: 20,
  maxImageUrls: 10,
  email: 254,
  password: 128,
  contactName: 100,
  contactMessage: 500,
  base64Input: 1_000_000,
  certCommonName: 100,
  certOrganization: 100,
  domain: 253,
} as const;

/** Check if input contains dangerous patterns (XSS, script injection). */
export function containsDangerousPatterns(input: string): boolean {
  return DANGEROUS_PATTERNS.some((p) => p.test(input));
}

/** Validate email format. */
export function isValidEmail(email: string): boolean {
  return email.length <= INPUT_LIMITS.email && EMAIL_REGEX.test(email);
}

/** Validate domain name format. */
export function isValidDomain(domain: string): boolean {
  return domain.length <= INPUT_LIMITS.domain && DOMAIN_REGEX.test(domain);
}

/** Validate IPv4 address with octet range check. */
export function isValidIPv4(ip: string): boolean {
  const match = IPV4_REGEX.exec(ip);
  if (!match) return false;
  for (let i = 1; i <= 4; i++) {
    if (parseInt(match[i], 10) > 255) return false;
  }
  return true;
}

/** Validate CIDR notation. */
export function isValidCIDR(cidr: string): boolean {
  if (!CIDR_REGEX.test(cidr)) return false;
  const [ip, prefix] = cidr.split("/");
  const prefixNum = parseInt(prefix, 10);
  return isValidIPv4(ip) && prefixNum >= 0 && prefixNum <= 32;
}

/** Validate IPv4 or domain. */
export function isValidIPv4OrDomain(input: string): boolean {
  return isValidIPv4(input) || isValidDomain(input);
}

/** Validate URL is HTTP or HTTPS. */
export function isValidURL(rawUrl: string): boolean {
  if (rawUrl.length > 2048) return false;
  try {
    const parsed = new URL(rawUrl);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Validate password strength:
 * - 8-128 chars
 * - At least one uppercase, one lowercase, one digit
 */
export function isValidPassword(password: string): boolean {
  if (password.length < 8 || password.length > INPUT_LIMITS.password)
    return false;
  return /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
}

/** Strip HTML tags for plain-text preview (lightweight, not for security). */
export function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}
