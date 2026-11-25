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
  startsAt: "2026-12-12T16:00:00+01:00",
  endsAt: "2026-12-12T20:00:00+01:00",

  doors: "16:00",
  time: "4:00 PM – 8:00 PM WAT",
  city: "Abuja",
  country: "Nigeria",
  venue: "The Barcelona Hotel rooftop, Wuse 2",

  /** Display forms, so formatting stays consistent across surfaces. */
  dateNumeric: "12.12.2026",
  dateLong: "Saturday, 12 December 2026",
  dateEmail: "Saturday, 12 December 2026",

  /** Public origin — used to build the QR pass URL. */
  siteUrl: "https://houseofze.com",
} as const;

export const EVENT_LOCATION = `${EVENT.city}, ${EVENT.country}`;

/** The URL a guest's QR code resolves to. */
export const passUrl = (code: string) => `${EVENT.siteUrl}/pass/${encodeURIComponent(code)}`;
