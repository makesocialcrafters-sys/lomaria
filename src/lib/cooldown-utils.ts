const COOLDOWN_MS = 72 * 60 * 60 * 1000; // 72 hours

export interface CooldownInfo {
  isActive: boolean;
  remainingMs: number;
  remainingText: string;
}

export function getCooldownInfo(rejectedAt: string | null): CooldownInfo {
  if (!rejectedAt) {
    return { isActive: false, remainingMs: 0, remainingText: "" };
  }

  const rejectedTime = new Date(rejectedAt).getTime();
  const now = Date.now();
  const elapsed = now - rejectedTime;
  const remainingMs = COOLDOWN_MS - elapsed;

  if (remainingMs <= 0) {
    return { isActive: false, remainingMs: 0, remainingText: "" };
  }

  const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
  const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));

  const remainingText = remainingDays > 1
    ? `${remainingDays} Tagen`
    : remainingHours > 1
      ? `${remainingHours} Stunden`
      : "weniger als 1 Stunde";

  return { isActive: true, remainingMs, remainingText };
}
