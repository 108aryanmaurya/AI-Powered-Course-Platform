import Pageheader from "@/components/Pageheader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/drizzle/db";
import { CourseSectionTable, CourseTable, LessonTable } from "@/drizzle/schema";
import { CourseForm } from "@/features/courses/components/CourseForm";
import { getCourseIdTag } from "@/features/courses/db/cache/courses";
import { SectionFormDialog } from "@/features/courseSection/components/SectionFormDialog";
import { SortableSectionList } from "@/features/courseSection/components/SortableSectionList";
import { getCourseSectionCourseTag } from "@/features/courseSection/db/cache/courseSection";
import { getLessonCourseTag } from "@/features/lessons/db/cache/lessons";
import { cn } from "@/lib/utils";
import { asc, eq } from "drizzle-orm";
import { EyeClosed, EyeClosedIcon, PlusIcon } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { notFound } from "next/navigation";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await getCourse(courseId);
  if (course == null) return notFound();
  return (
    <div className="container my-6">
      <Pageheader title={course.name}></Pageheader>
      <Tabs defaultValue="lessons">
        <TabsList>
          <TabsTrigger value="lessons">Lesson</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="lessons">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between ">
              <CardTitle>Sections</CardTitle>
              <SectionFormDialog courseId={course.id}>
                <DialogTrigger asChild>
                  <Button variant={"outline"}>
                    <PlusIcon></PlusIcon>New Section
                  </Button>
                </DialogTrigger>
              </SectionFormDialog>
            </CardHeader>
            <CardContent>
              <SortableSectionList
                courseId={courseId}
                sections={course.courseSections}
              ></SortableSectionList>
            </CardContent>
          </Card>
        </TabsContent>
        <hr className="my-4" />
        {course.courseSections.map((section) => (
          <Card key={section.id}>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle
                className={cn(
                  "flex items-center gap-2",
                  section.status == "private" && "text-muted-foreground"
                )}
              >
                {section.status === "private" && <EyeClosedIcon />}
                {section.name}
              </CardTitle>
              <LessonFormDialog
                defaultSectionId={course.id}
                sections={course.courseSections}
              >
                <DialogTrigger asChild>
                  <Button variant={"outline"}>
                    <PlusIcon></PlusIcon>New Section
                  </Button>
                </DialogTrigger>
              </LessonFormDialog>
            </CardHeader>
            <CardContent>
              <SortableLessonList
                sections={course.courseSections}
                lessons={section.lessons}
              ></SortableLessonList>
            </CardContent>
          </Card>
        ))}
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CourseForm course={course}></CourseForm>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
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
    columns: { id: true, name: true, description: true },
    where: eq(CourseTable.id, id),
    with: {
      courseSections: {
        orderBy: asc(CourseSectionTable.order),
        columns: { id: true, status: true, name: true },
        with: {
          lessons: {
            orderBy: asc(LessonTable.order),
            columns: {
              id: true,
              description: true,
              name: true,
              status: true,
              youtubeVideoId: true,
              sectionId: true,
            },
          },
        },
      },
    },
  });
}
