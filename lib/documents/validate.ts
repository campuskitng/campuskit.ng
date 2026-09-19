import type { DocumentField } from "@/lib/types";

export function validateFieldValues(fields: DocumentField[] | null | undefined, values: Record<string, string>): string[] {
  const missing: string[] = [];
  for (const field of fields ?? []) {
    if (field.optional) continue;
    if (!values[field.id] || !String(values[field.id]).trim()) missing.push(field.label);
  }
  return missing;
}
