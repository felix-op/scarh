"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import type { ReactElement } from "react";
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

type NavItem = { label: string; Icon: IconComponent; href?: string };

const NAV_ITEMS: NavItem[] = [
  { label: "Mapa", Icon: MapIcon, href: "/map" },
  { label: "Limnigrafo", Icon: LimnigraphIcon, href: "/limnigrafo" },
  { label: "Metricas", Icon: MeasuresIcon },
  { label: "Estadisticas", Icon: StatisticsIcon },
  { label: "Usuarios", Icon: UserIcon, href: "/usersadm" },
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
  href?: string;
  isActive?: boolean;
  onNavigate?: (href: string) => void;
};

function NavButton({
  label,
  Icon,
  collapsed,
  href,
  isActive = false,
  onNavigate,
}: NavButtonProps) {
  const content = (
    <div
      className="flex w-full items-center justify-center rounded-[10px]"
      style={{
        gap: collapsed ? 0 : 12,
        height: collapsed ? 48 : 56,
        padding: collapsed ? "6px" : "14px 20px",
        justifyContent: collapsed ? "center" : "flex-start",
        backgroundColor: isActive ? "#011018" : "#F0F0F0",
        color: isActive ? "#F9FBFF" : "#011018",
      }}
    >
      <div style={{ marginLeft: collapsed ? 0 : 12 }}>
        <Icon size={collapsed ? 28 : 32} color={isActive ? "#F9FBFF" : "#011018"} />
      </div>
      {!collapsed && (
        <span style={{ fontSize: 20, fontWeight: 400, color: isActive ? "#F9FBFF" : "#011018" }}>
          {label}
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <button
        type="button"
        onClick={() => onNavigate?.(href)}
        className="block w-full border-0 bg-transparent p-0"
        style={{ cursor: "pointer" }}
      >
        {content}
      </button>
    );
  }

  return <div className="w-full">{content}</div>;
}

type ProfileCardProps = {
  collapsed: boolean;
  userName: string;
  userEmail: string;
  onClick?: () => void;
};

function ProfileCard({ collapsed, userName, userEmail, onClick }: ProfileCardProps) {
  if (collapsed) {
    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F0F0F0",
          borderRadius: 12,
          padding: "6px 4px",
          gap: 6,
          minHeight: 50,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <UserIcon size={36} color="#080404" />
        </div>
        <NotificationNewdotFillIcon size={17} color="#2982CB" />
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        background: "#F0F0F0",
        borderRadius: 12,
        padding: "8px 12px",
        gap: 10,
        minHeight: 76,
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <UserIcon size={34} color="#080404" />
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <span
          style={{
            color: "#121212",
            fontSize: 18,
            fontWeight: 500,
          }}
        >
          {userName}
        </span>
        <span
          style={{
            color: "#999999",
            fontSize: 14,
            fontWeight: 400,
          }}
        >
          {userEmail}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginLeft: "auto",
        }}
      >
        <NotificationNewdotFillIcon size={16} color="#2982CB" />
        {onClick ? (
          <button
            type="button"
            onClick={onClick}
            style={{
              border: "none",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
              padding: 4,
              borderRadius: 8,
            }}
            aria-label="Ver perfil"
          >
            <ChevronRightIcon size={16} color="#160404" />
          </button>
        ) : (
          <ChevronRightIcon size={16} color="#160404" />
        )}
      </div>
    </div>
  );
}

type NavProps = {
  userName: string;
  userEmail: string;
  onCollapseChange?: (collapsed: boolean) => void;
  onProfileClick?: () => void;
};

const NAV_COLLAPSE_STORAGE_KEY = "scarh-nav-collapsed";

export function Nav({ userName, userEmail, onCollapseChange, onProfileClick }: NavProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored =
        window.sessionStorage.getItem(NAV_COLLAPSE_STORAGE_KEY) === "true";
      setIsCollapsed(stored);
    }
  }, []);

  useEffect(() => {
    window.sessionStorage.setItem(
      NAV_COLLAPSE_STORAGE_KEY,
      isCollapsed ? "true" : "false",
    );
    onCollapseChange?.(isCollapsed);
  }, [isCollapsed, onCollapseChange]);

  function toggleSidebar() {
    setIsCollapsed((prev) => !prev);
  }

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
          width: isCollapsed ? 96 : 260,
          padding: isCollapsed ? "20px 8px" : "20px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
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
            onClick={toggleSidebar}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 4,
              borderRadius: 8,
            }}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <BurgerArrowRightIcon size={22} color="#6B6B6B" />
            ) : (
              <BurgerArrowLeftIcon size={22} color="#6B6B6B" />
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
          <button
            type="button"
            onClick={() => {
              try {
                router.push("/home");
              } catch {
                window.location.href = "/home";
              }
            }}
            className="border-0 bg-transparent p-0"
            style={{ cursor: "pointer" }}
            aria-label="Ir al home"
          >
            <WaterIcon size={isCollapsed ? 72 : 108} color="#38BDF8" />
          </button>
        </div>

        <div style={dividerStyle} />

        <ProfileCard
          collapsed={isCollapsed}
          userName={userName}
          userEmail={userEmail}
          onClick={onProfileClick}
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
          {NAV_ITEMS.map(({ label, Icon, href }) => (
            <NavButton
              key={label}
              label={label}
              Icon={Icon}
              collapsed={isCollapsed}
              href={href}
              isActive={href ? pathname.startsWith(href) : false}
              onNavigate={(target) => {
                try {
                  router.push(target);
                } catch {
                  window.location.href = target;
                }
              }}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          width: 18,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: isCollapsed ? 60 : 90,
          paddingBottom: 40,
          gap: 20,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: isCollapsed ? 60 : 90,
            bottom: 40,
            width: 1,
            backgroundColor: "#D3D4D5",
          }}
        />
      </div>
    </div>
  );
}
