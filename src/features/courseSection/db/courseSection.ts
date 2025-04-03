import { db } from "@/drizzle/db";
import { CourseSectionTable } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { revalidateCourseSectionCache } from "./cache/courseSection";

export async function getNextCourseSectionOrder(courseId: string) {
  const section = await db.query.CourseSectionTable.findFirst({
    columns: { order: true },
    where: eq(CourseSectionTable.courseId, courseId),
    orderBy: desc(CourseSectionTable.order),
  });

  return section ? section.order + 1 : 0;
}

export async function insertCourseSection(
  data: typeof CourseSectionTable.$inferInsert
) {
  const [newSection] = await db
    .insert(CourseSectionTable)
    .values(data)
    .returning();
  if (newSection == null) throw new Error("Failed to Create Section");
  revalidateCourseSectionCache({ courseId: data.courseId, id: newSection.id });

  return newSection;
}

export async function updateCourseSectionDB(
  id: string,
  data: Partial<typeof CourseSectionTable.$inferInsert>
) {
  const [updatedSection] = await db
    .update(CourseSectionTable)
    .set(data)
    .where(eq(CourseSectionTable.id, id))
    .returning();
  if (updatedSection == null) throw new Error("Failed to Update Section");
  revalidateCourseSectionCache({
    courseId: updatedSection.courseId,
    id: updatedSection.id,
  });

  return updatedSection;
}

export async function removeCourseSection(id: string) {
  const [deletedSection] = await db
    .delete(CourseSectionTable)
    .where(eq(CourseSectionTable.id, id))
    .returning();
  if (deletedSection == null) throw new Error("Failed to Delete Course");
  revalidateCourseSectionCache({
    courseId: deletedSection.courseId,
    id: deletedSection.id,
  });

  return deletedSection;
}

export async function updateSectionOrdersDb(sectionIds: string[]) {
  const sections = await Promise.all(
    sectionIds.map((sectionId, index) =>
      db
        .update(CourseSectionTable)
        .set({ order: index })
        .where(eq(CourseSectionTable.id, sectionId))
        .returning({
          courseId: CourseSectionTable.courseId,
          id: CourseSectionTable.id,
        })
    )
  );

  sections.flat().forEach(({ id, courseId }) => {
    revalidateCourseSectionCache({ courseId, id });
  });
}
