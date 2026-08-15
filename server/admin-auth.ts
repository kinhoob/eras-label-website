import { timingSafeEqual } from "node:crypto";
import { ENV } from "./_core/env";

export const ADMIN_DISPLAY_NAME = "Eras Label Admin";

export function getAdminOpenId(email = ENV.adminLoginEmail) {
  return `admin:${email.trim().toLowerCase()}`;
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function validateAdminCredentials(email: string, password: string) {
  const configuredEmail = ENV.adminLoginEmail.trim().toLowerCase();
  const configuredPassword = ENV.adminLoginPassword;
  const normalizedEmail = email.trim().toLowerCase();

  if (!configuredEmail || !configuredPassword || !normalizedEmail || !password) {
    return false;
  }

  return safeEqual(normalizedEmail, configuredEmail) && safeEqual(password, configuredPassword);
}
