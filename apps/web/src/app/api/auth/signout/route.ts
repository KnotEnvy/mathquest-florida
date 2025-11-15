import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Supabase sign-out error:", error);
      return NextResponse.json({ error: "Unable to sign out" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected sign-out error:", error);
    return NextResponse.json({ error: "Unable to sign out" }, { status: 500 });
  }
}
