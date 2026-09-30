import type { Request } from "express";
import crypto from "crypto";

export function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket.remoteAddress || "unknown";
}

export function getDeviceFingerprint(req: Request): string {
  const header = req.headers["x-device-fingerprint"];
  if (typeof header === "string" && header.length >= 8) {
    return header.slice(0, 128);
  }
  const ua = req.headers["user-agent"] || "unknown";
  return crypto.createHash("sha256").update(`${getClientIp(req)}|${ua}`).digest("hex");
}
