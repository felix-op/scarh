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

function InfoColumn({ items }: { items: InfoItem[] }) {
	return (
		<div className="flex flex-1 flex-col items-center gap-4 py-4">
			{items.map((item) => (
				<div key={item.label} className="flex w-full flex-col items-center gap-2">
					<p className="text-center text-[20px] font-normal text-[#838383]">
						{item.label}
					</p>
					<div className="flex items-center gap-2">
						{item.isEditing && item.onChange ? (
							<input
								type="text"
								value={item.value}
								onChange={(e) => item.onChange?.(e.target.value)}
								placeholder={item.placeholder}
								className="text-center text-[24px] font-semibold text-black border-2 border-blue-400 rounded-lg px-3 py-1 focus:outline-none focus:border-blue-600 bg-blue-50"
								autoFocus
							/>
						) : (
							<p className="text-center text-[24px] font-semibold text-black">
								{item.value}
							</p>
						)}
						{item.editable && item.onEdit && !item.isEditing && (
							<button
								onClick={item.onEdit}
								className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
								title="Editar"
							>
								<Edit size={18} color="#898989" />
							</button>
						)}
					</div>
					<div className="h-px w-full max-w-[360px] bg-[#D8D8D8]" />
				</div>
			))}
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
        p-6
        text-black
        shadow-[9px_7px_16px_-1px_rgba(0,0,0,0.18)]
        font-outfit
      "
		>
			<header className="border-b border-[#D8D8D8] pb-6 text-center">
				<h2 className="text-[36px] font-bold">{title}</h2>
			</header>

			<div className="grid gap-4 border-b border-[#D8D8D8] py-8 lg:grid-cols-3">
				<InfoColumn items={identification} />
				<InfoColumn items={measurements} />

				<div className="flex flex-1 flex-col items-center gap-4 py-4">
					{extraData.map((item) => (
						<div
							key={item.label}
							className="flex w-full flex-col items-center gap-2"
						>
							<p className="text-center text-[20px] font-normal text-[#838383]">
								{item.label}
							</p>
							<p className="text-center text-[24px] font-semibold text-black">
								{item.value}
							</p>
							<div className="h-px w-full max-w-[360px] bg-[#D8D8D8]" />
						</div>
					))}

					<div className="flex w-full flex-col items-center gap-3 pt-2">
						<p className="text-center text-[20px] font-normal text-[#838383]">
							{statusLabel}
						</p>
						<BotonEstadoLimnigrafo estado={status} />
					</div>
				</div>
			</div>

			<footer className="pt-6 text-center">
				<p className="text-[20px] font-normal text-[#838383]">Descripción</p>
				<div className="flex items-center justify-center gap-2 mt-2">
					{isEditingDescription && onDescriptionChange ? (
						<textarea
							value={description}
							onChange={(e) => onDescriptionChange(e.target.value)}
							className="text-center text-[24px] font-semibold text-black border-2 border-blue-400 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-600 bg-blue-50 min-h-[100px] w-full max-w-[800px] resize-y"
							placeholder="Ingrese una descripción"
							autoFocus
						/>
					) : (
						<p className="text-[24px] font-semibold text-black">
							{description || "Sin descripción"}
						</p>
					)}
					{onEditDescription && !isEditingDescription && (
						<button
							onClick={onEditDescription}
							className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
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
