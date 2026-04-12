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
						"flex w-full items-center justify-between gap-2 rounded-lg border-2 border-border bg-campo-input px-4 py-3 text-left text-base text-foreground outline-none transition-colors hover:border-foreground focus-visible:border-principal",
						className,
					)}
				>
					<span className="line-clamp-1">{triggerText}</span>
					<ChevronDownIcon className="size-5 text-gray-400" />
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align="start"
				sideOffset={6}
				className="w-[--radix-dropdown-menu-trigger-width] min-w-[220px] rounded-lg border-2 border-border bg-campo-input p-1 text-foreground shadow-md"
			>
				<DropdownMenuLabel className="text-xs font-semibold text-foreground">
					Limnígrafos
				</DropdownMenuLabel>
				<DropdownMenuSeparator className="bg-border" />

				<div className="max-h-[220px] overflow-y-auto">
					{options.length === 0 ? (
						<p className="px-2 py-3 text-sm text-foreground">{emptyText}</p>
					) : (
						options.map((option) => (
							<DropdownMenuCheckboxItem
								key={option.value}
								checked={selectedValues.includes(option.value)}
								disabled={option.disabled}
								onSelect={(event) => event.preventDefault()}
								onCheckedChange={(checked) => handleCheckedChange(option.value, checked === true)}
								className="text-sm text-foreground"
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
