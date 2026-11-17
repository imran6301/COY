import { PROFILES } from "./profiles";
import type { Profile, PublicProfile, State, SwipeAction } from "./types";

export const emptyState = (): State => ({ swipes: [], matches: [] });

// Strip the secret "likesMe" field. This is the privacy promise of Coy.
export function toPublic(p: Profile): PublicProfile {
  return {
    id: p.id,
    name: p.name,
    age: p.age,
    photo: p.photo,
    bio: p.bio,
    city: p.city,
    interests: p.interests,
  };
}

// Profiles the user has not swiped on yet
export function getFeed(state: State): PublicProfile[] {
  const swiped = new Set(state.swipes.map((s) => s.profileId));
  return PROFILES.filter((p) => !swiped.has(p.id)).map(toPublic);
}

export type SwipeResult =
  | { ok: true; state: State; match: PublicProfile | null }
  | { ok: false; status: number; error: string };

export function applySwipe(
  state: State,
  profileId: number,
  action: SwipeAction
): SwipeResult {
  const profile = PROFILES.find((p) => p.id === profileId);
  if (!profile) {
    return { ok: false, status: 404, error: "Profile not found" };
  }
  if (state.swipes.some((s) => s.profileId === profileId)) {
    return { ok: false, status: 409, error: "Already swiped on this profile" };
  }

  const now = new Date().toISOString();
  const next: State = {
    swipes: [...state.swipes, { profileId, action, createdAt: now }],
    matches: [...state.matches],
  };

  // A match only happens when BOTH sides liked each other
  const isMatch = action === "like" && profile.likesMe;
  if (isMatch) {
    next.matches.push({ profileId, matchedAt: now });
  }

  return { ok: true, state: next, match: isMatch ? toPublic(profile) : null };
}

export type MatchedProfile = PublicProfile & { matchedAt: string };

export function getMatches(state: State): MatchedProfile[] {
  return state.matches
    .map((m) => {
      const p = PROFILES.find((x) => x.id === m.profileId);
      return p ? { ...toPublic(p), matchedAt: m.matchedAt } : null;
    })
    .filter((x): x is MatchedProfile => x !== null)
    .reverse(); // newest first
}