/** User roles available in the CRM */
export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  SALES_REP = 'sales_rep',
  VIEWER = 'viewer',
}

/** Types of CRM activities */
export enum ActivityType {
  CALL = 'call',
  EMAIL = 'email',
  MEETING = 'meeting',
  NOTE = 'note',
  TASK = 'task',
}

/** Sources from which a contact can originate */
export enum ContactSource {
  MANUAL = 'manual',
  IMPORT = 'import',
  WEBSITE = 'website',
  REFERRAL = 'referral',
  SOCIAL = 'social',
  OTHER = 'other',
}

/** Supported currencies for deal values */
export enum DealCurrency {
  USD = 'USD',
  EUR = 'EUR',
  ARS = 'ARS',
  MXN = 'MXN',
}
