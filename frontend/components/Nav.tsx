"use client";

import { useState, type CSSProperties } from "react";
import type { ReactElement } from "react";
import Boton from "./Boton";
import {
  Map as MapIcon,
  Chip as LimnigraphIcon,
  Ruler as MeasuresIcon,
  Funcion as StatisticsIcon,
  User as UserIcon,
  HistoryIcon,
  NotificationNewdotFillIcon,
  BurgerArrowLeftIcon,
  BurgerArrowRightIcon,
  ChevronRightIcon,
  water as WaterIcon,
} from "./icons/Icons";

type IconComponent = (props: { size?: number; color?: string }) => ReactElement;

const NAV_ITEMS: { label: string; Icon: IconComponent }[] = [
  { label: "Mapa", Icon: MapIcon },
  { label: "Limnigrafo", Icon: LimnigraphIcon },
  { label: "Metricas", Icon: MeasuresIcon },
  { label: "Estadisticas", Icon: StatisticsIcon },
  { label: "Usuarios", Icon: UserIcon },
  { label: "Historial", Icon: HistoryIcon },
];

const dividerStyle: CSSProperties = {
  height: 1,
  width: "100%",
  backgroundColor: "#D3D4D5",
};

type NavButtonProps = {
  label: string;
  Icon: IconComponent;
  collapsed: boolean;
};

function NavButton({ label, Icon, collapsed }: NavButtonProps) {
  return (
    <Boton
      type="button"
      style={{
        width: "100%",
        margin: 0,
        background: "#F0F0F0",
        color: "#011018",
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        gap: collapsed ? 0 : 16,
        height: collapsed ? 60 : 64,
        padding: collapsed ? "10px" : "20px 30px",
      }}
      className="!bg-[#F0F0F0] !text-[#011018] !px-0 !mx-0 w-full"
    >
      <div
        style={{
          marginLeft: collapsed ? 0 : 20,
        }}
      >
        <Icon size={collapsed ? 36 : 38} color="#011018" />
      </div>
      {!collapsed && (
        <span
          style={{
            fontSize: 24,
            fontWeight: 400,
            color: "#011018",
          }}
        >
          {label}
        </span>
      )}
    </Boton>
  );
}

type ProfileCardProps = {
  collapsed: boolean;
  userName: string;
  userEmail: string;
};

function ProfileCard({ collapsed, userName, userEmail }: ProfileCardProps) {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: collapsed ? "column" : "row",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        background: "#F0F0F0",
        borderRadius: 12,
        padding: collapsed ? "12px 0" : "12px 16px",
        gap: collapsed ? 6 : 12,
        minHeight: collapsed ? 96 : 110,
        position: "relative",
      }}
    >
      <div
        style={{
          width: collapsed ? 58 : 70,
          height: collapsed ? 58 : 70,
          borderRadius: "20px",
          background: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <UserIcon size={collapsed ? 40 : 46} color="#080404" />
      </div>

      {!collapsed && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <span
            style={{
              color: "#121212",
              fontSize: 26,
              fontWeight: 500,
            }}
          >
            {userName}
          </span>
          <span
            style={{
              color: "#999999",
              fontSize: 18,
              fontWeight: 400,
            }}
          >
            {userEmail}
          </span>
        </div>
      )}

      {collapsed ? (
        <div
          style={{
            position: "absolute",
            bottom: 8,
            right: 12,
          }}
        >
          <NotificationNewdotFillIcon size={22} color="#2982CB" />
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginLeft: "auto",
          }}
        >
          <NotificationNewdotFillIcon size={18} color="#2982CB" />
          <ChevronRightIcon size={20} color="#160404" />
        </div>
      )}
    </div>
  );
}

type NavProps = {
  userName: string;
  userEmail: string;
};

export function Nav({ userName, userEmail }: NavProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        background: "white",
        minHeight: "100vh",
        overflow: "hidden",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <div
        style={{
          width: isCollapsed ? 124 : 321,
          padding: isCollapsed ? "24px 10px" : "24px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          alignItems: isCollapsed ? "center" : "stretch",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: isCollapsed ? "center" : "flex-end",
            width: "100%",
          }}
        >
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 6,
              borderRadius: 8,
            }}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <BurgerArrowRightIcon size={28} color="#6B6B6B" />
            ) : (
              <BurgerArrowLeftIcon size={28} color="#6B6B6B" />
            )}
          </button>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            padding: isCollapsed ? "0 0 2px" : "0 0 4px",
          }}
        >
          <WaterIcon size={isCollapsed ? 96 : 128} color="#38BDF8" />
        </div>

        <div style={dividerStyle} />

        <ProfileCard
          collapsed={isCollapsed}
          userName={userName}
          userEmail={userEmail}
        />

        <div style={dividerStyle} />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            width: "100%",
          }}
        >
          {NAV_ITEMS.map(({ label, Icon }) => (
            <NavButton
              key={label}
              label={label}
              Icon={Icon}
              collapsed={isCollapsed}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          width: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: isCollapsed ? 70 : 120,
          paddingBottom: 50,
          gap: 40,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: isCollapsed ? 70 : 120,
            bottom: 50,
            width: 1,
            backgroundColor: "#D3D4D5",
          }}
        />
      </div>
    </div>
  );
}
