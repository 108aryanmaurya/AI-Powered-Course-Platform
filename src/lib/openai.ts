import { openai } from "@/services/openai";
import { createReadStream } from "fs";

export async function getAudioTranscription(filePath: string): Promise<string> {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: createReadStream(filePath),
      model: "whisper-1",
    });

    return transcription.text;
  } catch (error) {
    console.error("OpenAI transcription failed:", error);
    return "Transcription failed.";
  }
}
