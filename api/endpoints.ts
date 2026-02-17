// Public endpoints
export const API_LOGIN = "/api/login";
export const API_REGISTER = "/api/register";

export const API_CONTACT = "/api/contact";
export const API_EXPERIENCES = "/api/experiences";
export const API_SKILLS = "/api/skills";

// Private endpoints (require Bearer token)
export const API_PRIVATE_ME = "/api/private/me";
export const API_PRIVATE_REFRESH = "/api/private/refresh";
export const API_PRIVATE_EXPERIENCES = "/api/private/experiences";
export const API_PRIVATE_SKILLS = "/api/private/skills";

export const API_PRIVATE_OPS_METRICS = "/api/private/ops/metrics";
export const API_PRIVATE_OPS_ALERTS = "/api/private/ops/alerts";
export const API_PRIVATE_OPS_HEALTH = "/api/private/ops/health";
export const API_PRIVATE_OPS_HISTORY = "/api/private/ops/history";
export const API_PRIVATE_OPS_SUMMARY = "/api/private/ops/summary";

// Tools endpoints
export const API_TOOLS_BASE64_ENCODE = "/api/tools/base64/encode";
export const API_TOOLS_BASE64_DECODE = "/api/tools/base64/decode";
export const API_TOOLS_UUID_V4 = "/api/tools/uuid/v4";
export const API_TOOLS_CERTS_SELF_SIGNED = "/api/tools/certs/self-signed";
export const API_TOOLS_DNS_RESOLVE = "/api/tools/dns/resolve";
export const API_TOOLS_DNS_PROPAGATION = "/api/tools/dns/propagation";
export const API_TOOLS_DNS_MAIL_RECORDS = "/api/tools/dns/mail-records";
export const API_TOOLS_DNS_BLACKLIST = "/api/tools/dns/blacklist";
