"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Nav } from "@/components/Nav";
import type { MapViewProps } from "@/components/MapView";

const MapView = dynamic<MapViewProps>(() => import("../components/MapView"), {
  ssr: false,
});

const MapPage: React.FC = () => {
  const [resizeToken, setResizeToken] = useState(0);

  return (
    <div className="flex min-h-screen w-full bg-[#EEF4FB]">
      <Nav
        userName="Juan Perez"
        userEmail="juan.perez@scarh.com"
        onCollapseChange={() => setResizeToken((token) => token + 1)}
      />

      <main className="flex flex-1">
        <div className="flex-1 min-h-screen">
          <MapView resizeToken={resizeToken} />
        </div>
      </main>
    </div>
  );
};

export default MapPage;

