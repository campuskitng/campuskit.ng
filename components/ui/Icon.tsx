import {
  BookOpenCheck,
  Calculator,
  CalendarDays,
  EyeOff,
  FileText,
  GraduationCap,
  Library,
  PenLine,
  ShoppingBag,
  Table2,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Tool rows store `icon` as a string so the value can come from a database row
 * later. Anything unknown falls back to a neutral icon rather than crashing.
 */
const registry: Record<string, LucideIcon> = {
  papers: Library,
  document: FileText,
  cv: UserRound,
  anonymous: EyeOff,
  guide: BookOpenCheck,
  calculator: Calculator,
  scholarship: GraduationCap,
  event: CalendarDays,
  timetable: Table2,
  market: ShoppingBag,
  signature: PenLine,
};

export function ToolIcon({
  name,
  className = "h-5 w-5",
}: {
  name: string;
  className?: string;
}) {
  const Component = registry[name] ?? FileText;
  return <Component className={className} strokeWidth={1.75} aria-hidden="true" />;
}
