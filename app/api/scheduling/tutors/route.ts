import { NextResponse } from "next/server";
import scheduling from "@/data/scheduling.json";

export async function GET() {
  return NextResponse.json({ tutors: scheduling.tutors });
}

