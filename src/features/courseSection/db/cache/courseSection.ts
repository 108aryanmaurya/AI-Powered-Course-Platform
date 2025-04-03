import { getGlobalTag, getIdTag, getUserTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getCourseSectionGlobalTag() {
  return getGlobalTag("courseSections");
}

export function getCourseSectionIdTag(id: string) {
  return getIdTag("courseSections", id);
}

export function getCourseSectionCourseTag(userId: string) {
  return getUserTag("courseSections", userId);
}

export function revalidateCourseSectionCache({
  courseId,
  id,
}: {
  courseId: string;
  id: string;
}) {
  revalidateTag(getCourseSectionGlobalTag());
  revalidateTag(getCourseSectionIdTag(id));
  revalidateTag(getCourseSectionCourseTag(courseId));
}
