import { db } from "@/drizzle/db";
import {
  CourseSectionTable,
  CourseTable,
  LessonTable,
  UserLessonCompleteTable,
} from "@/drizzle/schema";
import { getCourseIdTag } from "@/features/courses/db/cache/courses";
import { getCourseSectionCourseTag } from "@/features/courseSections/db/cache";
import { wherePublicCourseSections } from "@/features/courseSections/permissions/sections";
import { getLessonCourseTag } from "@/features/lessons/db/cache/lessons";
import { wherePublicLessons } from "@/features/lessons/permissions/lessons";
import { getCurrentUser } from "@/services/clerk";
import { asc, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { forbidden, notFound } from "next/navigation";
import { ReactNode, Suspense } from "react";
import { CoursePageClient } from "./_client";
import { getUserLessonCompleteUserTag } from "@/features/lessons/db/cache/userLessonComplete";

export default async function CoursePageLayout({
  params,
  children,
}: {
  params: Promise<{ courseId: string }>;
  children: ReactNode;
}) {
  const { courseId } = await params;
  const course = await getCourse(courseId);

  if (course == null) return notFound();

  return (
    <div className="w-full flex relative">
      <div className=" w-[50%] border-r border-gray-300  ">
        <h1 className="text-xl font-semibold py-2 bg-purple-500 text-center text-white">
          {course.name}
        </h1>
        <Suspense
          fallback={
            <CoursePageClient userId="" course={mapCourse(course, [])} />
          }
        >
          <SuspenseBoundary course={course} />
        </Suspense>
      </div>
      <div className=" w-full">{children}</div>
    </div>
  );
}

async function getCourse(id: string) {
  "use cache";
  cacheTag(
    getCourseIdTag(id),
    getCourseSectionCourseTag(id),
    getLessonCourseTag(id)
  );

  return db.query.CourseTable.findFirst({
    where: eq(CourseTable.id, id),
    columns: { id: true, name: true },
    with: {
      courseSections: {
        orderBy: asc(CourseSectionTable.order),
        where: wherePublicCourseSections,
        columns: { id: true, name: true },
        with: {
          lessons: {
            orderBy: asc(LessonTable.order),
            where: wherePublicLessons,
            columns: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
}

async function SuspenseBoundary({
  course,
}: {
  course: {
    name: string;
    id: string;
    courseSections: {
      name: string;
      id: string;
      lessons: {
        name: string;
        id: string;
      }[];
    }[];
  };
}) {
  const { userId } = await getCurrentUser();
  const completedLessonIds =
    userId == null ? [] : await getCompletedLessonIds(userId);

  if (!userId) return forbidden();
  return (
    <CoursePageClient
      userId={userId}
      course={mapCourse(course, completedLessonIds)}
    />
  );
}

async function getCompletedLessonIds(userId: string) {
  "use cache";
  cacheTag(getUserLessonCompleteUserTag(userId));

  const data = await db.query.UserLessonCompleteTable.findMany({
    columns: { lessonId: true },
    where: eq(UserLessonCompleteTable.userId, userId),
  });

  return data.map((d) => d.lessonId);
}

function mapCourse(
  course: {
    name: string;
    id: string;
    courseSections: {
      name: string;
      id: string;
      lessons: {
        name: string;
        id: string;
      }[];
    }[];
  },
  completedLessonIds: string[]
) {
  return {
    ...course,
    courseSections: course.courseSections.map((section) => {
      return {
        ...section,
        lessons: section.lessons.map((lesson) => {
          return {
            ...lesson,
            isComplete: completedLessonIds.includes(lesson.id),
          };
        }),
      };
    }),
  };
}
