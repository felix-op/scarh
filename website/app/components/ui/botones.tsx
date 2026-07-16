import React, { type ButtonHTMLAttributes, type Ref } from "react";
import { IconifyIcon, IconVariants } from "./iconify-icon";

// Interface común de props para todos los botones semánticos
export interface BotonProps {
  content?: string;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  outlined?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
}

// Props para el botón genérico que permite configurar variante e icono interno
export interface BotonGenericoProps extends BotonProps {
  variant?: "primary" | "success" | "error" | "warn" | "default";
  icon?: IconVariants;
}

// 1. Botón Genérico Base
export function Boton({
  content,
  loading = false,
  disabled = false,
  onClick,
  outlined = false,
  variant = "default",
  icon = "none",
  type = "button",
  className = "",
}: BotonGenericoProps) {
  const animations = true;

  const colorClass = outlined
    ? `button-outline button-outline-${variant}`
    : `button-${variant}`;

  const classes = [
    "button",
    colorClass,
    disabled ? "button-disabled" : "",
    animations && !disabled ? "button-animated" : "",
    animations && !disabled && !outlined ? "button-shine" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} disabled={disabled} onClick={onClick} type={type}>
      {loading ? (
        <IconifyIcon variant="loading" />
      ) : (
        icon !== "none" && <IconifyIcon variant={icon} />
      )}
      {content && <span>{content}</span>}
    </button>
  );
}

// 2. Botones concretos del sistema con iconos y estilos pre-establecidos

export function BotonGuardar({
  content = "Guardar",
  loading = false,
  disabled = false,
  onClick,
  outlined = false,
  type = "button",
}: BotonProps) {
  return (
    <Boton
      content={content}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      outlined={outlined}
      type={type}
      variant="primary"
      icon="guardar"
    />
  );
}

export function BotonEliminar({
  content = "Eliminar",
  loading = false,
  disabled = false,
  onClick,
  outlined = false,
  type = "button",
}: BotonProps) {
  return (
    <Boton
      content={content}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      outlined={outlined}
      type={type}
      variant="error"
      icon="eliminar"
    />
  );
}

export function BotonEditar({
  content = "Editar",
  loading = false,
  disabled = false,
  onClick,
  outlined = false,
  type = "button",
}: BotonProps) {
  return (
    <Boton
      content={content}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      outlined={outlined}
      type={type}
      variant="success"
      icon="editar"
    />
  );
}

export function BotonCancelar({
  content = "Cancelar",
  loading = false,
  disabled = false,
  onClick,
  outlined = true, // Outlined por defecto
  type = "button",
}: BotonProps) {
  return (
    <Boton
      content={content}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      outlined={outlined}
      type={type}
      variant="error"
      icon="cancelar"
    />
  );
}

export function BotonConfirmar({
  content = "Confirmar",
  loading = false,
  disabled = false,
  onClick,
  outlined = false,
  type = "button",
}: BotonProps) {
  return (
    <Boton
      content={content}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      outlined={outlined}
      type={type}
      variant="success"
      icon="none" // Sin icono por defecto
    />
  );
}

export function BotonLogin({
  content = "Iniciar Sesión",
  loading = false,
  disabled = false,
  onClick,
  outlined = false,
  type = "button",
}: BotonProps) {
  return (
    <Boton
      content={content}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      outlined={outlined}
      type={type}
      variant="primary"
      icon="login"
    />
  );
}

export function BotonPassword({
  content = "Cambiar contraseña",
  loading = false,
  disabled = false,
  onClick,
  outlined = false,
  type = "button",
}: BotonProps) {
  return (
    <Boton
      content={content}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      outlined={outlined}
      type={type}
      variant="primary"
      icon="perfilPassword"
    />
  );
}

export function BotonFiltro({
  content = "Filtrar",
  loading = false,
  disabled = false,
  onClick,
  outlined = false,
  type = "button",
}: BotonProps) {
  return (
    <Boton
      content={content}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      outlined={outlined}
      type={type}
      variant="default"
      icon="filtro"
    />
  );
}

export function BotonVolver({
  content = "Volver",
  loading = false,
  disabled = false,
  onClick,
  outlined = false,
  type = "button",
}: BotonProps) {
  return (
    <Boton
      content={content}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      outlined={outlined}
      type={type}
      variant="default"
      icon="volver"
    />
  );
}

export function BotonVerMas({
  content = "Ver más",
  loading = false,
  disabled = false,
  onClick,
  outlined = false,
  type = "button",
}: BotonProps) {
  return (
    <Boton
      content={content}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      outlined={outlined}
      type={type}
      variant="default"
      icon="ir"
    />
  );
}

export function BotonAgregar({
  content = "Agregar",
  loading = false,
  disabled = false,
  onClick,
  outlined = false,
  type = "button",
}: BotonProps) {
  return (
    <Boton
      content={content}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      outlined={outlined}
      type={type}
      variant="primary"
      icon="agregar"
    />
  );
}

// 3. Botón exclusivo de icono (sin borde ni fondo de forma normal)
export interface BotonIconoProps {
  icon: IconVariants;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export function BotonIcono({
  icon,
  loading = false,
  disabled = false,
  onClick,
  type = "button",
  className = ""
}: BotonIconoProps) {
  const animations = true;

  const classes = [
    "button-icon",
    disabled ? "button-disabled" : "",
    animations && !disabled ? "button-animated" : "",
    className
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} disabled={disabled} onClick={onClick} type={type}>
      {loading ? (
        <IconifyIcon variant="loading" />
      ) : (
        <IconifyIcon variant={icon} />
      )}
    </button>
  );
}

export function BotonIconoEditar({
    className = "",
    ...props
}: Omit<BotonIconoProps, "icon">) {

  return (
      <BotonIcono icon="editar" className={`button-success ${className}`} {...props} />
  );
}

export function BotonIconoEliminar({
    className = "",
    ...props
}: Omit<BotonIconoProps, "icon">) {

  return (
      <BotonIcono icon="eliminar" className={`button-error ${className}`} {...props} />
  );
}

export function BotonIconoPermisos({
    className = "",
    ...props
}: Omit<BotonIconoProps, "icon">) {

  return (
      <BotonIcono icon="candado" className={`button-warn ${className}`} {...props} />
  );
}

export function BotonPermisosMasivos({
  content = "Gestionar Permisos",
  loading = false,
  disabled = false,
  onClick,
  outlined = false,
  type = "button",
}: BotonProps) {
  return (
    <Boton
      content={content}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      outlined={outlined}
      type={type}
      variant="warn"
      icon="candado"
    />
  );
}

export function BotonImportar({
  content = "Importar",
  loading = false,
  disabled = false,
  onClick,
  outlined = false,
  type = "button",
}: BotonProps) {
  return (
    <Boton
      content={content}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      outlined={outlined}
      type={type}
      variant="default"
      icon="importar"
    />
  );
}

export function BotonExportar({
  content = "Exportar",
  loading = false,
  disabled = false,
  onClick,
  outlined = false,
  type = "button",
}: BotonProps) {
  return (
    <Boton
      content={content}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      outlined={outlined}
      type={type}
      variant="default"
      icon="exportar"
    />
  );
}

export function BotonEstadisticas({
  content = "Estadísticas",
  loading = false,
  disabled = false,
  onClick,
  outlined = false,
  type = "button",
}: BotonProps) {
  return (
    <Boton
      content={content}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      outlined={outlined}
      type={type}
      variant="default"
      icon="funcion"
    />
  );
}

export function BotonMediciones({
  content = "Mediciones",
  loading = false,
  disabled = false,
  onClick,
  outlined = false,
  type = "button",
}: BotonProps) {
  return (
    <Boton
      content={content}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      outlined={outlined}
      type={type}
      variant="default"
      icon="documento"
    />
  );
}

export function BotonUbicacion({
  content = "Ubicación",
  loading = false,
  disabled = false,
  onClick,
  outlined = false,
  type = "button",
}: BotonProps) {
  return (
    <Boton
      content={content}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      outlined={outlined}
      type={type}
      variant="default"
      icon="ubicacion"
    />
  );
}

// 4. Botón de menú (trigger de 3 puntos), reutilizable en dropdowns/menús contextuales
export interface BotonMenuProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  disabled?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

export function BotonMenu({
  disabled = false,
  className = "",
  "aria-label": ariaLabel = "Abrir menú",
  ref,
  ...props
}: BotonMenuProps) {

  const classes = [
    "button-icon button-default-icon",
    disabled ? "button-disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button ref={ref} type="button" className={classes} disabled={disabled} aria-label={ariaLabel} {...props}>
      <IconifyIcon variant="puntosVerticales" />
    </button>
  );
}
