"use client";
import { useState } from "react";
import { Boton } from "@components";

export function RenderServerResponse({ action, title, swaggerUrl }: { action: () => Promise<any>, title: string, swaggerUrl?: string }) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await action();
      setData(res);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 border border-border rounded-lg bg-background-default">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground-title">{title}</h3>
        <Boton
          onClick={handleTest}
          disabled={loading}
          content={loading ? "Cargando..." : "Probar GET"}
          variant="primary"
        />
      </div>
      {swaggerUrl && (
        <p className="text-sm text-foreground-secondary">
          * Si deseas probar todas las capacidades de este endpoint de forma nativa (parámetros y métodos como POST/PUT), ingresa al{" "}
          <a href={swaggerUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">
            Swagger UI
          </a>.
        </p>
      )}
      {error && <div className="text-error mt-2 p-2 bg-error-light/20 rounded">{error}</div>}
      {data && (
        <pre className="mt-2 p-4 bg-background overflow-auto max-h-60 rounded text-sm text-foreground whitespace-pre-wrap break-words border border-border">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
