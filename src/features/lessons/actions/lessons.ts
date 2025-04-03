"use server";

import { z } from "zod";
import { lessonSchema } from "../schemas/lessons";
import { getCurrentUser } from "@/services/clerk";
import {
  canCreateLesson,
  canDeleteLesson,
  canUpdateLesson,
} from "../permissions/lessons";
import {
  getNextLessonOrder,
  insertLesson,
  removeLesson,
  updateLessonDB,
  updateLessonOrdersDb,
} from "../db/lessons";

export async function createLesson(unsafeData: z.infer<typeof lessonSchema>) {
  const { success, data } = lessonSchema.safeParse(unsafeData);
  if (!success || !canCreateLesson(await getCurrentUser())) {
    return { error: true, message: "There was error creating your lesson " };
  }
  const order = await getNextLessonOrder(data.sectionId);

  await insertLesson({ ...data, order });
  return { error: false, message: "Successfully created your lesson " };
}

export async function deleteLesson(id: string) {
  if (!canDeleteLesson(await getCurrentUser())) {
    return { error: true, message: "There was error deleting your lesson " };
  }

  await removeLesson(id);

  return { error: false, message: "Successfully deleted your lesson " };
}

export async function updateLesson(
  id: string,
  unsafeData: z.infer<typeof lessonSchema>
) {
  const { success, data } = lessonSchema.safeParse(unsafeData);
  if (!success || !canUpdateLesson(await getCurrentUser())) {
    return { error: true, message: "There was error updating your lesson " };
  }

  await updateLessonDB(id, data);
  return { error: false, message: "Successfully updated your lesson " };
}

export async function updateLessonOrders(lessonIds: string[]) {
  if (lessonIds.length == 0 || !canUpdateLesson(await getCurrentUser())) {
    return {
      error: true,
      message: "There was error updating your lesson orer",
    };
  }
  await updateLessonOrdersDb(lessonIds);
  return { error: false, message: "Successfully updated your lesson order" };
}
