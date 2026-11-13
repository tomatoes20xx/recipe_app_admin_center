// Display names and chart colors for analytics event types.

/**
 * Stacking order (bottom → top) and color for every event type the backend records.
 * The order was picked with the dataviz palette validator so that neighbouring
 * segments stay distinguishable (including for color-blind viewers), both for the
 * full list and for the eight common types on their own. Likes are red and
 * bookmarks green, as requested. Keep the order when adding types: append new ones
 * at the end, then re-run the validator.
 */
export const EVENT_TYPES: { type: string; color: string }[] = [
  { type: 'view',                  color: '#2a78d6' },
  { type: 'like',                  color: '#e34948' },
  { type: 'feed_card_tap',         color: '#eda100' },
  { type: 'search',                color: '#e87ba4' },
  { type: 'follow',                color: '#00805a' },
  { type: 'share',                 color: '#1c5cab' },
  { type: 'filter_applied',        color: '#0aa2c0' },
  { type: 'unfollow',              color: '#a8650a' },
  { type: 'signup_complete',       color: '#8a3ffc' },
  { type: 'onboarding_step_view',  color: '#8a8a00' },
  { type: 'email_verify_complete', color: '#c040a8' },
  { type: 'bookmark',              color: '#008300' },
  { type: 'recipe_cook',           color: '#6250d6' },
  { type: 'feed_view',             color: '#1baf7a' },
  { type: 'report',                color: '#b0233c' },
  { type: 'onboarding_complete',   color: '#4f7fbf' },
  { type: 'comment',               color: '#eb6834' },
];

const UNKNOWN_COLOR = '#a6acb6';
const COLOR_BY_TYPE = new Map(EVENT_TYPES.map((e) => [e.type, e.color]));
const ORDER_BY_TYPE = new Map(EVENT_TYPES.map((e, i) => [e.type, i]));

/** `feed_view` → "Feed View", `recipe_cook` → "Recipe Cook". */
export function eventLabel(type: string): string {
  return type
    .split('_')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

export function eventColor(type: string): string {
  return COLOR_BY_TYPE.get(type) ?? UNKNOWN_COLOR;
}

/** Sort key for stacking: known types in palette order, unknown types after them. */
export function eventOrder(type: string): number {
  return ORDER_BY_TYPE.get(type) ?? EVENT_TYPES.length;
}

/** The admin's IANA timezone, sent to the backend so days and hours match the admin's clock. */
export function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function fmtNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}
