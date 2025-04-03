import { getGlobalTag, getIdTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getCourseGlobalTag() {
  return getGlobalTag("users");
}

export function getCourseIdTag(id: string) {
  return getIdTag("users", id);
}

export function revalidateCourseCache(id: string) {
  revalidateTag(getCourseGlobalTag());
  revalidateTag(getCourseIdTag(id));
}
