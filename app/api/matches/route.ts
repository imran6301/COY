import { connection } from "next/server";
import { getMatches } from "@/lib/logic";
import { loadState } from "@/lib/store";

export async function GET() {
  await connection();
  return Response.json({ matches: getMatches(loadState()) });
}