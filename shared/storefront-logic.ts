import type { StorefrontConfig } from "./storefront";

export type DropRemainingTime = {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export function isStorefrontLocked(config?: Pick<StorefrontConfig, "maintenance"> | null) {
  return Boolean(config?.maintenance.enabled);
}

export function hasStorefrontAnnouncement(config?: Pick<StorefrontConfig, "announcement"> | null) {
  return Boolean(config?.announcement.enabled && config.announcement.text.trim());
}

export function getDropRemainingTime(targetAt: string | null, now = Date.now()): DropRemainingTime {
  const total = targetAt ? Math.max(0, Date.parse(targetAt) - now) : 0;
  return {
    total,
    days: Math.floor(total / 86_400_000),
    hours: Math.floor((total / 3_600_000) % 24),
    minutes: Math.floor((total / 60_000) % 60),
    seconds: Math.floor((total / 1_000) % 60),
  };
}
