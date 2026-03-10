type SeparadorProps = {
    direction?: 'horizontal' | 'vertical'
    className?: string
}

export default function Separador({
	direction = 'horizontal',
	className = ''
}: SeparadorProps) {
	const isVertical = direction === 'vertical';
	const baseClass = isVertical ? 'min-w-px min-h-full bg-border' : 'min-w-full min-h-px bg-border';

	return (
		<div
			role="separator"
			className={`separator ${baseClass} ${className}`.trim()}
		/>
	);
}