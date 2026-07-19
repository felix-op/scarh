import "next/cache";

declare module "next/cache" {
  /**
   * Redefinición de revalidateTag para solventar el bug de Next.js 15
   * donde el segundo parámetro (profile) es obligatorio en la firma de TS.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function revalidateTag(_tag: string, _profile?: any): void;
}
