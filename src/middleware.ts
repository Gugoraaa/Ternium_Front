import { createClient } from "@/lib/supabase/middleware";
import { type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  console.log("✅ Middleware ejecutándose en:", request.nextUrl.pathname);  
  const { supabaseResponse, user } = await createClient(request);
  console.log("✅ User:", user);
  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};