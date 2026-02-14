import { MouseEventHandler } from "react";
type BotonSiguienteProps = {
    onClick?: MouseEventHandler,
    disabled?: boolean,
};

export default function BotonSiguiente({
    onClick,
    disabled = false
}: BotonSiguienteProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`
                flex items-center justify-center
                border-2 rounded-sm p-1
                ${disabled ?
                    "cursor-not-allowed opacity-50" :
                    "cursor-pointer hover:border-foreground hover:bg-hover active:scale-90 active:border-principal active:bg-transparent"
                }
            `}
        >
            <span className="text-2xl icon-[ooui--arrow-next-ltr]" />
        </button>
    );
}
