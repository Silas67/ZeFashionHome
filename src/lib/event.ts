/**
 * Single source of truth for event facts.
 *
 * Every guest-facing surface — hero, countdown, confirmations, pass page — reads
 * from here. Do not hard-code the date or venue anywhere else. The worker keeps
 * a mirror of these values in ze-mailer/src/index.ts (EVENT); change both together.
 */

export const EVENT = {
  name: "LIVING MANNEQUIN",
  brand: "Zë",

  /** Doors open. WAT (+01:00) is explicit so the countdown is identical worldwide. */
  startsAt: "2026-08-29T16:00:00+01:00",

  doors: "16:00",
  city: "Abuja",
  country: "Nigeria",
  venue: "Venue details to follow",

  /** Display forms, so formatting stays consistent across surfaces. */
  dateNumeric: "29 · 08 · 2026",
  dateLong: "29 · August · 2026",
  dateEmail: "29 August 2026",

  /** Public origin — used to build the QR pass URL. */
  siteUrl: "https://houseofze.com",
} as const;

export const EVENT_LOCATION = `${EVENT.city}, ${EVENT.country}`;

/** The URL a guest's QR code resolves to. */
export const passUrl = (code: string) => `${EVENT.siteUrl}/pass/${encodeURIComponent(code)}`;
