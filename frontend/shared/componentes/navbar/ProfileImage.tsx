import Image from "next/image";

type ProfileImageProps = {
	url?: string
	username: string
	iniciales: string
}

export default function ProfileImage({
	username,
	iniciales,
	url
}: ProfileImageProps) {
	if (url) {
		return (
			<div
				className={`
                    relative overflow-hidden rounded-full border border-neutral-200/70
                    shadow-[0px_8px_16px_rgba(0,0,0,0.15)]
                    bg-linear-to-br from-[#F6FAFF] to-[#E3F1FF] dark:from-[#1f252d] dark:to-[#11161c]
                `}
			>
				<Image
					src={url}
					alt={username}
					className="h-full w-full object-cover"
				/>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-2">
			<div
				className={`
					flex items-center justify-center rounded-full border border-neutral-200/70
					bg-linear-to-br from-[#F6FAFF] to-[#E3F1FF] dark:from-[#1f252d] dark:to-[#11161c]
					w-10 h-10 font-semibold text-sky-900 dark:text-white
				`}
			>
				{iniciales}
			</div>
			{username}
		</div>
	);
}
