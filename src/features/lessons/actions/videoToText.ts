"use server";

import { unlinkSync } from "fs";
import { writeFile } from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { getAudioTranscription } from "@/lib/openai"; // your transcription logic
import { imagekit } from "@/services/imagekit";
export async function transcribeYouTubeLink(url: string) {
  // You can use `yt-dlp` or `youtube-dl` to download and convert video
  const outPath = `/tmp/audio.mp3`;
  await new Promise((resolve, reject) => {
    exec(`yt-dlp -x --audio-format mp3 -o "${outPath}" "${url}"`, (err) => {
      if (err) reject(err);
      else resolve(true);
    });
  });

  const transcript = await getAudioTranscription(outPath);
  unlinkSync(outPath);
  return transcript;
}

export async function transcribeVideoFile(file: File) {
  //   const file = formData.get("file") as File;
  const buffer = Buffer.from(await file.arrayBuffer());
  const tmpPath = path.join("/tmp", file.name);
  await writeFile(tmpPath, buffer);

  const transcript = await getAudioTranscription(tmpPath);
  unlinkSync(tmpPath);
  return transcript;
}

export async function extractAudio(
  videoPath: string,
  outputAudioPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(
      `ffmpeg -i "${videoPath}" -vn -acodec libmp3lame "${outputAudioPath}"`,
      (error) => {
        if (error) reject(error);
        else resolve();
      }
    );
  });
}
export async function transcribeAndUploadImage(formData: FormData) {
  // Step 1: Get the file (image in this case)
  const file = formData.get("file") as File;
  const buffer = Buffer.from(await file.arrayBuffer());
  const tmpPath = path.join("/tmp", file.name);

  // Step 2: Write the file to a temporary path
  await writeFile(tmpPath, buffer);

  // Step 3: Check if transcription is required (for audio or any transcribable file)
  let transcript = null;
  if (file.type.startsWith("audio/") || file.type === "application/pdf") {
    transcript = await getAudioTranscription(tmpPath); // Your transcription logic
  }

  // Step 4: Upload Image to ImageKit
  const uploadResult = await imagekit.upload({
    file: buffer,
    fileName: `image-${Date.now()}`, // Unique file name
    tags: ["image", "user-upload"], // Optional, can be customized
  });

  // Step 5: Cleanup the temporary file
  unlinkSync(tmpPath);

  // Return the URL of the uploaded image
  return {
    transcript,
    imageUrl: uploadResult.url,
  };
}

export async function uploadOnImageKit(file: File) {
  //   const file = formData.get("file") as File;
  const buffer = Buffer.from(await file.arrayBuffer());
  const res = await imagekit.upload({
    file: buffer,
    fileName: `image-${Date.now()}`, // Unique file name
    tags: ["image", "user-upload"], // Optional, can be customized
  });
  console.log(res);
  //   console.log(url);
  return res;
}

// export async function handleGetAudio() {
//   console.log("I ma running");
//   // const response_0 = await fetch(
//   //   "https://github.com/gradio-app/gradio/raw/main/test/test_files/audio_sample.wav"
//   // );
//   // const exampleAudio = await response_0.blob();

//   const client = await Client.connect("nari-labs/Dia-1.6B");
//   const result = await client.predict("/generate_audio", {
//     text_input: "Hello!!",
//     // audio_prompt_input: exampleAudio,
//     max_new_tokens: 860,
//     cfg_scale: 1,
//     temperature: 1,
//     top_p: 0.8,
//     cfg_filter_top_k: 15,
//     speed_factor: 0.8,
//   });

//   console.log(result.data);
// }
