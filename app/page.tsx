"use client";

import { useState } from "react";
import TabBar, { type Tab } from "@/components/TabBar";
import DiscoverTab from "@/components/DiscoverTab";

export default function Page() {
  const [tab, setTab] = useState<Tab>("discover");

  return (
    <main className="mx-auto min-h-screen max-w-md pb-20">
      {tab === "home" && <div />} {/* Home stays blank, as the assignment says */}
      {tab === "discover" && <DiscoverTab />}
      <TabBar active={tab} onChange={setTab} />
    </main>
  );
}