import { UserRole } from "@/drizzle/schema";

export function canCreateCourseSection({
  role,
}: {
  role: UserRole | undefined;
}) {
  return role == "admin";
}

export function canUpdateCourseSection({
  role,
}: {
  role: UserRole | undefined;
}) {
  return role == "admin";
}

export function canDeleteCourseSection({
  role,
}: {
  role: UserRole | undefined;
}) {
  return role == "admin";
}
