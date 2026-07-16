import { NextResponse } from "next/server";
import { checkOllamaAvailable, generateReflection } from "@/lib/ai/ollama";

const OFFLINE_MESSAGE =
  "AI reflections need a local Ollama model. Install Ollama, run `ollama serve`, then `ollama pull llama3.1` to enable this feature.";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const entry = body?.entry;
  const mood = body?.mood;

  if (!entry || typeof entry !== "string") {
    return NextResponse.json({ error: "Missing 'entry' text" }, { status: 400 });
  }

  const status = await checkOllamaAvailable();
  if (!status.available) {
    return NextResponse.json({ available: false, message: OFFLINE_MESSAGE });
  }

  try {
    const reflection = await generateReflection(entry, typeof mood === "string" ? mood : undefined);
    return NextResponse.json({ available: true, reflection });
  } catch {
    return NextResponse.json({
      available: false,
      message: "The local AI model couldn't be reached. Double-check Ollama is running.",
    });
  }
}
