/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";

// ############################################################
// Zod Schemas - Arguments
// ############################################################

export const AddFieldArgsSchema = z.object({
  name: z.string(),
  type: z.enum(["string", "number", "boolean", "date", "object", "array"]),
});

export const PreviewArgsSchema = z.object({
  specPath: z.string().refine(path => path.endsWith(".yaml") || path.endsWith(".json"), {
    message: "Spec path must end with .yaml or .json",
  }),
});

export const CheckApiArgsSchema = z.object({
  apiUrl: z.string().url(),
  specPath: z.string().endsWith(".tsp").or(z.string().endsWith(".yaml")),
});

export const CheckSpecArgsSchema = z.object({
  specPath: z.string().endsWith(".tsp").or(z.string().endsWith(".yaml")),
});

export const GenerateArgsSchema = z.object({
  specPath: z.string().endsWith(".tsp").or(z.string().endsWith(".yaml")),
});

export const CompileArgsSchema = z.object({
  typespecPath: z.string().endsWith(".tsp", { message: "File must be a .tsp file" }),
});

// ############################################################
// Zod Schemas - Options
// ############################################################

export const InitCommandSchema = z.object({
  template: z.string().min(1).optional(),
  list: z.boolean().optional(),
});

export const AddFieldCommandSchema = z.object({
  example: z.string().optional(),
  description: z.string().optional(),
});

export const CheckApiCommandSchema = z.object({
  client: z.string().optional(),
  report: z.enum(["json", "html"]).optional(),
  auth: z.string().optional(),
});

export const GenerateServerCommandSchema = z.object({
  lang: z.string().optional(),
  only: z
    .string()
    .optional()
    .transform(val => val?.split(","))
    .refine(val => !val || val.every(c => ["controllers", "models", "routes"].includes(c)), {
      message: "Only valid components are: controllers, models, routes",
    }),
});

export const CheckSpecCommandSchema = z.object({
  base: z.string().optional(),
});

export const GenerateClientCommandSchema = z.object({
  lang: z.string().optional(),
  output: z.string().optional(),
  docs: z.boolean().optional(),
});

// ############################################################
// Types
// ############################################################

export type AddFieldArgs = z.infer<typeof AddFieldArgsSchema>;
export type PreviewArgs = z.infer<typeof PreviewArgsSchema>;
export type CheckApiArgs = z.infer<typeof CheckApiArgsSchema>;
export type CheckSpecArgs = z.infer<typeof CheckSpecArgsSchema>;
export type GenerateArgs = z.infer<typeof GenerateArgsSchema>;
export type CompileArgs = z.infer<typeof CompileArgsSchema>;

// ############################################################
// Types - Options
// ############################################################

export type InitCommandOptions = z.infer<typeof InitCommandSchema>;
export type AddFieldCommandOptions = z.infer<typeof AddFieldCommandSchema>;
export type CheckApiCommandOptions = z.infer<typeof CheckApiCommandSchema>;
export type GenerateServerCommandOptions = z.infer<typeof GenerateServerCommandSchema>;
export type CheckSpecCommandOptions = z.infer<typeof CheckSpecCommandSchema>;
export type GenerateClientCommandOptions = z.infer<typeof GenerateClientCommandSchema>;
