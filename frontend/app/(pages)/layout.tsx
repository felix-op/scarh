import Sidebar from '@componentes/navbar/Sidebar';
import AuthGuard from '@componentes/providers/AuthGuard';
import { ReactNode } from 'react';

type PublicLayoutProps = {
	children: ReactNode;
}

export default function PublicLayout({children}: PublicLayoutProps) {
	return (
		<AuthGuard>
			<div className='flex flex-row w-full h-full overflow-hidden'>
				<Sidebar />
				<main className='custom-scroll grow overflow-y-auto'>{children}</main> 
			</div>
		</AuthGuard>
	);
}