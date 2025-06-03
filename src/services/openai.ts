import { env } from "@/data/env/server";
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});
