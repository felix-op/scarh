import { z } from "zod";

export const ImportIssueSchema = z.object({
  field: z.string(),
  code: z.string(),
  message: z.string(),
});

export type ImportIssue = z.infer<typeof ImportIssueSchema>;

export const MedicionRowSchema = z.object({
  rowNumber: z.number(),
  limnigrafoId: z.number().nullable(),
  fechaHora: z.string().nullable(),
  /** Texto de fecha/hora tal como vino en el archivo, para mostrarlo cuando no se pudo interpretar. */
  fechaHoraOriginal: z.string().nullable().default(null),
  alturaAgua: z.number().nullable(),
  presion: z.number().nullable(),
  temperatura: z.number().nullable(),
  nivelBateria: z.number().nullable(),
  status: z.enum(["valid", "error", "duplicate_file", "duplicate_database", "warning"]).default("valid"),
  issues: z.array(ImportIssueSchema).default([]),
});

export type MedicionRowType = z.infer<typeof MedicionRowSchema>;
