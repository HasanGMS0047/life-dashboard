const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "llama3.1";

interface OllamaStatus {
  available: boolean;
  model: string;
}

export async function checkOllamaAvailable(): Promise<OllamaStatus> {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: AbortSignal.timeout(2000),
    });
    return { available: res.ok, model: OLLAMA_MODEL };
  } catch {
    return { available: false, model: OLLAMA_MODEL };
  }
}

function buildReflectionPrompt(entry: string, mood?: string) {
  return `You are a gentle, reflective journaling companion inside a personal life-tracking app.
You will be given one journal entry${mood ? " and the mood the person tagged it with" : ""}.

Write a warm, second-person reflection of exactly 1-2 sentences.
Rules:
- Only refer to what is actually written in the entry below.
- Never invent people, events, places, or details that are not mentioned.
- Do not give advice. Do not ask questions. Just gently reflect the feeling back.

Journal entry: "${entry}"
${mood ? `Mood tag: ${mood}` : ""}

Reflection:`;
}

export async function generateReflection(entry: string, mood?: string): Promise<string> {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: buildReflectionPrompt(entry, mood),
      stream: false,
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    throw new Error(`Ollama request failed with status ${res.status}`);
  }

  const data: { response?: string } = await res.json();
  return (data.response ?? "").trim();
}
