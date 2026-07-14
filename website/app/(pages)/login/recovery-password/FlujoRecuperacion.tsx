"use client";

import React, { useState } from "react";
import { Stepper } from "@components";
import PasoSolicitar from "./PasoSolicitar";
import PasoVerificar from "./PasoVerificar";
import PasoNuevaPassword from "./PasoNuevaPassword";

export function FlujoRecuperacion() {
  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [recoveryToken, setRecoveryToken] = useState("");

  const avanzarPaso2 = (correo: string) => {
    setEmail(correo);
    setPaso(2);
  };

  const avanzarPaso3 = (token: string) => {
    setRecoveryToken(token);
    setPaso(3);
  };

  const retrocederPaso1 = () => {
    setPaso(1);
  };

  const pasos = ["Solicitar", "Verificar", "Nueva Contraseña"];

  return (
    <div className="flex flex-col gap-8 w-full items-center">
      {/* Indicador de pasos */}
      <Stepper currentStep={paso} steps={pasos} />
      
      {/* Contenedores de los pasos */}
      <div className="w-full flex justify-center mt-4">
        {paso === 1 && <PasoSolicitar onNext={avanzarPaso2} />}
        {paso === 2 && <PasoVerificar email={email} onNext={avanzarPaso3} onBack={retrocederPaso1} />}
        {paso === 3 && <PasoNuevaPassword token={recoveryToken} />}
      </div>
    </div>
  );
}

export default FlujoRecuperacion;
