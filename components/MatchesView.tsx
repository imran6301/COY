"use client";

import { useEffect, useState } from "react";
import type { PublicProfile } from "@/lib/types";

type MatchedProfile = PublicProfile & { matchedAt: string };

export default function MatchesView({ onKeepSwiping }: { onKeepSwiping: () => void }) {
  const [matches, setMatches] = useState<MatchedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/matches", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setMatches(data.matches))
      .catch(() => setError("Couldn't load matches."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6 text-center text-gray-500">Loading...</p>;
  if (error) return <p className="p-6 text-center text-red-600">{error}</p>;

  if (matches.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl">💌</div>
        <h2 className="mt-4 text-2xl font-extrabold">No matches yet</h2>
        <p className="mt-2 text-gray-500">
          A match only happens when you both like each other.
        </p>
        <button
          onClick={onKeepSwiping}
          className="mt-5 rounded-full border-2 border-black bg-[#ff3d81] px-6 py-3 font-bold text-white shadow-[2px_2px_0_#000] active:translate-y-0.5"
        >
          Start swiping
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <p className="mb-3 text-sm font-semibold text-gray-500">
        {matches.length} {matches.length === 1 ? "match" : "matches"}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {matches.map((m) => (
          <div
            key={m.id}
            className="overflow-hidden rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0_#000]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.photo} alt={m.name} className="h-40 w-full object-cover" />
            <div className="p-2">
              <p className="font-extrabold">
                {m.name}, {m.age}
              </p>
              <p className="truncate text-xs text-gray-500">{m.city}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}