"use client";

import { useRouter } from "next/navigation";
import LoginCard from "../components/LoginCard";

export default function Page() {
  const router = useRouter();

  function handleLogin(email, password) {
    console.log("Intentando login con:", email, password);

    // Acá en el futuro validás credenciales contra tu backend

    router.push("/home"); 
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <LoginCard onLogin={handleLogin} />
    </main>
  );
}
