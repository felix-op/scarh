import React from "react";
import { IconifyIcon, IconVariants } from "./iconify-icon";

// Interface común de props para todos los botones semánticos
export interface BotonProps {
  content?: string;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  outlined?: boolean;
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
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} disabled={disabled} onClick={onClick} type="button">
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
}: BotonProps) {
  return (
    <Boton
      content={content}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      outlined={outlined}
      variant="success"
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
}: BotonProps) {
  return (
    <Boton
      content={content}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      outlined={outlined}
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
}: BotonProps) {
  return (
    <Boton
      content={content}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      outlined={outlined}
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
}: BotonProps) {
  return (
    <Boton
      content={content}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      outlined={outlined}
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
}: BotonProps) {
  return (
    <Boton
      content={content}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      outlined={outlined}
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
}: BotonProps) {
  return (
    <Boton
      content={content}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      outlined={outlined}
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
}: BotonProps) {
  return (
    <Boton
      content={content}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      outlined={outlined}
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
}: BotonProps) {
  return (
    <Boton
      content={content}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      outlined={outlined}
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
}: BotonProps) {
  return (
    <Boton
      content={content}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      outlined={outlined}
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
}: BotonProps) {
  return (
    <Boton
      content={content}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      outlined={outlined}
      variant="default"
      icon="ir"
    />
  );
}

// 3. Botón exclusivo de icono (sin borde ni fondo de forma normal)
export interface BotonIconoProps {
  icon: IconVariants;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function BotonIcono({
  icon,
  loading = false,
  disabled = false,
  onClick,
}: BotonIconoProps) {
  const animations = true;
  
  const classes = [
    "button-icon",
    disabled ? "button-disabled" : "",
    animations && !disabled ? "button-animated" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} disabled={disabled} onClick={onClick} type="button">
      {loading ? (
        <IconifyIcon variant="loading" />
      ) : (
        <IconifyIcon variant={icon} />
      )}
    </button>
  );
}
