export interface JwtPayload {
  sub: string;
  email?: string;
  role?: string[];
  scope?: string;
}
