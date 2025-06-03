"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RequiredLabelIcon } from "@/components/RequiredLabelIcon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LessonStatus, lessonStatuses } from "@/drizzle/schema";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { lessonSchema } from "../schemas/lessons";
import { Textarea } from "@/components/ui/textarea";
import { updateLesson } from "../actions/lessons";

export function LessonForm({
  sections,
  defaultSectionId,
  // onSuccess,
  lesson,
}: {
  sections: {
    id: string;
    name: string;
  }[];
  onSuccess?: () => void;
  defaultSectionId?: string;
  lesson?: {
    id: string;
    name: string;
    status: LessonStatus;
    youtubeVideoId: string;
    description: string | null;
    sectionId: string;
  };
}) {
  const form = useForm<z.infer<typeof lessonSchema>>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      name: lesson?.name ?? "",
      status: lesson?.status ?? "public",
      youtubeVideoId: lesson?.youtubeVideoId ?? "",
      description: lesson?.description ?? "",
      sectionId: lesson?.sectionId ?? defaultSectionId ?? sections[0]?.id ?? "",
      videoFile: null,
    },
  });

  const handleSubmit = async (values: z.infer<typeof lessonSchema>) => {
    // if (!values.videoFile) return;
    console.log(values);

    // const formData = new FormData();
    // formData.append("file", values.videoFile);
    // formData.append("description", values.description ?? "");
    // formData.append("name", values.name);
    // formData.append("sectionId", values.sectionId);
    // formData.append("status", values.status);

    // console.log(formData);
    try {
      const res = await fetch("/api/lesson/upload", {
        method: "POST",
        body: "{}",
      });

      const data = await res.json();
      console.log(data);
    } catch (err) {
      console.error(err);
      alert("Error uploading file.");
    } finally {
      // setIsUploading(false);
    }
  };
  async function onSubmit(values: z.infer<typeof lessonSchema>) {
    const action =
      lesson == null ? handleSubmit : updateLesson.bind(null, lesson.id);
    const data = await action(values);
    console.log(data);
    // actionToast({ actionData: data });
    // if (!data.error) onSuccess?.();
  }

  // const videoId = form.watch("youtubeVideoId");
  const videoFile = form.watch("videoFile");
  console.log(videoFile);
  // console.log(videoId);

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex gap-6 flex-col @container"
        >
          <div className="grid grid-cols-1 @lg:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <RequiredLabelIcon />
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* <FormField
            control={form.control}
            name="youtubeVideoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <RequiredLabelIcon />
                  YouTube Video Id
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}

            {/* <FormField
            control={form.control}
            name="videoFile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <RequiredLabelIcon />
                  YouTube Video Id
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}
            <FormField
              control={form.control}
              name="videoFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <RequiredLabelIcon />
                    Upload Video File
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        field.onChange(file ?? null);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sectionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Section</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sections.map((section) => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {lessonStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-20 resize-none"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="self-end">
            <Button disabled={form.formState.isSubmitting} type="submit">
              Save
            </Button>
          </div>
          {/* {videoId && (
          <div className="aspect-video">
            <YouTubeVideoPlayer  videoId={videoId} />
          </div>
        )} */}
          {/* <video src="" ></video> */}
        </form>
      </Form>
      <Button
        onClick={() => handleSubmit({} as z.infer<typeof lessonSchema>)}
        type="button"
      >
        Save
      </Button>
    </>
  );
}
