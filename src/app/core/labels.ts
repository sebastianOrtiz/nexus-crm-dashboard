import { ActivityType, ContactSource, UserRole } from './enums';

/** Human-readable labels for user roles */
export const ROLE_LABELS: Record<string, string> = {
  [UserRole.OWNER]: 'Propietario',
  [UserRole.ADMIN]: 'Admin',
  [UserRole.SALES_REP]: 'Ventas',
  [UserRole.VIEWER]: 'Visualizador',
  // Legacy role value used in auth model
  member: 'Miembro',
};

/** Human-readable labels for activity types */
export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  [ActivityType.CALL]: 'Llamada',
  [ActivityType.EMAIL]: 'Email',
  [ActivityType.MEETING]: 'Reunión',
  [ActivityType.NOTE]: 'Nota',
  [ActivityType.TASK]: 'Tarea',
};

/** Human-readable labels for contact sources */
export const SOURCE_LABELS: Record<string, string> = {
  [ContactSource.MANUAL]: 'Manual',
  [ContactSource.IMPORT]: 'Importado',
  [ContactSource.WEBSITE]: 'Sitio web',
  [ContactSource.REFERRAL]: 'Referido',
  [ContactSource.SOCIAL]: 'Redes sociales',
  [ContactSource.OTHER]: 'Otro',
};

/** Human-readable labels for deal statuses */
export const DEAL_STATUS_LABELS: Record<string, string> = {
  open: 'Abierto',
  won: 'Ganado',
  lost: 'Perdido',
};
