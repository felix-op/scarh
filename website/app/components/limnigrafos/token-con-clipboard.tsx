"use client";

import { useState } from "react";
import { IconifyIcon } from "../ui/iconify-icon";

export interface TokenConClipboardProps {
  token: string;
}

export function TokenConClipboard({ token }: TokenConClipboardProps) {
  const [copiado, setCopiado] = useState(false);

  const handleCopiar = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-shape-sm border border-input-border bg-input px-3 py-2">
      <code className="flex-1 min-w-0 truncate text-sm text-foreground font-mono select-all">{token}</code>
      <button
        type="button"
        onClick={handleCopiar}
        aria-label="Copiar token"
        className="flex items-center justify-center p-1.5 rounded-full hover:bg-input-hover text-foreground-disabled hover:text-foreground outline-none cursor-pointer transition-colors shrink-0"
      >
        <IconifyIcon variant={copiado ? "check" : "copiar"} className={`text-lg ${copiado ? "text-success" : ""}`} />
      </button>
    </div>
  );
}

export default TokenConClipboard;
