"use client";
import { SortableItem, SortableList } from "@/components/SortableList";
import { CourseSectionStatus, LessonStatus } from "@/drizzle/schema";
import { cn } from "@/lib/utils";
import { EyeClosedIcon, Trash2Icon } from "lucide-react";
import { LessonFormDialog } from "./LessonFormDialog";
import { DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ActionButton from "@/components/ActionButton";

export function SortableLessonList({
  lessons,
  sections,
}: {
  sections: {
    id: string;
    name: string;
  }[];
  lessons: {
    id: string;
    name: string;
    status: LessonStatus;
    youtubeVideoId: string;
    description: string;
    sectionId: string;
  }[];
}) {
  return (
    <SortableList items={lessons} onOrderChange={updateLessonOrders}>
      {(items) =>
        items.map((lesson) => (
          <SortableItem
            key={lesson.id}
            id={lesson.id}
            className="flex items-center gap-1"
          >
            <div
              className={cn(
                "contents",
                lesson.status === "private" && "text-muted-foreground"
              )}
            >
              {lesson.status === "private" && (
                <EyeClosedIcon className="size-4"></EyeClosedIcon>
              )}
              {lesson.name}
            </div>
            <LessonFormDialog
              sections={sections}
              defaultSectionId={lesson.sectionId}
            >
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto">
                  Edit{" "}
                </Button>
              </DialogTrigger>
            </LessonFormDialog>
            <ActionButton
              variant={"destructiveOutline"}
              size={"sm"}
              action={deleteLesson.bind(null, lesson.id)}
              requiredAreYouSure
            >
              <Trash2Icon></Trash2Icon>
              <span className="sr-only">Delete</span>
            </ActionButton>
          </SortableItem>
        ))
      }
    </SortableList>
  );
}
