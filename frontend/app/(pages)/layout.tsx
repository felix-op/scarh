import Sidebar from '@componentes/navbar/Sidebar';
import { ReactNode } from 'react';

type PublicLayoutProps = {
	children: ReactNode;
}

export default function PublicLayout({children}: PublicLayoutProps) {
	return (
		<div className='flex flex-row w-full h-full overflow-hidden'>
			<Sidebar />
			<main className='grow overflow-y-auto bg-[#EEF4FB]'>{children}</main> 
		</div>
	);
}