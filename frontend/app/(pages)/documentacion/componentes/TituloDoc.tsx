
type TituloDocProps = {
	id?: string
	children: string
}

export default function TituloDoc({ id, children }: TituloDocProps) {
	return (
		<div>
			<br/>
			<h2 id={id}>{children}</h2>
			<br/>
			<hr />
			<br/>
		</div>
	);
}