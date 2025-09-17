export interface User {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: 'user' | 'admin';
  iat?: number;
  exp?: number;
}
