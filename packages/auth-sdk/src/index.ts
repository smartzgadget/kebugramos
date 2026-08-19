let token: string | null = null;

// Stub — real impl swaps to httpOnly refresh rotation + SecureStore/biometrics on mobile
export function getAccessToken(): string | null {
  return token;
}
export function setAccessToken(t: string | null) {
  token = t;
}
export function isAuthenticated(): boolean {
  return !!token;
}
export async function refresh(): Promise<string | null> {
  // TODO: call /auth/refresh with httpOnly cookie
  return token;
}
