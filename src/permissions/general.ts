import { UserRole } from "@/drizzle/schema";

export function canAccessAdminPage({ role }: { role: UserRole | undefined }) {
  return role == "admin";
}
