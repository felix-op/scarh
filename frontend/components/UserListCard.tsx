"use client";

type Usuario = {
  id: string;
  nombre: string;
  legajo: string;
  avatarUrl?: string;
};

type UserListCardProps = {
  usuarios: Usuario[];
  titulo?: string;
  className?: string;
  selectedId?: string;
  onSelect?: (usuario: Usuario) => void;
};

function AvatarPlaceholder({ nombre }: { nombre: string }) {
  const inicial = nombre.trim().charAt(0).toUpperCase() || "U";

  return (
    <div
      className="
        flex h-12 w-12 items-center justify-center
        rounded-full bg-[#E6F3FF]
        text-xl font-semibold text-sky-900
        shadow-[0px_2px_6px_rgba(0,0,0,0.08)]
      "
    >
      {inicial}
    </div>
  );
}

function UserRow({
  usuario,
  seleccionado,
  onClick,
}: {
  usuario: Usuario;
  seleccionado: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex w-full items-center justify-between
        border-b border-neutral-200 px-3 py-2
        transition hover:bg-[#F4F9FF]
        ${seleccionado ? "bg-[#E8F3FF]" : "bg-white"}
      `}
    >
      <div className="flex items-center gap-3">
        {usuario.avatarUrl ? (
          <img
            src={usuario.avatarUrl}
            alt={usuario.nombre}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <AvatarPlaceholder nombre={usuario.nombre} />
        )}

        <span className="text-left text-2xl font-normal leading-7 text-black">
          {usuario.nombre}
        </span>
      </div>

      <span className="text-2xl font-normal leading-7 text-black">
        {usuario.legajo}
      </span>
    </button>
  );
}

export function UserListCard({
  usuarios,
  titulo = "Lista de Usuarios",
  className = "",
  selectedId,
  onSelect,
}: UserListCardProps) {
  return (
    <section
      className={`
        inline-flex w-full max-w-[568px] flex-col items-center
        gap-4 self-stretch rounded-[10px] bg-white
        py-7 shadow-[0px_4px_4px_rgba(0,0,0,0.25)]
        outline outline-1 outline-offset-[-1px] outline-zinc-100
        font-outfit
        ${className}
      `}
    >
      <h3 className="text-center text-4xl font-semibold leading-10 text-sky-950">
        {titulo}
      </h3>

      <div className="h-px w-[454px] max-w-full bg-neutral-200" />

      <div className="flex w-full max-w-[500px] flex-col divide-y divide-neutral-200 px-3">
        <div className="flex items-center justify-between py-2">
          <span className="w-40 text-center text-xl font-normal leading-6 text-zinc-500">
            Nombre Usuario
          </span>
          <span className="text-center text-xl font-normal leading-6 text-zinc-500">
            Nro Legajo
          </span>
        </div>

        {usuarios.map((usuario) => (
          <UserRow
            key={usuario.id}
            usuario={usuario}
            seleccionado={usuario.id === selectedId}
            onClick={() => onSelect?.(usuario)}
          />
        ))}
      </div>
    </section>
  );
}

export default UserListCard;
