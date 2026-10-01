import { updateSession } from "@/lib/supabase/proxy";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0] ?? "";
  if (host.endsWith(".vercel.app") && process.env.VERCEL_ENV === "production") {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = "www.ayvautomation.space";
    return NextResponse.redirect(url, 308);
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
