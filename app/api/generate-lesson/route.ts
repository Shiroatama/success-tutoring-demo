import { NextResponse } from "next/server";
import { OpenRouter } from "@openrouter/sdk";

type LessonPlan = {
  objectives: string[];
  warmUp: { title: string; description: string; duration: string };
  mainActivity: { title: string; steps: string[]; duration: string };
  assessment: string;
  homework: string;
};

const systemPrompt = `You are an expert curriculum designer for Success Tutoring, Australia's leading personalised tutoring service. Generate structured, engaging lesson plans that motivate and inspire students.
Always respond in valid JSON matching this schema:
{
  "objectives": string[],
  "warmUp": { "title": string, "description": string, "duration": string },
  "mainActivity": { "title": string, "steps": string[], "duration": string },
  "assessment": string,
  "homework": string
}`;

function jsonFromModelText(text: string): unknown {
  const trimmed = text.trim();
  const noFences = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  try {
    return JSON.parse(noFences);
  } catch {
    // Fallback: try to extract the first JSON object from the text.
    const start = noFences.indexOf("{");
    const end = noFences.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const slice = noFences.slice(start, end + 1);
      return JSON.parse(slice);
    }
    throw new Error("No JSON object found in response text.");
  }
}

function isLessonPlan(x: unknown): x is LessonPlan {
  if (!x || typeof x !== "object") return false;
  const obj = x as Record<string, unknown>;
  if (!Array.isArray(obj.objectives)) return false;
  if (!obj.warmUp || typeof obj.warmUp !== "object") return false;
  if (!obj.mainActivity || typeof obj.mainActivity !== "object") return false;
  if (typeof obj.assessment !== "string") return false;
  if (typeof obj.homework !== "string") return false;
  return true;
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OPENROUTER_API_KEY environment variable." },
      { status: 500 },
    );
  }

  let body: {
    subject?: string;
    grade?: string;
    topic?: string;
    duration?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const subject = (body.subject ?? "").trim();
  const grade = (body.grade ?? "").trim();
  const topic = (body.topic ?? "").trim();
  const duration = (body.duration ?? "").trim();

  if (!subject || !grade || !topic || !duration) {
    return NextResponse.json(
      { error: "Missing required fields: subject, grade, topic, duration." },
      { status: 400 },
    );
  }

  const userPrompt = `Create a ${duration} lesson plan for a ${grade} student on the topic "${topic}" in the subject "${subject}".`;

  const openrouter = new OpenRouter({ apiKey });
  let text: string | undefined;
  try {
    const result = await openrouter.chat.send({
      chatGenerationParams: {
        model: "anthropic/claude-sonnet-4.6",
        maxTokens: 1800,
        responseFormat: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content:
              `${userPrompt}\n\n` +
              `Return ONLY valid JSON. Do not include markdown or code fences.`,
          },
        ],
      },
    });

    // OpenRouter responses are OpenAI-shaped (choices/message/content).
    text = result.choices?.[0]?.message?.content;
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "OpenRouter request failed unexpectedly.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  if (!text) {
    return NextResponse.json(
      { error: "No text content returned from model." },
      { status: 502 },
    );
  }

  try {
    const parsed = jsonFromModelText(text);
    if (!isLessonPlan(parsed)) {
      return NextResponse.json(
        { error: "Model returned JSON, but it did not match the expected schema." },
        { status: 502 },
      );
    }
    return NextResponse.json({ lesson: parsed });
  } catch (e) {
    const devDebug =
      process.env.NODE_ENV !== "production"
        ? {
            raw: text.slice(0, 2000),
            message: e instanceof Error ? e.message : "Parse failed",
          }
        : undefined;
    return NextResponse.json(
      { error: "Failed to parse model response as JSON.", debug: devDebug },
      { status: 502 },
    );
  }
}

