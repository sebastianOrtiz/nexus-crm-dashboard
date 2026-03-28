/**
 * Centralized enums matching the API.
 * Always use these instead of magic strings.
 */

export const ACTIVITY_TYPES = ['call', 'email', 'meeting', 'note'] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const CONTACT_SOURCES = [
  'website',
  'referral',
  'cold_outreach',
  'social_media',
  'event',
  'other',
] as const;
export type ContactSource = (typeof CONTACT_SOURCES)[number];

export const DEAL_CURRENCIES = ['USD', 'EUR', 'GBP', 'MXN', 'COP', 'ARS'] as const;
export type DealCurrency = (typeof DEAL_CURRENCIES)[number];

export const DEAL_STATUSES = ['open', 'won', 'lost'] as const;
export type DealStatus = (typeof DEAL_STATUSES)[number];

export const USER_ROLES = ['owner', 'admin', 'sales_rep', 'viewer'] as const;
export type UserRole = (typeof USER_ROLES)[number];
