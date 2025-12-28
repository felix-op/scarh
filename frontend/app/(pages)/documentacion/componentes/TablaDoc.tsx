import React from "react";

type DocItem = {
    name: string;
    type: string;
    description: string;
};

type TablaDocProps = {
    data: DocItem[];
};

export default function TablaDoc({ data }: TablaDocProps) {
	return (
		<div className="overflow-x-auto my-4 border rounded-lg border-border">
			<table className="min-w-full border-collapse text-sm text-left bg-card">
				<thead className="bg-card-muted text-foreground-title">
					<tr>
						<th className="border-b border-border px-4 py-3 font-semibold">Parámetro</th>
						<th className="border-b border-border px-4 py-3 font-semibold">Tipo</th>
						<th className="border-b border-border px-4 py-3 font-semibold">Descripción</th>
					</tr>
				</thead>
				<tbody className="text-foreground">
					{data.map((item, idx) => (
						<tr 
							key={idx}
							className="border-b border-border last:border-0 hover:bg-card-muted transition-colors"
						>
							<td className="px-4 py-3 font-mono text-(--accent-blue) font-medium">
								{item.name}
							</td>
							<td className="px-4 py-3 text-slate-500 italic">
								{item.type}
							</td>
							<td className="px-4 py-3 leading-relaxed">
								{item.description}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}