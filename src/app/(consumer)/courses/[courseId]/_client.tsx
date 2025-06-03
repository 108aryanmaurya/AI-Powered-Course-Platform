"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { CheckCircle2Icon, VideoIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AIAssistant } from "./_aiclient";

export function CourseContent({
  defaultValue,
  course,
  lessonId,
}: {
  lessonId: string;
  course: {
    id: string;
    courseSections: {
      id: string;
      name: string;
      lessons: {
        id: string;
        name: string;
        isComplete: boolean;
      }[];
    }[];
  };
  defaultValue: {
    id: string;
    name: string;
    lessons: {
      id: string;
      name: string;
      isComplete: boolean;
    };
  };
}) {
  return (
    <Accordion
      className="h-[80vh] overflow-auto  px-2"
      type="multiple"
      defaultValue={defaultValue ? [defaultValue.id] : undefined}
    >
      {course.courseSections.map((section) => (
        <AccordionItem key={section.id} value={section.id}>
          <AccordionTrigger className="text-lg">
            {section.name}
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-1">
            {section.lessons.map((lesson) => (
              <Button
                variant="ghost"
                asChild
                key={lesson.id}
                className={cn(
                  "justify-start",
                  lesson.id === lessonId &&
                    "bg-accent/75 text-accent-foreground"
                )}
              >
                <Link href={`/courses/${course.id}/lessons/${lesson.id}`}>
                  <VideoIcon />
                  {lesson.name}
                  {lesson.isComplete && (
                    <CheckCircle2Icon className="ml-auto" />
                  )}
                </Link>
              </Button>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function CoursePageClient({
  course,
  userId,
}: {
  userId: string;
  course: {
    id: string;
    courseSections: {
      id: string;
      name: string;
      lessons: {
        id: string;
        name: string;
        isComplete: boolean;
      }[];
    }[];
  };
}) {
  const { lessonId } = useParams();
  const defaultValue =
    typeof lessonId === "string"
      ? course.courseSections.find((section) =>
          section.lessons.find((lesson) => lesson.id === lessonId)
        )
      : course.courseSections[0];
  return (
    <div className=" px-2 py-2 ">
      <Tabs defaultValue="ai_assistant">
        <TabsList className="w-full ">
          <TabsTrigger className="w-full text-md" value="course_content">
            Course Content
          </TabsTrigger>
          <TabsTrigger className="w-full text-md" value="ai_assistant">
            AI Assitant
          </TabsTrigger>
        </TabsList>
        <TabsContent value="course_content" className=" ">
          <CourseContent
            course={course}
            defaultValue={defaultValue}
            lessonId={lessonId as string}
          ></CourseContent>
        </TabsContent>
        <TabsContent value="ai_assistant" className=" ">
          <AIAssistant userId={userId}></AIAssistant>
        </TabsContent>
      </Tabs>
    </div>
  );
}
