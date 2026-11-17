import { connection } from "next/server";
import { getFeed } from "@/lib/logic";
import { loadState } from "@/lib/store";

export async function GET() {
  await connection(); // tells Next.js: run this on every request, don't cache it
  return Response.json({ profiles: getFeed(loadState()) });
}