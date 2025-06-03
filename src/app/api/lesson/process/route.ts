import { writeFile, unlink } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { extractAudio } from "@/features/lessons/actions/videoToText";
import { getAudioTranscription } from "@/lib/openai";
import { indexLessonTranscript } from "@/features/lessons/actions/indexing";

export async function POST(req: NextRequest) {
  const { lessonId, sectionId, name, videoUrl, courseId, courseName } =
    await req.json();

  const videoPath = `/tmp/lesson-${lessonId}.mp4`;
  const audioPath = `/tmp/lesson-${lessonId}.mp3`;

  try {
    const videoResponse = await fetch(videoUrl);
    const videoBuffer = await videoResponse.arrayBuffer();
    await writeFile(videoPath, Buffer.from(videoBuffer));

    await extractAudio(videoPath, audioPath);
    const transcript = await getAudioTranscription(audioPath);

    await indexLessonTranscript(transcript, {
      course_id: courseId, // Change as needed
      section_id: sectionId,
      lesson_id: lessonId,
      lesson_title: name,
      collection_title: courseName,
    });

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("❌ Background processing error:", error);
    return NextResponse.json(
      { error: "Failed to process lesson" },
      { status: 500 }
    );
  } finally {
    await unlink(videoPath).catch(() => {});
    await unlink(audioPath).catch(() => {});
  }
}
