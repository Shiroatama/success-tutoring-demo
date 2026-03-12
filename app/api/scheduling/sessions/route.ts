import { NextResponse } from "next/server";

type Session = {
  id: string;
  tutorId: string;
  startAt: string; // ISO
  endAt: string; // ISO
  studentName: string;
  notes?: string;
  createdAt: string; // ISO
};

const storeKey = "__demo_sessions_store__";

function getStore(): { sessions: Session[] } {
  const g = globalThis as unknown as Record<string, unknown>;
  if (!g[storeKey]) g[storeKey] = { sessions: [] satisfies Session[] };
  return g[storeKey] as { sessions: Session[] };
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

export async function GET(req: Request) {
  const { sessions } = getStore();
  const url = new URL(req.url);
  const tutorId = (url.searchParams.get("tutorId") ?? "").trim();
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  let filtered = sessions;
  if (tutorId) filtered = filtered.filter((s) => s.tutorId === tutorId);
  if (from) {
    const fromMs = Date.parse(from);
    if (!Number.isNaN(fromMs)) {
      filtered = filtered.filter((s) => Date.parse(s.endAt) > fromMs);
    }
  }
  if (to) {
    const toMs = Date.parse(to);
    if (!Number.isNaN(toMs)) {
      filtered = filtered.filter((s) => Date.parse(s.startAt) < toMs);
    }
  }

  return NextResponse.json({ sessions: filtered });
}

export async function POST(req: Request) {
  const { sessions } = getStore();

  let body: {
    tutorId?: string;
    startAt?: string;
    endAt?: string;
    studentName?: string;
    notes?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const tutorId = (body.tutorId ?? "").trim();
  const studentName = (body.studentName ?? "").trim();
  const startAt = (body.startAt ?? "").trim();
  const endAt = (body.endAt ?? "").trim();
  const notes = (body.notes ?? "").trim();

  if (!tutorId || !studentName || !startAt || !endAt) {
    return NextResponse.json(
      { error: "Missing required fields: tutorId, studentName, startAt, endAt." },
      { status: 400 },
    );
  }

  const startMs = Date.parse(startAt);
  const endMs = Date.parse(endAt);
  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) {
    return NextResponse.json(
      { error: "Invalid startAt/endAt times." },
      { status: 400 },
    );
  }

  // Conflict check: no overlaps for same tutor.
  const conflict = sessions.some((s) => {
    if (s.tutorId !== tutorId) return false;
    const sStart = Date.parse(s.startAt);
    const sEnd = Date.parse(s.endAt);
    return overlaps(startMs, endMs, sStart, sEnd);
  });

  if (conflict) {
    return NextResponse.json(
      { error: "That time was just booked. Please pick another slot." },
      { status: 409 },
    );
  }

  const session: Session = {
    id: `sess_${Math.random().toString(16).slice(2)}`,
    tutorId,
    startAt: new Date(startMs).toISOString(),
    endAt: new Date(endMs).toISOString(),
    studentName,
    notes: notes || undefined,
    createdAt: new Date().toISOString(),
  };

  sessions.push(session);

  return NextResponse.json({ session });
}

export async function DELETE(req: Request) {
  const { sessions } = getStore();
  const url = new URL(req.url);
  const id = (url.searchParams.get("id") ?? "").trim();
  const tutorId = (url.searchParams.get("tutorId") ?? "").trim();

  if (!id) {
    return NextResponse.json({ error: "Missing id query param." }, { status: 400 });
  }

  const idx = sessions.findIndex((s) => s.id === id);
  if (idx < 0) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  if (tutorId && sessions[idx]?.tutorId !== tutorId) {
    return NextResponse.json({ error: "Tutor mismatch." }, { status: 400 });
  }

  const removed = sessions.splice(idx, 1)[0];
  return NextResponse.json({ session: removed });
}

