"use client";

import { DeleteButton, EditButton } from "./UserActionButtons";

type EstadoVariant = "activo" | "inactivo" | "pendiente" | "suspendido";

type UserInfoCardProps = {
  nombre: string;
  apellido: string;
  legajo: string;
  email: string;
  telefono: string;
  password?: string;
  estadoLabel?: string;
  estadoVariant?: EstadoVariant;
  avatarUrl?: string;
  className?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  titulo?: string;
  showActions?: boolean;
  showPassword?: boolean;
};

const estadoStyles: Record<
  EstadoVariant,
  { dot: string; text: string; badgeBg: string }
> = {
  activo: {
    dot: "bg-emerald-500 border-emerald-800/40",
    text: "text-emerald-800",
    badgeBg: "bg-emerald-50",
  },
  inactivo: {
    dot: "bg-zinc-400 border-zinc-700/40",
    text: "text-zinc-700",
    badgeBg: "bg-zinc-50",
  },
  pendiente: {
    dot: "bg-amber-400 border-amber-700/40",
    text: "text-amber-800",
    badgeBg: "bg-amber-50",
  },
  suspendido: {
    dot: "bg-red-500 border-red-800/40",
    text: "text-red-800",
    badgeBg: "bg-red-50",
  },
};

function getInitials(nombre: string, apellido: string) {
  const primerNombre = nombre.trim().charAt(0);
  const primerApellido = apellido.trim().charAt(0);
  const initials = `${primerNombre}${primerApellido}`.trim();
  return initials ? initials.toUpperCase() : "U";
}

function maskPassword(password?: string) {
  if (!password) {
    return "******************";
  }

  const safeLength = Math.min(Math.max(password.length, 12), 18);
  return "•".repeat(safeLength);
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="
        flex min-h-[90px] flex-col
        rounded-[20px] bg-white px-4 py-3
        shadow-[0px_4px_8px_rgba(0,0,0,0.15)]
        gap-1
      "
    >
      <span className="text-lg font-normal text-zinc-500">{label}</span>
      <span className="text-2xl font-semibold text-black leading-7 break-words">
        {value}
      </span>
    </div>
  );
}

function StatusBadge({ label, variant }: { label: string; variant: EstadoVariant }) {
  const estadoConfig = estadoStyles[variant];

  return (
    <div
      className={`
        mt-4 flex items-center justify-center gap-3
        rounded-[40px] px-5 py-3
        shadow-[0px_4px_8px_rgba(0,0,0,0.15)]
        ${estadoConfig.badgeBg}
      `}
    >
      <span
        className={`
          h-5 w-5 rounded-full border
          ${estadoConfig.dot}
          shadow-[0px_0px_6px_rgba(0,0,0,0.35)]
        `}
      />
      <span
        className={`
          text-xl font-semibold
          ${estadoConfig.text}
          [text-shadow:0px_0px_4px_rgba(0,0,0,0.35)]
        `}
      >
        {label}
      </span>
    </div>
  );
}

export function UserInfoCard({
  nombre,
  apellido,
  legajo,
  email,
  telefono,
  password,
  estadoLabel = "Activo",
  estadoVariant = "activo",
  avatarUrl,
  className = "",
  onEdit,
  onDelete,
  titulo = "Información de Usuario",
  showActions = true,
  showPassword = true,
}: UserInfoCardProps) {
  const passwordDisplay = maskPassword(password);
  const initials = getInitials(nombre, apellido);

  const infoColumns = [
    [
      { label: "Nombre", value: nombre },
      { label: "Número de legajo", value: legajo },
      { label: "Email", value: email },
    ],
    [
      { label: "Apellido", value: apellido },
      { label: "Número de teléfono", value: telefono },
      ...(showPassword
        ? [{ label: "Contraseña", value: passwordDisplay }]
        : []),
    ],
  ];

  return (
    <section
      className={`
        w-full max-w-[1025px]
        rounded-[38px] bg-white
        shadow-[0_4px_8px_rgba(0,0,0,0.18)]
        px-6 py-6 md:px-10 md:py-8
        inline-flex flex-col gap-5
        font-outfit
        ${className}
      `}
    >
      <h2
        className="
          text-center text-3xl md:text-4xl
          font-extrabold text-black leading-tight
          [text-shadow:0px_4px_4px_rgba(0,0,0,0.25)]
        "
      >
        {titulo}
      </h2>

      <div className="h-px w-full bg-neutral-200" />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col items-center gap-6">
          <div
            className="
              relative flex h-72 w-72 items-center justify-center
              overflow-hidden rounded-[32px]
              border border-neutral-200/60
              bg-gradient-to-br from-[#F6FAFF] to-[#E3F1FF]
              shadow-[0px_8px_16px_rgba(0,0,0,0.12)]
            "
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={`${nombre} ${apellido}`} className="h-full w-full object-cover" />
            ) : (
              <span className="text-6xl font-semibold text-sky-950">{initials}</span>
            )}
          </div>

          <div
            className="
              w-full max-w-[260px]
              rounded-[24px] bg-white p-5
              shadow-[0px_6px_16px_rgba(0,0,0,0.15)]
            "
          >
            <p className="text-center text-2xl font-semibold text-sky-950">Estado</p>
            <StatusBadge label={estadoLabel} variant={estadoVariant} />
          </div>
        </div>

        <div
          className="
            rounded-[20px]
            border border-neutral-200 bg-white
            p-4
            shadow-[0px_2px_10px_rgba(0,0,0,0.08)]
          "
        >
          <div className="grid gap-5 md:grid-cols-2">
            {infoColumns.map((columna, colIndex) => (
              <div key={`columna-${colIndex}`} className="flex flex-col gap-5">
                {columna.map(({ label, value }) => (
                  <InfoField key={label} label={label} value={value} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showActions ? (
        <>
          <div className="h-px w-full bg-neutral-200" />

          <div
            className="
              flex flex-wrap items-center justify-center
              gap-6 px-2
            "
          >
            <EditButton onClick={onEdit} />
            <DeleteButton onClick={onDelete} className="mt-1" />
          </div>
        </>
      ) : null}
    </section>
  );
}

export default UserInfoCard;
