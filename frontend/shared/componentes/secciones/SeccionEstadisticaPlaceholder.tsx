import SeccionCard from "./SeccionCard";

export function SeccionEstadisticaPlaceholder() {
	return (
		<SeccionCard className="p-4 shadow-sm flex flex-col justify-between h-[160px]">
			<div className="animate-pulse flex flex-col h-full justify-between">
				<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
				<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3 my-4"></div>
				<div className="text-sm">
					<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1"></div>
					<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
				</div>
			</div>
		</SeccionCard>
	);
}
