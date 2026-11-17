"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PublicProfile, SwipeAction } from "@/lib/types";
import MatchModal from "./MatchModal";
import MatchesView from "./MatchesView";

const THRESHOLD = 100;
const FLY_OUT = 700;
const EXIT_MS = 300;

type View = "swipe" | "matches";

export default function DiscoverTab() {
  const [view, setView] = useState<View>("swipe");
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matched, setMatched] = useState<PublicProfile | null>(null);

  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [exit, setExit] = useState<SwipeAction | null>(null);

  const startX = useRef(0);
  const busy = useRef(false);

  useEffect(() => {
    fetch("/api/feed", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setProfiles(data.profiles))
      .catch(() => setError("Couldn't load profiles. Is the server running?"))
      .finally(() => setLoading(false));
  }, []);

  const commitSwipe = useCallback(
    async (action: SwipeAction) => {
      const top = profiles[0];
      if (!top || busy.current) return;
      busy.current = true;
      setError(null);
      setExit(action);

      try {
        const [res] = await Promise.all([
          fetch("/api/swipe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ profileId: top.id, action }),
          }),
          new Promise((resolve) => setTimeout(resolve, EXIT_MS)),
        ]);

        if (!res.ok && res.status !== 409) throw new Error("swipe failed");

        if (res.ok) {
          const data = await res.json();
          if (data.matched) setMatched(data.match); // opens the match screen
        }
        setProfiles((p) => p.slice(1));
      } catch {
        setError("Couldn't save that swipe. Try again.");
      } finally {
        setExit(null);
        setDx(0);
        busy.current = false;
      }
    },
    [profiles]
  );

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (busy.current) return;
    startX.current = e.clientX;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    setDx(e.clientX - startX.current);
  }

  function onPointerUp() {
    if (!dragging) return;
    setDragging(false);
    if (dx > THRESHOLD) commitSwipe("like");
    else if (dx < -THRESHOLD) commitSwipe("pass");
    else setDx(0);
  }

  const top = profiles[0];
  const next = profiles[1];
  const x = exit === "like" ? FLY_OUT : exit === "pass" ? -FLY_OUT : dx;
  const likeOpacity = Math.max(0, Math.min(x / THRESHOLD, 1));
  const nopeOpacity = Math.max(0, Math.min(-x / THRESHOLD, 1));

  const tabClass = (v: View) =>
    `rounded-full px-4 py-1.5 text-sm font-bold ${
      view === v ? "bg-[#ff3d81] text-white" : "text-gray-600"
    }`;

  let swipeBody;
  if (loading) {
    swipeBody = <p className="p-6 text-center text-gray-500">Loading...</p>;
  } else if (!top) {
    swipeBody = (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl">🤫</div>
        <h2 className="mt-4 text-2xl font-extrabold">You&apos;re all caught up</h2>
        <p className="mt-2 text-gray-500">
          No more profiles right now. Check back later.
        </p>
        <button
          onClick={() => setView("matches")}
          className="mt-5 rounded-full border-2 border-black bg-[#ff3d81] px-6 py-3 font-bold text-white shadow-[2px_2px_0_#000] active:translate-y-0.5"
        >
          See your matches
        </button>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    );
  } else {
    swipeBody = (
      <>
        {error && <p className="mt-3 text-center text-sm text-red-600">{error}</p>}

        <div className="relative mt-4 h-[460px]">
          {next && (
            <div className="absolute inset-0 scale-95 overflow-hidden rounded-3xl border-2 border-black bg-gray-100 opacity-80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={next.photo}
                alt=""
                className="h-full w-full object-cover"
                draggable={false}
              />
            </div>
          )}

          <div
            key={top.id}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{
              transform: `translateX(${x}px) rotate(${x / 20}deg)`,
              transition: dragging ? "none" : `transform ${EXIT_MS}ms ease-out`,
              touchAction: "pan-y",
            }}
            className="absolute inset-0 cursor-grab select-none overflow-hidden rounded-3xl border-2 border-black bg-white shadow-[4px_4px_0_#000] active:cursor-grabbing"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={top.photo}
              alt={top.name}
              className="h-full w-full object-cover"
              draggable={false}
            />

            <div
              style={{ opacity: likeOpacity }}
              className="absolute left-4 top-4 -rotate-12 rounded-lg border-4 border-green-500 px-3 py-1 text-2xl font-extrabold text-green-500"
            >
              LIKE
            </div>
            <div
              style={{ opacity: nopeOpacity }}
              className="absolute right-4 top-4 rotate-12 rounded-lg border-4 border-red-500 px-3 py-1 text-2xl font-extrabold text-red-500"
            >
              NOPE
            </div>

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
              <h2 className="text-2xl font-extrabold">
                {top.name}, {top.age}
              </h2>
              <p className="text-sm opacity-90">{top.city}</p>
              <p className="mt-1 text-sm">{top.bio}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {top.interests.map((i) => (
                  <span
                    key={i}
                    className="rounded-full bg-white/25 px-2 py-0.5 text-xs font-semibold"
                  >
                    {i}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-8">
          <button
            onClick={() => commitSwipe("pass")}
            aria-label="Pass"
            className="h-16 w-16 rounded-full border-2 border-black bg-white text-2xl shadow-[2px_2px_0_#000] active:translate-y-0.5"
          >
            ✕
          </button>
          <button
            onClick={() => commitSwipe("like")}
            aria-label="Like"
            className="h-16 w-16 rounded-full border-2 border-black bg-[#ff3d81] text-2xl text-white shadow-[2px_2px_0_#000] active:translate-y-0.5"
          >
            ♥
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="px-4 pt-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">
          Discover<span className="text-[#ff3d81]">.</span>
        </h1>
        <div className="flex rounded-full border-2 border-black p-0.5">
          <button onClick={() => setView("swipe")} className={tabClass("swipe")}>
            Swipe
          </button>
          <button onClick={() => setView("matches")} className={tabClass("matches")}>
            Matches
          </button>
        </div>
      </header>

      {view === "swipe" ? (
        swipeBody
      ) : (
        <MatchesView onKeepSwiping={() => setView("swipe")} />
      )}

      {matched && (
        <MatchModal
          profile={matched}
          onKeepSwiping={() => setMatched(null)}
          onViewMatches={() => {
            setMatched(null);
            setView("matches");
          }}
        />
      )}
    </div>
  );
}