import type { UserRole } from '../enums';

/** Payload for login request */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Payload for register request (snake_case — API does NOT use CamelModel here) */
export interface RegisterRequest {
  organization_name: string;
  organization_slug: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

/** Response from login/register/refresh (snake_case — OAuth2 standard) */
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

/** JWT payload decoded */
export interface JwtPayload {
  sub: string;
  org: string;
  role: UserRole;
  email: string;
  name: string;
  type: string;
  exp: number;
  iat: number;
}

export type { UserRole } from '../enums';
