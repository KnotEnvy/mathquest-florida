import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { ExamType } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json().catch(() => ({}));
    const displayName =
      payload.displayName ||
      user.user_metadata?.display_name ||
      user.email?.split("@")[0] ||
      "Learner";
    const examInput = payload.targetExam || user.user_metadata?.target_exam || "SAT";
    const allowedExams = ["SAT", "PERT", "BEST"];
    const normalizedExam =
      typeof examInput === "string" && allowedExams.includes(examInput.toUpperCase())
        ? (examInput.toUpperCase() as ExamType)
        : ("SAT" as ExamType);
    const parentEmail = payload.parentEmail ?? user.user_metadata?.parent_email ?? null;
    const role = payload.role || user.user_metadata?.role || "student";
    const settings = {
      ...(payload.settings ?? {}),
      ...(user.user_metadata?.settings ?? {}),
      role,
    };

    await prisma.user.upsert({
      where: { id: user.id },
      update: { email: user.email ?? "" },
      create: {
        id: user.id,
        email: user.email ?? "",
      },
    });

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        displayName,
        targetExam: normalizedExam,
        parentEmail,
        settings,
      },
      create: {
        userId: user.id,
        displayName,
        targetExam: normalizedExam,
        parentEmail,
        settings,
        username: user.email?.split("@")[0],
      },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Profile sync failed:", error);
    return NextResponse.json({ error: "Profile sync failed" }, { status: 500 });
  }
}
