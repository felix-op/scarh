"use client";

import type { ReactNode } from "react";

type ActionButtonProps = {
  label: string;
  onClick?: () => void;
  className?: string;
  icon?: ReactNode;
  iconClassName?: string;
};

function EditVectorIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 32 32"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M27.87 7.863L23.024 4.82l-7.89 12.566l4.843 3.04zM14.395 21.25l-.107 2.855l2.527-1.337l2.35-1.24l-4.673-2.936zM29.163 3.24L26.63 1.647a1.364 1.364 0 0 0-1.88.43l-1 1.588l4.843 3.042l1-1.586c.4-.64.21-1.483-.43-1.883zm-3.965 23.82c0 .275-.225.5-.5.5h-19a.5.5 0 0 1-.5-.5v-19a.5.5 0 0 1 .5-.5h13.244l1.884-3H5.698c-1.93 0-3.5 1.57-3.5 3.5v19c0 1.93 1.57 3.5 3.5 3.5h19c1.93 0 3.5-1.57 3.5-3.5V11.097l-3 4.776v11.19z" />
    </svg>
  );
}

function DeleteVectorIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zm2-4h2V8H9zm4 0h2V8h-2z" />
    </svg>
  );
}

function ActionButton({ label, onClick, className = "", icon, iconClassName = "" }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex
        h-12
        w-36
        items-center
        justify-center
        gap-3
        rounded-[20px]
        px-6
        text-lg
        font-medium
        text-white
        shadow-[0px_4px_8px_rgba(0,0,0,0.15)]
        transition
        focus:outline-none
        focus:ring-2
        focus:ring-offset-2
        ${className}
      `}
    >
      {icon ? (
        <span
          className={`flex h-7 w-7 items-center justify-center ${iconClassName}`}
        >
          {icon}
        </span>
      ) : null}
      {label}
    </button>
  );
}

type EditButtonProps = Omit<ActionButtonProps, "label">;

type DeleteButtonProps = Omit<ActionButtonProps, "label">;

export function EditButton({ onClick, className = "", icon, iconClassName }: EditButtonProps) {
  return (
    <ActionButton
      label="Editar"
      onClick={onClick}
      icon={icon ?? <EditVectorIcon />}
      iconClassName={iconClassName ?? "text-white"}
      className={`bg-[#0982C8] hover:bg-[#0A6CA3] focus:ring-[#0982C8] ${className}`}
    />
  );
}

export function DeleteButton({ onClick, className = "", icon, iconClassName }: DeleteButtonProps) {
  return (
    <ActionButton
      label="Eliminar"
      onClick={onClick}
      icon={icon ?? <DeleteVectorIcon />}
      iconClassName={iconClassName ?? "text-white"}
      className={`bg-[#D92D20] hover:bg-[#B42318] focus:ring-[#D92D20] ${className}`}
    />
  );
}

export default ActionButton;
