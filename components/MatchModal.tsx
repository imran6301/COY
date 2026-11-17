"use client";

import type { PublicProfile } from "@/lib/types";

type Props = {
  profile: PublicProfile;
  onKeepSwiping: () => void;
  onViewMatches: () => void;
};

export default function MatchModal({ profile, onKeepSwiping, onViewMatches }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <div className="w-full max-w-sm rounded-3xl border-2 border-black bg-[#e6deff] p-6 text-center shadow-[6px_6px_0_#000]">
        <div className="text-4xl">🎉</div>
        <h2 className="mt-2 text-3xl font-extrabold">
          It&apos;s a match<span className="text-[#ff3d81]">!</span>
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          You and {profile.name} liked each other.
        </p>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile.photo}
          alt={profile.name}
          className="mx-auto mt-5 h-40 w-40 rounded-full border-4 border-black object-cover"
        />
        <p className="mt-3 text-lg font-extrabold">
          {profile.name}, {profile.age}
        </p>
        <p className="text-sm text-gray-600">{profile.city}</p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={onViewMatches}
            className="rounded-full border-2 border-black bg-[#ff3d81] py-3 font-bold text-white shadow-[2px_2px_0_#000] active:translate-y-0.5"
          >
            View matches
          </button>
          <button
            onClick={onKeepSwiping}
            className="rounded-full border-2 border-black bg-white py-3 font-bold shadow-[2px_2px_0_#000] active:translate-y-0.5"
          >
            Keep swiping
          </button>
        </div>
      </div>
    </div>
  );
}