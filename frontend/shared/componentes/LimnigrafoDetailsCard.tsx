"use client";

import {
	BotonEstadoLimnigrafo,
	type EstadoLimnigrafo,
} from "./BotonEstadoLimnigrafo";
import { Edit } from "./icons/Icons";

type InfoItem = {
  label: string;
  value: string;
  editable?: boolean;
  isEditing?: boolean;
  onChange?: (value: string) => void;
  placeholder?: string;
  onEdit?: () => void;
};

type LimnigrafoDetailsCardProps = {
  title?: string;
  identification: InfoItem[];
  measurements: InfoItem[];
  extraData: InfoItem[];
  description: string;
  isEditingDescription?: boolean;
  onDescriptionChange?: (value: string) => void;
  status: EstadoLimnigrafo;
  statusLabel?: string;
  onEditDescription?: () => void;
};

function InfoItemView({ item }: { item: InfoItem }) {
	return (
		<div className="flex w-full flex-col items-center gap-2">
			<p className="text-center text-[20px] font-normal text-[#838383] dark:text-[#94A3B8]">
				{item.label}
			</p>
			<div className="flex min-h-[32px] items-center justify-center gap-2">
				{item.isEditing && item.onChange ? (
					<input
						type="text"
						value={item.value}
						onChange={(e) => item.onChange?.(e.target.value)}
						placeholder={item.placeholder}
						className="rounded-lg border-2 border-blue-400 bg-blue-50 px-3 py-1 text-center text-[24px] font-semibold text-black focus:border-blue-600 focus:outline-none dark:border-sky-500 dark:bg-[#102A43] dark:text-[#E2E8F0] dark:focus:border-sky-400"
						autoFocus
					/>
				) : (
					<p className="text-center text-[24px] font-semibold leading-7 text-black dark:text-[#E2E8F0]">
						{item.value}
					</p>
				)}
				{item.editable && item.onEdit && !item.isEditing && (
					<button
						onClick={item.onEdit}
						className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-[#1E293B]"
						title="Editar"
					>
						<Edit size={18} color="#898989" />
					</button>
				)}
			</div>
			<div className="h-px w-full max-w-[360px] bg-[#D8D8D8] dark:bg-[#334155]" />
		</div>
	);
}

function DetailsSection({
	title,
	items,
	columns = "lg:grid-cols-3",
}: {
	title: string;
	items: InfoItem[];
	columns?: string;
}) {
	return (
		<section className="space-y-8">
			<SectionTitle>{title}</SectionTitle>
			<div className={`grid gap-x-10 gap-y-4 ${columns}`}>
				{items.map((item) => (
					<InfoItemView key={item.label} item={item} />
				))}
			</div>
		</section>
	);
}

function SectionTitle({ children }: { children: string }) {
	return (
		<div className="flex justify-center">
			<h3 className="shrink-0 text-center text-[19px] font-bold uppercase tracking-[0.12em] text-[#4F7EAA] dark:text-[#B8D7F4]">
				{children}
			</h3>
		</div>
	);
}

function StatusItem({
	status,
	statusLabel,
}: {
	status: EstadoLimnigrafo;
	statusLabel: string;
}) {
	return (
		<div className="flex w-full flex-col items-center gap-2">
			<p className="text-center text-[20px] font-normal text-[#838383] dark:text-[#94A3B8]">
				{statusLabel}
			</p>
			<div className="flex min-h-[32px] items-center justify-center">
				<BotonEstadoLimnigrafo estado={status} />
			</div>
			<div className="h-px w-full max-w-[360px] bg-[#D8D8D8] dark:bg-[#334155]" />
		</div>
	);
}

export default function LimnigrafoDetailsCard({
	title = "Datos Limnigrafo",
	identification,
	measurements,
	extraData,
	description,
	isEditingDescription,
	onDescriptionChange,
	status,
	statusLabel = "Estado",
	onEditDescription,
}: LimnigrafoDetailsCardProps) {
	return (
		<section
			className="
        w-full
        max-w-[1317px]
        rounded-[40px]
        bg-white
        dark:bg-[#1B1F25]
        p-6
        text-black
        dark:text-[#E2E8F0]
        shadow-[9px_7px_16px_-1px_rgba(0,0,0,0.18)]
        dark:shadow-[0px_12px_24px_rgba(0,0,0,0.45)]
        border border-[#E2E8F0] dark:border-[#334155]
        font-outfit
      "
		>
			<header className="border-b border-[#D8D8D8] pb-6 text-center dark:border-[#334155]">
				<h2 className="text-[36px] font-bold">{title}</h2>
			</header>

			<div className="space-y-16 border-b border-[#D8D8D8] py-10 dark:border-[#334155]">
				<DetailsSection title="Identificación" items={identification} />
				<DetailsSection title="Mediciones" items={measurements} />

				<section className="space-y-8">
					<SectionTitle>Configuración</SectionTitle>
					<div className="grid gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
						{extraData.map((item) => (
							<InfoItemView key={item.label} item={item} />
						))}
						<StatusItem status={status} statusLabel={statusLabel} />
					</div>
				</section>
			</div>

			<footer className="pt-10 text-center">
				<SectionTitle>Descripción</SectionTitle>
				<div className="mt-8 flex items-center justify-center gap-2">
					{isEditingDescription && onDescriptionChange ? (
						<textarea
							value={description}
							onChange={(e) => onDescriptionChange(e.target.value)}
							className="min-h-[100px] w-full max-w-[800px] resize-y rounded-lg border-2 border-blue-400 bg-blue-50 px-4 py-2 text-center text-[24px] font-semibold text-black focus:border-blue-600 focus:outline-none dark:border-sky-500 dark:bg-[#102A43] dark:text-[#E2E8F0] dark:focus:border-sky-400"
							placeholder="Ingrese una descripción"
							autoFocus
						/>
					) : (
						<p className="text-[24px] font-semibold text-black dark:text-[#E2E8F0]">
							{description || "Sin descripción"}
						</p>
					)}
					{onEditDescription && !isEditingDescription && (
						<button
							onClick={onEditDescription}
							className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-[#1E293B]"
							title="Editar descripción"
						>
							<Edit size={18} color="#898989" />
						</button>
					)}
				</div>
			</footer>

		</section>
	);
}
