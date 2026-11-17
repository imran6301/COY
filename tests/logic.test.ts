import { describe, expect, it } from "vitest";
import { PROFILES } from "../lib/profiles";
import { applySwipe, emptyState, getFeed, getMatches } from "../lib/logic";

// In the seed data: profile 1 (Ananya) likes you, profile 2 (Rohan) does not.
const LIKES_ME = 1;
const DOES_NOT = 2;

describe("seed data", () => {
  it("has at least 30 profiles with unique ids", () => {
    expect(PROFILES.length).toBeGreaterThanOrEqual(30);
    expect(new Set(PROFILES.map((p) => p.id)).size).toBe(PROFILES.length);
  });

  it("has some profiles that already liked the user", () => {
    expect(PROFILES.some((p) => p.likesMe)).toBe(true);
  });
});

describe("getFeed", () => {
  it("returns every profile when nothing has been swiped", () => {
    expect(getFeed(emptyState())).toHaveLength(PROFILES.length);
  });

  it("never exposes who liked the user", () => {
    const json = JSON.stringify(getFeed(emptyState()));
    expect(json).not.toContain("likesMe");
  });

  it("never shows a swiped profile again (like or pass)", () => {
    let state = emptyState();
    const a = applySwipe(state, LIKES_ME, "like");
    if (a.ok) state = a.state;
    const b = applySwipe(state, DOES_NOT, "pass");
    if (b.ok) state = b.state;

    const ids = getFeed(state).map((p) => p.id);
    expect(ids).not.toContain(LIKES_ME);
    expect(ids).not.toContain(DOES_NOT);
    expect(ids).toHaveLength(PROFILES.length - 2);
  });
});

describe("applySwipe", () => {
  it("creates a match when you like someone who liked you", () => {
    const r = applySwipe(emptyState(), LIKES_ME, "like");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.match?.id).toBe(LIKES_ME);
      expect(r.state.matches).toHaveLength(1);
    }
  });

  it("does not create a match when they have not liked you", () => {
    const r = applySwipe(emptyState(), DOES_NOT, "like");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.match).toBeNull();
      expect(r.state.matches).toHaveLength(0);
    }
  });

  it("does not create a match when you pass, even if they liked you", () => {
    const r = applySwipe(emptyState(), LIKES_ME, "pass");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.match).toBeNull();
      expect(r.state.matches).toHaveLength(0);
    }
  });

  it("does not leak likesMe in the match payload", () => {
    const r = applySwipe(emptyState(), LIKES_ME, "like");
    expect(JSON.stringify(r)).not.toContain("likesMe");
  });

  it("rejects swiping on the same profile twice with 409", () => {
    const first = applySwipe(emptyState(), LIKES_ME, "like");
    if (!first.ok) throw new Error("first swipe should work");
    const second = applySwipe(first.state, LIKES_ME, "pass");
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.status).toBe(409);
  });

  it("rejects an unknown profile with 404", () => {
    const r = applySwipe(emptyState(), 99999, "like");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(404);
  });

  it("does not change the original state object", () => {
    const state = emptyState();
    applySwipe(state, LIKES_ME, "like");
    expect(state.swipes).toHaveLength(0);
    expect(state.matches).toHaveLength(0);
  });
});

describe("getMatches", () => {
  it("lists only mutual matches, newest first", () => {
    let state = emptyState();
    // 1 and 3 like the user; 2 does not
    for (const [id, action] of [
      [1, "like"],
      [2, "like"],
      [3, "like"],
    ] as const) {
      const r = applySwipe(state, id, action);
      if (r.ok) state = r.state;
    }
    const matches = getMatches(state);
    expect(matches.map((m) => m.id)).toEqual([3, 1]);
    expect(JSON.stringify(matches)).not.toContain("likesMe");
  });
});