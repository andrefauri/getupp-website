/**
 * Target launch date for the countdown shown next to "Soon on iPhone".
 * Placeholder until the real date is decided — update this one constant
 * and every countdown on the site follows.
 */
export const LAUNCH_DATE = new Date('2026-09-01T08:00:00Z');

/** Formats the time remaining until `target` as DD:HH:MM:SS. */
export function formatRemaining(target: Date, now: Date = new Date()): string {
  let seconds = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
  const days = Math.floor(seconds / 86400);
  seconds -= days * 86400;
  const hours = Math.floor(seconds / 3600);
  seconds -= hours * 3600;
  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;
  return [days, hours, minutes, seconds]
    .map((n) => String(n).padStart(2, '0'))
    .join(':');
}
