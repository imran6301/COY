import { applySwipe } from "@/lib/logic";
import { loadState, saveState } from "@/lib/store";

export async function POST(request: Request) {
  let body: { profileId?: unknown; action?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { profileId, action } = body;
  if (typeof profileId !== "number" || (action !== "like" && action !== "pass")) {
    return Response.json(
      { error: "Expected { profileId: number, action: 'like' | 'pass' }" },
      { status: 400 }
    );
  }

  const result = applySwipe(loadState(), profileId, action);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  saveState(result.state);
  return Response.json({ matched: result.match !== null, match: result.match });
}