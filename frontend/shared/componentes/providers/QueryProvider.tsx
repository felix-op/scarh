"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

type QueryProviderProps = {
	children: ReactNode
}

export default function QueryProvider({ children }: QueryProviderProps) {
	const [queryClient] = useState(() => new QueryClient({
		defaultOptions: {
			queries: {
				// Configuraciones críticas para evitar fetchs infinitos
				staleTime: 5 * 1000,
				retry: 3,
			},
		},
	}));

	return (
		<QueryClientProvider client={queryClient}>
			{children}
		</QueryClientProvider>
	);
}