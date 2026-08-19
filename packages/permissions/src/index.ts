export type Role = "consumer" | "business" | "seller" | "creator" | "agent" | "logistics" | "brand_owner" | "developer" | "support" | "compliance" | "admin";

export const RBAC: Record<string, Role[]> = {
  "/chat": ["consumer", "business", "admin"],
  "/tube": ["consumer", "creator", "admin"],
  "/market": ["consumer", "seller", "admin"],
  "/pay": ["consumer", "business", "seller", "admin"],
  "/ads": ["business", "seller", "creator", "admin"],
  "/admin": ["admin", "compliance"],
  "/support": ["support", "admin"],
};

export function canAccess(path: string, role: Role): boolean {
  const allowed = RBAC[path];
  if (!allowed) return true; // open by default
  return allowed.includes(role);
}
