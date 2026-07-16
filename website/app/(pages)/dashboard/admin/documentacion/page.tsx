import Link from "next/link";
import { Card, IconifyIcon } from "@components";

export default function DocumentacionPage() {
  const sections = [
    {
      title: "Botones",
      desc: "Variantes de botones del sistema: primarios, éxito, error, advertencia, iconos y menús contextuales.",
      href: "/dashboard/admin/documentacion/botones",
      icon: "agregar",
      components: ["Boton", "BotonGuardar", "BotonEliminar", "BotonEditar", "BotonCancelar", "BotonIcono", "BotonMenu"]
    },
    {
      title: "Tablas",
      desc: "Componentes de tabla simples, paginados, con acciones integradas y ordenamiento de columnas.",
      href: "/dashboard/admin/documentacion/tablas",
      icon: "documento",
      components: ["TablaSimple", "TablaConAcciones", "TablaPaginada", "TablaConAccionesPaginada"]
    },
    {
      title: "Cards & Paper",
      desc: "Contenedores y tarjetas con elevación, estados de color (éxito, error, advertencia) y efectos hover.",
      href: "/dashboard/admin/documentacion/cards",
      icon: "dashboard",
      components: ["Paper", "Card", "CardStatus"]
    },
    {
      title: "Campos e Inputs",
      desc: "Componentes de entrada de datos: campos de texto, selección múltiple, casillas de verificación y fechas.",
      href: "/dashboard/admin/documentacion/campos",
      icon: "tuerca",
      components: ["TextField", "Select", "MultiSelect", "Checkbox", "DateField", "Switch"]
    },
    {
      title: "UX & Navegación",
      desc: "Flujos de navegación paso a paso, visualización de perfiles de usuario y elementos visuales auxiliares.",
      href: "/dashboard/admin/documentacion/ux",
      icon: "user1",
      components: ["Stepper", "Avatar"]
    }
  ];

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 w-full max-w-6xl mx-auto font-outfit">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground-title">Componentes</h1>
        <p className="text-foreground-secondary">
          Documentación interactiva de la biblioteca de componentes de la interfaz de SCARH.
        </p>
      </div>

      <div className="h-px w-full bg-border" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => (
          <Link key={section.href} href={section.href} className="no-underline text-inherit group">
            <Card className="flex flex-col gap-4 p-5 h-full transition-all duration-200 hover:border-primary-main hover:shadow-md cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center p-3 rounded-full bg-primary-light text-primary-main transition-colors group-hover:bg-primary-main group-hover:text-white">
                  <IconifyIcon variant={section.icon as any} />
                </div>
                <h2 className="text-xl font-bold text-foreground transition-colors group-hover:text-primary-main">
                  {section.title}
                </h2>
              </div>
              <p className="text-foreground-secondary text-sm flex-grow">
                {section.desc}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {section.components.map((comp) => (
                  <span key={comp} className="text-xs bg-background-default text-foreground-secondary px-2.5 py-1 rounded-full border border-border">
                    {comp}
                  </span>
                ))}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
