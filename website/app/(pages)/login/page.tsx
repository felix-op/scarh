import { Card, BotonThemeToggle } from "@components";
import { LoginForm } from "./form";

export default function Login() {

  const images = [
    { src: "fondo-escritorio-1.jpg", alt: "fondo", tipo: "desktop", theme: "light" },
    { src: "fondo-escritorio-2.jpg", alt: "fondo", tipo: "desktop", theme: "light" },
    { src: "fondo-escritorio-3.jpg", alt: "fondo", tipo: "desktop", theme: "dark" },
    { src: "fondo-mobile-1.jpg", alt: "fondo", tipo: "mobile", theme: "light" },
    { src: "fondo-mobile-2.jpg", alt: "fondo", tipo: "mobile", theme: "dark" },
    { src: "fondo-mobile-3.jpg", alt: "fondo", tipo: "mobile", theme: "dark" },
  ];

  return (
    <>
      <img
        src="fondo-escritorio-1.jpg"
        alt="Fondo"
        className="w-full h-full absolute z-0 hidden md:block"
      />
      <img
        src="fondo-mobile-3.jpg"
        alt="Fondo"
        className="w-full h-full absolute z-0 md:hidden"
      />
      <div className="flex flex-col flex-1 items-center justify-center text-foreground gap-6 p-2 md:p-6 z-1">
        
        <Card className="flex flex-col gap-6 p-4 md:p-8 items-center w-full max-w-md">
          <div className="w-full flex flex-col gap-2 border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src="logo.png"
                  alt="Logo de SCARH"
                  width={60}
                  height={60}
                />
                <h1>SCARH</h1>
              </div>
              <div className="flex flex-col items-center gap-2">
                <BotonThemeToggle />
              </div>
            </div>
          </div>

          <LoginForm />
        </Card>
      </div>
    </>
  );
}
