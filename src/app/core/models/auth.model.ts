/** Payload for login request */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Payload for register request */
export interface RegisterRequest {
  org_name: string;
  org_slug: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

/** Response from login/register/refresh */
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

/** JWT payload decoded */
export interface JwtPayload {
  sub: string;
  email: string;
  tenant_id: string;
  role: UserRole;
  exp: number;
  iat: number;
}

export type UserRole = 'owner' | 'admin' | 'member';
