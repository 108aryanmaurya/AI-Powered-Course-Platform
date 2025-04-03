import { db } from "@/drizzle/db";
import { CourseTable } from "@/drizzle/schema";
import { revalidateCourseCache } from "./cache/courses";
import { eq } from "drizzle-orm";

export async function insertCourse(data: typeof CourseTable.$inferInsert) {
  const [newCourse] = await db.insert(CourseTable).values(data).returning();
  if (newCourse == null) throw new Error("Failed to Create Course");
  revalidateCourseCache(newCourse.id);

  return newCourse;
}

export async function updateCourseDB(
  id: string,
  data: typeof CourseTable.$inferInsert
) {
  const [updatedCourse] = await db
    .update(CourseTable)
    .set(data)
    .where(eq(CourseTable.id, id))
    .returning();
  if (updatedCourse == null) throw new Error("Failed to Update Course");
  revalidateCourseCache(updatedCourse.id);

  return updatedCourse;
}

export async function removeCourse(id: string) {
  const [deletedCourse] = await db
    .delete(CourseTable)
    .where(eq(CourseTable.id, id))
    .returning();
  console.log(deletedCourse);
  if (deletedCourse == null) throw new Error("Failed to Delete Course");
  revalidateCourseCache(deletedCourse.id);

  return deletedCourse;
}
