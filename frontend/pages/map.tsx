"use client";

import React from "react";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("../components/MapView"), { ssr: false });

const MapPage: React.FC = () => {
  return (
    <div className="h-screen w-screen">
      <MapView />
    </div>
  );
};

export default MapPage;




