import React from "react";

const iconVariants = {
  none: "",
  // Iconos del Boton
  login: "icon-[line-md--login]",
  agregar: "icon-[mdi--add]",
  editar: "icon-[line-md--edit]",
  guardar: "icon-[material-symbols--save]",
  eliminar: "icon-[line-md--trash]",
  logout: "icon-[line-md--logout]",
  activar: "icon-[material-symbols--toggle-on]",
  desactivar: "icon-[material-symbols--toggle-off-outline]",
  ir: "icon-[oui--arrow-right]",
  volver: "icon-[mdi--arrow-left]",
  filtro: "icon-[mage--filter]",
  perfilEditar: "icon-[mdi--pencil]",
  perfilPassword: "icon-[solar--lock-password-bold]",
  perfilLogout: "icon-[fluent--arrow-exit-20-regular]",
  cancelar: "icon-[material-symbols--close]",
  cerrar: "icon-[material-symbols--close]",
  loading: "icon-[line-md--loading-twotone-loop]",
  
  // Iconos de control de UI (reemplazo de lucide-react)
  check: "icon-[material-symbols--check]",
  search: "icon-[material-symbols--search]",
  chevronLeft: "icon-[material-symbols--chevron-left]",
  chevronRight: "icon-[material-symbols--chevron-right]",
  chevronDown: "icon-[material-symbols--keyboard-arrow-down]",
  chevronUp: "icon-[material-symbols--keyboard-arrow-up]",
  sortear: "icon-[material-symbols--swap-vert]",
  circle: "icon-[material-symbols--circle]",
  calendario: "icon-[material-symbols--calendar-today]",
  reloj: "icon-[material-symbols--schedule]",
  
  // Iconos de Icon.tsx del original
  user1: "icon-[qlementine-icons--user-16]",
  rightArrow: "icon-[material-symbols--chevron-right]",
  newNotification: "icon-[mingcute--notification-newdot-fill]",
  mapa: "icon-[carbon--map]",
  chip: "icon-[mdi--chip]",
  documento: "icon-[basil--document-outline]",
  funcion: "icon-[hugeicons--function-circle]",
  historial: "icon-[material-symbols--history]",
  regla: "icon-[raphael--ruler]",
  menu_izquierda: "icon-[stash--burger-arrow-left]",
  menu_derecha: "icon-[stash--burger-arrow-right]",
  documentacion: "icon-[fluent--document-code-16-regular]",
  luna: "icon-[solar--moon-broken]",
  sol: "icon-[solar--sun-broken]",
  dashboard: "icon-[mingcute--dashboard-line]",
  noEditar: "icon-[tabler--edit-off]",
  alerta: "icon-[mingcute--alert-line]",
  file: "icon-[pepicons-pop--file]",
  llave: "icon-[wpf--key-security]",
  ver: "icon-[zondicons--view-show]",
  ocultar: "icon-[zondicons--view-hide]",
  ubicacionOff: "icon-[lucide--map-pin-off]",
  puntosVerticales: "icon-[qlementine-icons--menu-dots-16]",
  tuerca: "icon-[dashicons--admin-generic]",
  accesoDenegado: "icon-[mdi--account-lock-outline]",
  candado: "icon-[solar--lock-outline]",
  restablecer: "icon-[mdi--refresh]",
  importar: "icon-[material-symbols--download]",
  exportar: "icon-[material-symbols--upload]",
  descargar: "icon-[material-symbols--download]",
  ubicacion: "icon-[material-symbols--location-on-outline]",
  database: "icon-[material-symbols--database-outline]",
  info: "icon-[material-symbols--info-outline]",
  upload: "icon-[material-symbols--upload-file-outline]",
  copiar: "icon-[material-symbols--content-copy-outline]",
};

export type IconVariants = keyof typeof iconVariants;

interface IconifyIconProps {
  variant: IconVariants;
  className?: string;
}

export function IconifyIcon({ variant, className = "" }: IconifyIconProps) {
  if (variant === "none") return null;
  return <span className={`${iconVariants[variant] || ""} ${className}`} />;
}
export default IconifyIcon;
