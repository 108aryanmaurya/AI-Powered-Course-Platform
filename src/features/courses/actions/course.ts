"use server";

import { z } from "zod";
import { courseSchema } from "../schemas/courses";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/clerk";
import {
  canCreateCourse,
  canDeleteCourse,
  canUpdateCourse,
} from "../permissions/courses";
import { insertCourse, removeCourse, updateCourseDB } from "../db/courses";

export async function createCourse(unsafeData: z.infer<typeof courseSchema>) {
  const { success, data } = courseSchema.safeParse(unsafeData);
  if (!success || !canCreateCourse(await getCurrentUser())) {
    return { error: true, message: "There was error creating your course" };
  }

  const course = await insertCourse(data);
  redirect(`/admin/courses/${course.id}/edit`);
}

export async function deleteCourse(id: string) {
  if (!canDeleteCourse(await getCurrentUser())) {
    return { error: true, message: "There was error deleting your course" };
  }

  await removeCourse(id);

  return { error: false, message: "Successfully deleted your course" };
}

export async function updateCourse(
  id: string,
  unsafeData: z.infer<typeof courseSchema>
) {
  const { success, data } = courseSchema.safeParse(unsafeData);
  if (!success || !canUpdateCourse(await getCurrentUser())) {
    return { error: true, message: "There was error updating your course" };
  }

  await updateCourseDB(id, data);
  return { error: false, message: "Successfully updated your course" };
}
