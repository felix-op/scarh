// No agregar "use client" a este archivo: RootLayout (Server Component) importa THEME_COOKIE
// para leer la cookie con cookies() de next/headers. Si el módulo pasara a ser de cliente,
// Next lo reemplaza por una referencia opaca en el servidor y rompe ese import (pantalla en blanco).
export const THEME_COOKIE = "theme-preference";
