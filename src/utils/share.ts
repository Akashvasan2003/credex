import type { AuditResult } from "@/types";

function toBase64Url(value: string): string {
  if (typeof window === "undefined") {
    return Buffer.from(value, "utf8").toString("base64url");
  }

  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): string {
  if (typeof window === "undefined") {
    return Buffer.from(value, "base64url").toString("utf8");
  }

  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function serializeAuditForShare(audit: AuditResult): string {
  return toBase64Url(JSON.stringify(audit));
}

export function deserializeAuditFromShare(value?: string): AuditResult | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(fromBase64Url(value)) as AuditResult;
    if (!parsed?.id || !Array.isArray(parsed.recommendations)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
