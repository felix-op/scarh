"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@componentes/components/ui/dropdown-menu"
import { cn } from "@componentes/lib/utils"

export type MultiSelectOption = {
	value: string
	label: string
	disabled?: boolean
}

type MultiSelectProps = {
	id?: string
	options: MultiSelectOption[]
	selectedValues: string[]
	onChange: (values: string[]) => void
	placeholder?: string
	className?: string
	emptyText?: string
	maxVisibleLabels?: number
}

function buildTriggerText({
	selectedValues,
	options,
	placeholder,
	maxVisibleLabels,
}: {
	selectedValues: string[]
	options: MultiSelectOption[]
	placeholder: string
	maxVisibleLabels: number
}) {
	if (selectedValues.length === 0) {
		return placeholder
	}

	const selectedLabels = selectedValues
		.map((value) => options.find((option) => option.value === value)?.label)
		.filter((label): label is string => Boolean(label))

	if (selectedLabels.length <= maxVisibleLabels) {
		return selectedLabels.join(", ")
	}

	return `${selectedLabels.length} seleccionados`
}

export function MultiSelect({
	id,
	options,
	selectedValues,
	onChange,
	placeholder = "Seleccionar",
	className,
	emptyText = "Sin opciones",
	maxVisibleLabels = 2,
}: MultiSelectProps) {
	const triggerText = buildTriggerText({
		selectedValues,
		options,
		placeholder,
		maxVisibleLabels,
	})

	function handleCheckedChange(value: string, checked: boolean) {
		if (checked) {
			const next = selectedValues.includes(value)
				? selectedValues
				: [...selectedValues, value]
			onChange(next)
			return
		}

		onChange(selectedValues.filter((item) => item !== value))
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					id={id}
					type="button"
					className={cn(
						"flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-[#D3D4D5] bg-white px-3 py-2 text-left text-[13px] text-[#334155] outline-none transition focus-visible:border-[#0982C8] focus-visible:ring-2 focus-visible:ring-[#0982C8]/20 dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#E2E8F0] dark:focus-visible:border-[#38BDF8] dark:focus-visible:ring-[#38BDF8]/20",
						className,
					)}
				>
					<span className="line-clamp-1">{triggerText}</span>
					<ChevronDownIcon className="size-4 opacity-60" />
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align="start"
				sideOffset={6}
				className="w-[--radix-dropdown-menu-trigger-width] min-w-[220px] rounded-xl border border-[#D3D4D5] bg-white p-1 dark:border-[#475569] dark:bg-[#0F172A]"
			>
				<DropdownMenuLabel className="text-[12px] font-semibold text-[#475569] dark:text-[#CBD5E1]">
					Limnígrafos
				</DropdownMenuLabel>
				<DropdownMenuSeparator className="bg-[#E2E8F0] dark:bg-[#334155]" />

				<div className="max-h-[220px] overflow-y-auto">
					{options.length === 0 ? (
						<p className="px-2 py-3 text-[13px] text-[#64748B] dark:text-[#94A3B8]">{emptyText}</p>
					) : (
						options.map((option) => (
							<DropdownMenuCheckboxItem
								key={option.value}
								checked={selectedValues.includes(option.value)}
								disabled={option.disabled}
								onSelect={(event) => event.preventDefault()}
								onCheckedChange={(checked) => handleCheckedChange(option.value, checked === true)}
								className="text-[13px] text-[#334155] dark:text-[#CBD5E1]"
							>
								{option.label}
							</DropdownMenuCheckboxItem>
						))
					)}
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

export default MultiSelect
