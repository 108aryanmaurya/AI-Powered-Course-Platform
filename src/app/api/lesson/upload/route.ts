import {
  //  NextRequest,
  NextResponse,
} from "next/server";
// import { imagekit } from "@/services/imagekit";
// import { createLesson } from "@/features/lessons/actions/lessons";
// import { LessonStatus } from "@/drizzle/schema";
import { env } from "@/data/env/server";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST() {
// req: NextRequest
  // const formData = await req.formData();
  // const file = formData.get("file") as File;
  // const name = formData.get("name") as string;
  // const description = formData.get("description") as string;
  // const status = formData.get("status") as LessonStatus;
  // const sectionId = formData.get("sectionId") as string;

  // if (!file) {
  //   return NextResponse.json({ error: "No file provided" }, { status: 400 });
  // }

  // const bytes = Buffer.from(await file.arrayBuffer());

  // // Upload video to ImageKit
  // const uploadResult = await imagekit.upload({
  //   file: bytes,
  //   fileName: `lesson-video-${Date.now()}`,
  //   tags: ["video", "lesson"],
  // });

  // console.log(uploadResult);

  // Call server action with hosted video URL
  // const lesson = await createLesson({
  //   name,
  //   sectionId,
  //   status,
  //   youtubeVideoId: uploadResult.url,
  //   description,
  //   videoFile: null,
  // });
  const lesson = {
    data: {
      id: "144a098b-f1c7-4e8c-8bab-f944e12fca5d",
      name: "Introduction to Javascript",
      description:
        "🚀 JavaScript Essentials: Your Launchpad to Modern Web Development!\r\n" +
        "We're excited to announce the launch of our brand new JavaScript course—designed for absolute beginners and aspiring web developers!\r\n" +
        "\r\n" +
        "What’s Inside?\r\n" +
        "Foundations First: Understand variables, data types, functions, and control structures.\r\n" +
        "\r\n" +
        "Real-World Projects: Build interactive web pages and apps as you learn.\r\n" +
        "\r\n" +
        "Hands-on Coding: Practice with live code exercises and challenges in every module.\r\n" +
        "\r\n" +
        "ES6 & Beyond: Stay up to date with modern JavaScript features and best practices.\r\n" +
        "\r\n" +
        "Fun, Bite-Sized Lessons: Learn at your pace with clear, engaging video tutorials and concise notes.\r\n" +
        "\r\n" +
        "Why Learn JavaScript with Us?\r\n" +
        "No Prior Coding Needed: We start from the basics and guide you step by step.\r\n" +
        "\r\n" +
        "Project-Based Learning: Apply every concept by creating real, portfolio-worthy projects.\r\n" +
        "\r\n" +
        "Expert Support: Get answers to your questions in our interactive community and live Q&A sessions.\r\n" +
        "\r\n" +
        "Certificate of Completion: Showcase your new skills to employers and peers.",
      youtubeVideoId:
        "https://ik.imagekit.io/108aryan/lesson-video-1747908951131_QgtljwdRhW",
      status: "public",
      order: 1,
      sectionId: "d400af80-c57f-4a6f-9ee7-9eb5b6c47260",
      createdAt: "2025-05-22T10:16:01.817Z",
      updatedAt: "2025-05-22T10:16:01.817Z",
      courseName: "Javascript Mastery",
      courseId: "ba90dc89-edbf-4c87-ad3d-64ecac2954be",
      sectionName: "Introduction to Javascript",
      userId: "2f1ec344-d962-4560-8c38-835b7dfb408d",
    },
  };
  console.log(lesson);
  // Trigger background job to generate transcript and index
  fetch(`${env.PYTHON_SERVER_URL}/index-video`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lesson_id: lesson.data?.id,
      user_id: lesson.data?.userId,
      lesson_name: lesson.data?.name,
      section_id: lesson.data?.sectionId,
      section_name: lesson.data?.sectionName,
      video_url: lesson.data.youtubeVideoId,
      course_name: lesson.data?.courseName,
      course_id: lesson.data?.courseId,
      video_id: lesson.data?.id, // Add this if required by backend
    }),
  });

  return NextResponse.json({ lesson });
}
