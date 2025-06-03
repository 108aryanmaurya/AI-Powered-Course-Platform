// lib/lessons/indexLessonTranscript.js
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { qdrant } from "@/services/qdrant";
import { openai } from "@/services/openai";

const COLLECTION_NAME = "react_course"; // You can parameterize this

export async function createEmbedings(data: string[]) {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: data,
    encoding_format: "float",
  });
  return embedding;
  console.log(embedding);
}

export async function indexLessonTranscript(transcript, lessonMetadata) {
  //   const qdrant = new QdrantClient({ url: QDRANT_URL });

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });
  const documents = await splitter.createDocuments([transcript]);

  const texts = documents.map((doc) => doc.pageContent);
  //   const vectors = await embeddings.embedDocuments(texts);
  const vectors = await createEmbedings(texts);

  const points = vectors.map((vector, index) => ({
    id: `${lessonMetadata.lesson_id}_chunk_${index}`,
    vector,
    payload: {
      ...lessonMetadata,
      text: texts[index],
      chunk_index: index,
    },
  }));

  await qdrant.upsertCollection(COLLECTION_NAME, {
    vectors: {
      size: vectors[0].length,
      distance: "Cosine",
    },
  });

  await qdrant.uploadBatch(COLLECTION_NAME, {
    batch: {
      ids: points.map((p) => p.id),
      vectors: points.map((p) => p.vector),
      payloads: points.map((p) => p.payload),
    },
  });

  console.log("✅ Transcript indexed successfully.");
}

export async function generateChunksWithTimestamps({
  segments,
  chunkSize = 400,
  chunkOverlap = 50,
}: {
  segments: { start: number; end: number; text: string; speaker?: string }[];
  chunkSize?: number;
  chunkOverlap?: number;
}): Promise<
  {
    text: string;
    video_timestamp_start: number;
    video_timestamp_end: number;
    speaker?: string;
    keywords?: string[];
  }[]
> {
  const fullText = segments.map((s) => s.text).join(" ");
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
  });

  const docs = await splitter.createDocuments([fullText]);

  const chunks: {
    text: string;
    video_timestamp_start: number;
    video_timestamp_end: number;
    speaker?: string;
    keywords?: string[];
  }[] = [];

  let segIndex = 0;

  for (const doc of docs) {
    const chunkText = doc.pageContent.trim();

    let start = 0;
    let end = 0;
    let matchedText = "";
    let speakers = new Set();

    while (segIndex < segments.length) {
      matchedText += segments[segIndex]?.text + " ";
      if (segments?.[segIndex]?.speaker) {
        speakers.add(segments[segIndex]?.speaker);
      }
      end = segments[segIndex]?.end;

      if (matchedText.trim().length >= chunkText.length) {
        start =
          segments[
            segIndex -
              Math.floor(
                (matchedText.length / chunkText.length) * segments.length
              )
          ]?.start || segments[segIndex]?.start;
        break;
      }
      segIndex++;
    }

    const keywords = await generateKeywordsFromText(chunkText);

    chunks.push({
      text: chunkText,
      video_timestamp_start: start,
      video_timestamp_end: end,
      speaker: speakers?.size === 1 ? [...speakers][0] : undefined,
      keywords,
    });
  }

  return chunks;
}

async function generateKeywordsFromText(text: string): Promise<string[]> {
  try {
    const prompt = `Extract 5-7 keywords that best describe the following text. Return them as a JSON array of strings.\n\nText:\n"""${text}"""`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response?.choices[0]?.message.content || "[]";
    const keywords = JSON.parse(raw);
    return Array.isArray(keywords) ? keywords : [];
  } catch (error) {
    console.warn("Keyword extraction failed:", error);
    return [];
  }
}
