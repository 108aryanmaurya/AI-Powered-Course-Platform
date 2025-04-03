import { db } from "@/drizzle/db";
import { CourseSectionTable, LessonTable } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { revalidateLessonCache } from "./cache/lessons";

export async function getNextLessonOrder(sectionId: string) {
  const lesson = await db.query.LessonTable.findFirst({
    columns: { order: true },
    where: eq(LessonTable.sectionId, sectionId),
    orderBy: desc(LessonTable.order),
  });

  return lesson ? lesson.order + 1 : 0;
}

export async function insertLesson(data: typeof LessonTable.$inferInsert) {
  const [newLesson, courseId] = await db.transaction(async (trx) => {
    const [[newLesson], section] = await Promise.all([
      db.insert(LessonTable).values(data).returning(),
      trx.query.CourseSectionTable.findFirst({
        columns: { courseId: true },
        where: eq(CourseSectionTable.id, data.sectionId),
      }),
    ]);

    if (section == null) return trx.rollback();
    return [newLesson, section.courseId];
  });

  if (newLesson == null) throw new Error("Failed to Create Lesson");
  revalidateLessonCache({ courseId: courseId, id: newLesson.id });

  return newLesson;
}

export async function updateLessonDB(
  id: string,
  data: Partial<typeof LessonTable.$inferInsert>
) {
  const [updatedSection] = await db
    .update(LessonTable)
    .set(data)
    .where(eq(LessonTable.id, id))
    .returning();
  if (updatedSection == null) throw new Error("Failed to Update Section");
  revalidateLessonCache({
    sectionId: updatedSection.sectionId,
    id: updatedSection.id,
  });

  return updatedSection;
}

export async function removeLesson(id: string) {
  const [deletedSection] = await db
    .delete(LessonTable)
    .where(eq(LessonTable.id, id))
    .returning();
  if (deletedSection == null) throw new Error("Failed to Delete Course");
  revalidateLessonCache({
    sectionId: deletedSection.sectionId,
    id: deletedSection.id,
  });

  return deletedSection;
}

export async function updateLessonOrdersDb(sectionIds: string[]) {
  const sections = await Promise.all(
    sectionIds.map((sectionId, index) =>
      db
        .update(LessonTable)
        .set({ order: index })
        .where(eq(LessonTable.id, sectionId))
        .returning({
          sectionId: LessonTable.sectionId,
          id: LessonTable.id,
        })
    )
  );

  sections.flat().forEach(({ id, sectionId }) => {
    revalidateLessonCache({ sectionId, id });
  });
}
