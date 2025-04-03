import { UserRole } from "@/drizzle/schema";

export function canCreateLesson({ role }: { role: UserRole | undefined }) {
  return role == "admin";
}

export function canUpdateLesson({ role }: { role: UserRole | undefined }) {
  return role == "admin";
}

export function canDeleteLesson({ role }: { role: UserRole | undefined }) {
  return role == "admin";
}
