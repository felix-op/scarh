"use client";

import { ReactNode, useMemo, useState } from "react";
import {
  Controller,
  useFormContext,
  RegisterOptions,
  ControllerRenderProps,
  FieldValues,
} from "react-hook-form";
import { segundosAHMS, hmsASegundos } from "@utils";

export interface TimeHMSFieldRHFProps {
  name: string;
  label?: string;
  disabled?: boolean;
  rules?: RegisterOptions;
  /** Nodo opcional (ej. `<InfoTooltip />`) mostrado junto al label. */
  tooltip?: ReactNode;
}

/**
 * Campo de duración h/m/s (RHF) enlazado a UN campo cuyo valor son **segundos** (o `null`).
 * Descompone/recompone con `segundosAHMS` / `hmsASegundos`.
 */
export function TimeHMSFieldRHF({ name, label, disabled = false, rules, tooltip }: TimeHMSFieldRHFProps) {
  const { control, formState } = useFormContext();
  const isDisabled = disabled || formState.isSubmitting;

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <TimeHMSInner field={field} label={label} disabled={isDisabled} tooltip={tooltip} />
      )}
    />
  );
}

interface TimeHMSInnerProps {
  field: ControllerRenderProps<FieldValues, string>;
  label?: string;
  disabled: boolean;
  tooltip?: ReactNode;
}

function TimeHMSInner({ field, label, disabled, tooltip }: TimeHMSInnerProps) {
  const initial = useMemo(
    () => segundosAHMS(typeof field.value === "number" ? field.value : null),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const [horas, setHoras] = useState<string>(initial.horas ?? "");
  const [minutos, setMinutos] = useState<string>(initial.minutos ?? "");
  const [segundos, setSegundos] = useState<string>(initial.segundos ?? "");

  const commit = (h: string, m: string, s: string) => {
    setHoras(h);
    setMinutos(m);
    setSegundos(s);
    field.onChange(hmsASegundos({ horas: h || null, minutos: m || null, segundos: s || null }));
  };

  const boxClasses =
    "w-full border border-input-border bg-input text-foreground rounded-shape-sm px-2 py-2 text-sm outline-none transition-colors focus:border-input-focus disabled:bg-input-disabled disabled:opacity-60";

  const campo = (labelTxt: string, value: string, onChange: (v: string) => void) => (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-foreground-secondary">{labelTxt}</span>
      <input
        type="number"
        min="0"
        value={value}
        placeholder="0"
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={boxClasses}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <span className="flex items-center gap-1 text-sm font-medium text-foreground">
          {label}
          {tooltip}
        </span>
      )}
      <div className="grid grid-cols-3 gap-2">
        {campo("Horas", horas, (v) => commit(v, minutos, segundos))}
        {campo("Minutos", minutos, (v) => commit(horas, v, segundos))}
        {campo("Segundos", segundos, (v) => commit(horas, minutos, v))}
      </div>
    </div>
  );
}

export default TimeHMSFieldRHF;
