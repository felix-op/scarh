"use client";

import { useState, type FormEvent } from "react";
import Boton from "../components/Boton";
import { TextField } from "../components/TextField";

export default function Home() {
  const [name, setName] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);

function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (name.trim().length === 0) {
      setShowWelcome(false);
      return;
    }

    setShowWelcome(true);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-slate-100 text-slate-900 p-6">
      <div className="w-full max-w-xl rounded-[32px] bg-white shadow-2xl shadow-sky-100/80 border border-white/40 p-10 flex flex-col gap-6">
        <header className="text-center space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-sky-400 font-semibold">
            Portal SCARH
          </p>
          <h1 className="text-4xl font-bold text-slate-900">
            ¡Bienvenido de nuevo!
          </h1>
          <p className="text-slate-500">
            Ingresa tu nombre y presiona el botón para generar tu carnet de bienvenida.
          </p>
        </header>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <TextField
            label="Dime tu nombre de usuario"
            placeholder="nombre"
            value={name}
            onChange={setName}
          />

          <Boton type="submit" className="w-full">
            Mostrar carnet
          </Boton>
        </form>

        {showWelcome && (
          <section className="mt-2 rounded-3xl border border-sky-100 bg-gradient-to-r from-sky-50 via-sky-100 to-white p-6 shadow-lg text-slate-900">
            <p className="text-xs uppercase tracking-[0.3em] text-sky-400 font-semibold">
              Credencial virtual
            </p>
            <h2 className="text-3xl font-semibold mt-2">
              Hola, {name.trim() || "Explorador"}
            </h2>
            <p className="text-slate-600 mt-3 leading-relaxed">
              Nos alegra tenerte de vuelta. Usa este carnet como tu bienvenida personal
              a la plataforma SCARH y continúa explorando tus proyectos favoritos.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
