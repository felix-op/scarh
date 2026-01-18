"use client";

import { useMemo } from "react";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

import SwapContainer from "@componentes/animaciones/SwapContainer";
import Icon from "@componentes/icons/Icon";

type EstadoVariant = "activo" | "inactivo" | "pendiente" | "suspendido";

type ProfileCardProps = {
	variant?: "detail" | "sidebar";
	collapsed?: boolean;
	username?: string;
	userName?: string;
	firstName?: string;
	lastName?: string;
	legajo?: string;
	email?: string;
	avatarUrl?: string;
	statusLabel?: string;
	statusVariant?: EstadoVariant;
	className?: string;
	onEditProfile?: () => void;
	onChangePassword?: () => void;
	onLogout?: () => void;
};

const estadoStyles: Record<
	EstadoVariant,
	{ dot: string; text: string; badgeBg: string }
> = {
	activo: {
		dot: "bg-emerald-500 border-emerald-800/40",
		text: "text-emerald-800 dark:text-emerald-300",
		badgeBg: "bg-emerald-50 dark:bg-emerald-900/40",
	},
	inactivo: {
		dot: "bg-zinc-400 border-zinc-700/40",
		text: "text-zinc-700 dark:text-zinc-200",
		badgeBg: "bg-zinc-50 dark:bg-zinc-800/60",
	},
	pendiente: {
		dot: "bg-amber-400 border-amber-700/40",
		text: "text-amber-800 dark:text-amber-200",
		badgeBg: "bg-amber-50 dark:bg-amber-900/50",
	},
	suspendido: {
		dot: "bg-red-500 border-red-800/40",
		text: "text-red-800 dark:text-red-200",
		badgeBg: "bg-red-50 dark:bg-red-900/40",
	},
};

function getInitials(nombre?: string, apellido?: string, fallback?: string) {
	const primerNombre = nombre?.trim().charAt(0) ?? "";
	const primerApellido = apellido?.trim().charAt(0) ?? "";
	const initials = `${primerNombre}${primerApellido}`.trim();
	if (initials) return initials.toUpperCase();
	if (fallback) return fallback.trim().slice(0, 2).toUpperCase();
	return "US";
}

function UserAvatar({
	avatarUrl,
	nombre,
	apellido,
	username,
	size = "lg",
}: {
	avatarUrl?: string;
	nombre?: string;
	apellido?: string;
	username?: string;
	size?: "sm" | "md" | "lg";
}) {
	const sizeClasses =
		size === "lg"
			? "w-72 h-72 text-6xl"
			: size === "md"
				? "w-14 h-14 text-xl"
				: "w-10 h-10 text-lg";

	const initials = useMemo(
		() => getInitials(nombre, apellido, username),
		[apellido, nombre, username],
	);

	if (avatarUrl) {
		return (
			<div
				className={`
					relative overflow-hidden rounded-full border border-neutral-200/70
					shadow-[0px_8px_16px_rgba(0,0,0,0.15)]
					bg-gradient-to-br from-[#F6FAFF] to-[#E3F1FF] dark:from-[#1f252d] dark:to-[#11161c]
					${sizeClasses}
				`}
			>
				<img
					src={avatarUrl}
					alt={nombre ?? username ?? "Usuario"}
					className="h-full w-full object-cover"
				/>
			</div>
		);
	}

	return (
		<div
			className={`
				flex items-center justify-center rounded-full border border-neutral-200/70
				bg-gradient-to-br from-[#F6FAFF] to-[#E3F1FF] dark:from-[#1f252d] dark:to-[#11161c]
				shadow-[0px_8px_16px_rgba(0,0,0,0.15)]
				font-semibold text-sky-900 dark:text-white
				${sizeClasses}
			`}
		>
			{initials}
		</div>
	);
}

function InfoRow({ label, value, className = "" }: { label: string; value?: string; className?: string }) {
	return (
		<div
			className={`
        flex min-h-[80px] w-full flex-col sm:flex-row sm:items-center gap-1 sm:gap-3
        rounded-[20px] px-4 py-4
        bg-white dark:bg-[rgb(32,36,44)]
        shadow-[0px_4px_8px_rgba(0,0,0,0.1)]
        ${className}
      `}
		>
			<p className="text-base sm:text-lg font-normal text-zinc-500 dark:text-zinc-300">
				{label}
			</p>
			<p className="text-xl font-semibold text-black dark:text-foreground-title leading-7 break-words">
				{value ?? "—"}
			</p>
		</div>
	);
}

function StatusBadge({ label, variant }: { label: string; variant: EstadoVariant }) {
	const config = estadoStyles[variant] ?? estadoStyles.activo;

	return (
		<div
			className={`
        flex items-center gap-3
        rounded-[40px] px-5 py-3
        shadow-[0px_4px_8px_rgba(0,0,0,0.15)]
        ${config.badgeBg}
      `}
		>
			<span
				className={`
          h-5 w-5 rounded-full border
          ${config.dot}
          shadow-[0px_0px_6px_rgba(0,0,0,0.35)]
        `}
			/>
			<span
				className={`
          text-xl font-semibold
          ${config.text}
          [text-shadow:0px_0px_4px_rgba(0,0,0,0.25)]
        `}
			>
				{label}
			</span>
		</div>
	);
}

function ProfileActionButton({
	label,
	iconClass,
	onClick,
	variant = "primary",
	widthClass,
}: {
	label: string;
	iconClass: string;
	onClick: () => void;
	variant?: "primary" | "danger";
	widthClass?: string;
}) {
	const styles =
		variant === "danger"
			? "bg-[var(--error-claro)] text-[var(--error)] border border-[var(--error)]"
			: "bg-[var(--nuevo-claro)] text-[var(--principal)] border border-[var(--principal)]";

	return (
		<button
			type="button"
			onClick={onClick}
			className={`
        h-12 px-6 rounded-[20px]
        shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
        flex justify-center items-center gap-2.5
        font-outfit text-2xl font-normal whitespace-nowrap
        transition hover:brightness-95 active:scale-[0.99]
        ${styles}
        ${widthClass ?? "min-w-[12rem]"}
      `}
		>
			<span className={`flex items-center justify-center ${iconClass} text-[28px]`} aria-hidden />
			<span>{label}</span>
		</button>
	);
}

export default function ProfileCard({
	variant = "detail",
	collapsed = false,
	username,
	userName,
	firstName,
	lastName,
	legajo,
	email,
	avatarUrl,
	statusLabel = "Activo",
	statusVariant = "activo",
	className = "",
	onEditProfile,
	onChangePassword,
	onLogout,
}: ProfileCardProps) {
	const router = useRouter();
	const pathname = usePathname() ?? "";
	const isActive = pathname.startsWith("/perfil");
	const { data: session } = useSession();

	const resolvedUsername =
		username ??
		userName ??
		session?.user?.username ??
		session?.user?.name ??
		"Usuario";
	const resolvedFirstName = firstName ?? (session?.user as { first_name?: string } | undefined)?.first_name;
	const resolvedLastName = lastName ?? (session?.user as { last_name?: string } | undefined)?.last_name;
	const resolvedEmail = email ?? session?.user?.email ?? "";
	const resolvedAvatar = avatarUrl ?? session?.user?.image ?? undefined;
	const resolvedLegajo = legajo ?? (session?.user as { id?: string } | undefined)?.id;

	const handleLogout = () => {
		if (onLogout) {
			onLogout();
			return;
		}
		signOut({
			callbackUrl: "/",
			redirect: true,
		});
	};

	const handleEditProfile = () => {
		if (onEditProfile) {
			onEditProfile();
			return;
		}
		router.push("/perfil/editar");
	};

	const handleChangePassword = () => {
		if (onChangePassword) {
			onChangePassword();
			return;
		}
		router.push("/perfil/cambiar-contrasena");
	};

	if (variant === "sidebar") {
		return (
			<button
				type="button"
				onClick={() => router.push("/perfil")}
				className="w-full border-0 bg-transparent p-0 cursor-pointer"
				aria-label="Ver perfil"
			>
				<div
					className={`
						w-full flex items-center gap-[6px]
						rounded-[12px] p-[6px_4px] h-16 group
						${isActive ? "bg-sidebar-link-active text-sidebar-foreground-active" : "bg-sidebar-link hover:bg-sidebar-link-hover text-sidebar-foreground"}
						${collapsed ? "justify-center" : "pl-4 justify-between"}
					`}
				>
					<div className="flex items-center gap-3">
						<UserAvatar
							size="md"
							avatarUrl={resolvedAvatar}
							nombre={resolvedFirstName}
							apellido={resolvedLastName}
							username={resolvedUsername}
						/>
						<div
							className={`
								transition-all duration-300 ease-in-out
								${collapsed ? "max-w-0 opacity-0" : "max-w-xs opacity-100"} 
							`}
						>
							<span className={`${isActive ? "text-sidebar-foreground-active" : "text-sidebar-foreground"} text-[18px] font-bold whitespace-nowrap`}>
								{resolvedUsername}
							</span>
						</div>
					</div>

					{collapsed ? (
						<div className="flex h-10 w-5">
							<SwapContainer
								defaultContent={<Icon variant="newNotification" className="text-md text-[#2982CB]"/>}
								hoverContent={<Icon variant="rightArrow" className="text-md" />}
								containerClassName="flex items-start w-5"
							/>
						</div>
					) : (
						<div className="flex items-center justify-between">
							<div className={`flex h-10 w-10 items-center ${isActive ? "text-sidebar-primary-text-active" : "text-sidebar-primary-text"}`}>
								<SwapContainer
									defaultContent={<Icon variant="newNotification" className="text-xl text-[#2982CB]" />}
									hoverContent={<Icon variant="rightArrow" className="text-xl" />}
								/>
							</div>
						</div>
					)}
				</div>
			</button>
		);
	}

	return (
		<section
			className={`
				self-stretch
				w-full
				px-6 sm:px-8 lg:px-12 py-8
				bg-white dark:bg-[rgb(27,31,37)]
				rounded-[38px]
				shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]
				inline-flex flex-col items-center gap-4
				overflow-hidden
				${className}
			`}
		>
			<div className="flex w-full flex-col gap-4">
				<div className="flex w-full justify-center lg:w-auto lg:justify-start">
					<UserAvatar
						size="lg"
						avatarUrl={resolvedAvatar}
						nombre={resolvedFirstName}
						apellido={resolvedLastName}
						username={resolvedUsername}
					/>
				</div>

				<div className="flex w-full flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-5 px-1 sm:px-5">
					<ProfileActionButton
						label="Editar mis datos"
						iconClass="icon-[mdi--pencil] text-[var(--principal)]"
						onClick={handleEditProfile}
						widthClass="w-64"
					/>
					<ProfileActionButton
						label="Cambiar contraseña"
						iconClass="icon-[solar--lock-password-bold] text-[var(--principal)]"
						onClick={handleChangePassword}
						widthClass="w-72"
					/>
					<ProfileActionButton
						label="Cerrar sesión"
						iconClass="icon-[fluent--arrow-exit-20-regular] text-[var(--error)]"
						onClick={handleLogout}
						variant="danger"
						widthClass="w-56"
					/>
				</div>
			</div>

			<div
				className="
					flex w-full flex-col gap-4
					rounded-[20px] p-2.5
					overflow-hidden
				"
			>
				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
					<div className="text-black dark:text-foreground-title text-3xl md:text-4xl font-extrabold leading-10 text-center md:text-left [text-shadow:_0px_4px_4px_rgb(0_0_0_/_0.25)]">
						Información del Usuario
					</div>
					<StatusBadge label={statusLabel} variant={statusVariant} />
				</div>
				<div className="h-px w-full bg-neutral-200 dark:bg-neutral-700" />

				<div className="grid w-full gap-3 sm:grid-cols-2">
					<InfoRow label="Nombre de usuario" value={resolvedUsername} />
					<InfoRow label="Email" value={resolvedEmail || "No definido"} />
					<InfoRow label="Nombre" value={resolvedFirstName ?? resolvedUsername} />
					<InfoRow label="Apellido" value={resolvedLastName ?? "—"} />
					<InfoRow
						label="Número de legajo"
						value={resolvedLegajo}
						className="sm:col-span-2"
					/>
				</div>
			</div>
		</section>
	);
}
