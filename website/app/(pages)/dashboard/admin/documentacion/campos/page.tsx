"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TextField,
  Select,
  Checkbox,
  DateField,
  Switch,
  RadioButton,
  RadioField,
  BotonVolver,
  Card,
  IconifyIcon
} from "@components";

export default function DocumentacionCamposPage() {
  // States for inputs
  const [text, setText] = useState("");
  const [textWithIcon, setTextWithIcon] = useState("");
  const [textWithError, setTextWithError] = useState("");

  const [selectVal, setSelectVal] = useState("");

  // States for Checkbox Multiple-Choice Group
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    admin: false,
    editor: false,
    viewer: false,
  });

  // State for Radio Group Multiple-Choice
  const [selectedRadio, setSelectedRadio] = useState<string>("");

  const [checkboxVal, setCheckboxVal] = useState(false);
  const [switchVal, setSwitchVal] = useState(false);
  const [dateVal, setDateVal] = useState<Date | undefined>(undefined);

  const selectOptions = [
    { value: "opcion-1", label: "Opción 1" },
    { value: "opcion-2", label: "Opción 2" },
    { value: "opcion-3", label: "Opción 3" },
  ];

  const handleCheckboxChange = (key: string, checked: boolean) => {
    setCheckedItems((prev) => ({ ...prev, [key]: checked }));
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 w-full max-w-6xl mx-auto font-outfit">
      <div className="flex flex-col-reverse items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-foreground-title">Documentación — Campos e Inputs</h1>
          <p className="text-foreground-secondary">
            Muestra interactiva de todos los componentes de formulario y entrada de datos.
          </p>
        </div>
        <Link href="/dashboard/admin/documentacion" className="no-underline">
          <BotonVolver content="Regresar al Hub" />
        </Link>
      </div>

      <div className="h-px w-full bg-border" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 1. Text Field */}
        <Card className="flex flex-col gap-6 p-6">
          <h2 className="text-xl font-bold text-foreground">1. TextField (Campos de Texto)</h2>

          <div className="flex flex-col gap-4">
            <TextField
              label="Texto Básico"
              name="text-basic"
              placeholder="Escribe algo..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <TextField
              label="Con Icono Izquierdo"
              name="text-icon"
              placeholder="Buscar usuario..."
              leftIcon={<IconifyIcon variant="user1" />}
              value={textWithIcon}
              onChange={(e) => setTextWithIcon(e.target.value)}
            />

            <TextField
              label="Con Estado de Error"
              name="text-error"
              placeholder="Error de validación..."
              errors={textWithError ? [] : ["Este campo es obligatorio"]}
              value={textWithError}
              onChange={(e) => setTextWithError(e.target.value)}
            />
          </div>
        </Card>

        {/* 2. Selectores e Inputs Simples */}
        <Card className="flex flex-col gap-6 p-6">
          <h2 className="text-xl font-bold text-foreground">2. Selectores</h2>

          <div className="flex flex-col gap-4">
            <Select
              label="Select Simple"
              name="select-simple"
              options={selectOptions}
              value={selectVal}
              onChange={setSelectVal}
            />
          </div>
        </Card>

        {/* 3. Selección Múltiple (Multiple-Choice) */}
        <Card className="flex flex-col gap-6 p-6 md:col-span-2">
          <h2 className="text-xl font-bold text-foreground">3. Grupos de Selección Múltiple (Multiple-Choice)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Checkbox Group */}
            <div className="flex flex-col gap-4 p-5 border border-border rounded-lg bg-background-muted">
              <span className="text-md font-bold text-foreground-secondary">Grupo de Checkboxes (Selección Múltiple)</span>
              <p className="text-xs text-foreground-secondary -mt-2">Permite seleccionar cero o más opciones.</p>

              <div className="flex flex-col gap-2">
                <Checkbox
                  label="Administrador"
                  name="chk-admin"
                  checked={checkedItems.admin}
                  onChange={(val) => handleCheckboxChange("admin", val)}
                />
                <Checkbox
                  label="Editor"
                  name="chk-editor"
                  checked={checkedItems.editor}
                  onChange={(val) => handleCheckboxChange("editor", val)}
                />
                <Checkbox
                  label="Lector"
                  name="chk-viewer"
                  checked={checkedItems.viewer}
                  onChange={(val) => handleCheckboxChange("viewer", val)}
                />
              </div>

              <div className="text-xs text-foreground-secondary pt-2 border-t border-border">
                Seleccionados: {Object.entries(checkedItems).filter(([_, v]) => v).map(([k]) => k).join(", ") || "Ninguno"}
              </div>
            </div>

            {/* Radio Group */}
            <div className="flex flex-col gap-4 p-5 border border-border rounded-lg bg-background-muted">
              <span className="text-md font-bold text-foreground-secondary">Grupo de RadioFields (Selección Única)</span>
              <p className="text-xs text-foreground-secondary -mt-2">Permite seleccionar exactamente una opción del grupo.</p>

              <div className="flex flex-col gap-2">
                <RadioField
                  id="opt-a"
                  label="Opción A"
                  name="radio-group-demo"
                  checked={selectedRadio === "opt-a"}
                  onChange={(checked) => checked && setSelectedRadio("opt-a")}
                />
                <RadioField
                  id="opt-b"
                  label="Opción B"
                  name="radio-group-demo"
                  checked={selectedRadio === "opt-b"}
                  onChange={(checked) => checked && setSelectedRadio("opt-b")}
                />
                <RadioField
                  id="opt-c"
                  label="Opción C"
                  name="radio-group-demo"
                  checked={selectedRadio === "opt-c"}
                  onChange={(checked) => checked && setSelectedRadio("opt-c")}
                />
              </div>

              <div className="text-xs text-foreground-secondary pt-2 border-t border-border">
                Seleccionado: <span className="font-semibold text-primary-main">{selectedRadio}</span>
              </div>
            </div>

          </div>
        </Card>

        {/* 4. Inputs Auxiliares */}
        <Card className="flex flex-col gap-6 p-6 md:col-span-2">
          <h2 className="text-xl font-bold text-foreground">4. Elementos Adicionales de Formulario</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Checkbox */}
            <div className="flex flex-col gap-4 p-4 border border-border rounded-lg bg-background-muted justify-center">
              <span className="text-sm font-bold text-foreground-secondary">Checkbox Individual</span>
              <Checkbox
                label="Aceptar términos y condiciones"
                name="checkbox-demo"
                checked={checkboxVal}
                onChange={setCheckboxVal}
              />
              <span className="text-xs text-foreground-secondary">
                Estado: {checkboxVal ? "Activo" : "Inactivo"}
              </span>
            </div>

            {/* Switch */}
            <div className="flex flex-col gap-4 p-4 border border-border rounded-lg bg-background-muted justify-center">
              <span className="text-sm font-bold text-foreground-secondary">Switch (Interruptor)</span>
              <Switch
                label="Habilitar notificaciones"
                name="switch-demo"
                checked={switchVal}
                onChange={setSwitchVal}
              />
              <span className="text-xs text-foreground-secondary">
                Estado: {switchVal ? "Habilitado" : "Deshabilitado"}
              </span>
            </div>

            {/* DateField */}
            <div className="flex flex-col gap-4 p-4 border border-border rounded-lg bg-background-muted justify-center">
              <span className="text-sm font-bold text-foreground-secondary">DateField (Campo de Fecha)</span>
              <DateField
                label="Fecha de Nacimiento"
                name="date-demo"
                value={dateVal}
                onChange={setDateVal}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
