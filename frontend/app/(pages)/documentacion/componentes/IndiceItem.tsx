type IndiceItemProps = {
    children: string
    href: string
};

export default function IndiceItem({ children, href }: IndiceItemProps) {
	return (
		<a href={href}>
			{children}
		</a>
	);
}