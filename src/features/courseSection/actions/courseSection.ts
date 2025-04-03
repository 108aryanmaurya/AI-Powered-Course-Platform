"use server";

import { z } from "zod";
import { sectionSchema } from "../schemas/sections";
import { getCurrentUser } from "@/services/clerk";
import {
  canCreateCourseSection,
  canDeleteCourseSection,
  canUpdateCourseSection,
} from "../permissions/courseSection";
import {
  getNextCourseSectionOrder,
  insertCourseSection,
  removeCourseSection,
  updateCourseSectionDB,
  updateSectionOrdersDb,
} from "../db/courseSection";

export async function createCourseSection(
  courseId: string,
  unsafeData: z.infer<typeof sectionSchema>
) {
  const { success, data } = sectionSchema.safeParse(unsafeData);
  if (!success || !canCreateCourseSection(await getCurrentUser())) {
    return { error: true, message: "There was error creating your section" };
  }
  const order = await getNextCourseSectionOrder(courseId);

  await insertCourseSection({ ...data, courseId, order });
  return { error: false, message: "Successfully created your section" };
}

export async function deleteCourseSection(id: string) {
  if (!canDeleteCourseSection(await getCurrentUser())) {
    return { error: true, message: "There was error deleting your section" };
  }

  await removeCourseSection(id);

  return { error: false, message: "Successfully deleted your section" };
}

export async function updateCourseSection(
  id: string,
  unsafeData: z.infer<typeof sectionSchema>
) {
  const { success, data } = sectionSchema.safeParse(unsafeData);
  if (!success || !canUpdateCourseSection(await getCurrentUser())) {
    return { error: true, message: "There was error updating your section" };
  }

  await updateCourseSectionDB(id, data);
  return { error: false, message: "Successfully updated your section" };
}

export async function updateSectionOrders(sectionIds: string[]) {
  if (
    sectionIds.length == 0 ||
    !canUpdateCourseSection(await getCurrentUser())
  ) {
    return {
      error: true,
      message: "There was error updating your section orer",
    };
  }
  await updateSectionOrdersDb(sectionIds);
  return { error: false, message: "Successfully updated your section order" };
}
