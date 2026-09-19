import type { Tool, ToolCategory } from "@/lib/types";

export const tools: Tool[] = [
  {
    id: "past-questions",
    name: "Past questions",
    description: "Papers from previous sessions, sorted by course code.",
    icon: "papers",
    href: "/tools/past-questions",
    category: "academics",
    popular: true,
    note: "Free",
  },
  {
    id: "document-generator",
    name: "Document generator",
    description: "Formal letters and requests, formatted correctly.",
    icon: "document",
    href: "/documents",
    category: "documents",
    popular: true,
    note: "From ₦500",
  },
  {
    id: "cv-generator",
    name: "CV generator",
    description: "A one-page CV that fits internship applications.",
    icon: "cv",
    href: "/tools/cv-generator",
    category: "documents",
    popular: true,
    note: "From ₦800",
  },
  {
    id: "anonymous",
    name: "Anonymous",
    description: "Your own link for messages, with photos attached.",
    icon: "anonymous",
    href: "/anonymous/robin",
    category: "community",
    popular: true,
    isNew: true,
    note: "Free",
  },
  {
    id: "exam-guide",
    name: "Exam guide",
    description: "Topic breakdowns and what lecturers repeat.",
    icon: "guide",
    href: "/tools/exam-guide",
    category: "academics",
  },
  {
    id: "gp-calculator",
    name: "GP calculator",
    description: "Work out your CGPA across semesters.",
    icon: "calculator",
    href: "/tools/gp-calculator",
    category: "academics",
  },
  {
    id: "scholarships",
    name: "Scholarships",
    description: "Open scholarships with deadlines you can still meet.",
    icon: "scholarship",
    href: "/opportunities?category=Scholarship",
    category: "opportunities",
  },
  {
    id: "events",
    name: "Events",
    description: "What is happening on campus this week.",
    icon: "event",
    href: "/opportunities?category=Event",
    category: "opportunities",
  },
  {
    id: "timetable",
    name: "Timetable",
    description: "Your lectures and tests in one week view.",
    icon: "timetable",
    href: "/tools/timetable",
    category: "academics",
    isNew: true,
  },
  {
    id: "marketplace",
    name: "Marketplace",
    description: "Buy and sell within your campus.",
    icon: "market",
    href: "/marketplace",
    category: "community",
  },
];

export const toolCategories: { id: ToolCategory; label: string; blurb: string }[] = [
  { id: "academics", label: "Academics", blurb: "Study, revise and track results." },
  { id: "documents", label: "Documents", blurb: "Letters and CVs, properly formatted." },
  { id: "community", label: "Community", blurb: "Talk, buy and sell around campus." },
  { id: "opportunities", label: "Opportunities", blurb: "Scholarships, internships and events." },
];

export const popularTools = tools.filter((tool) => tool.popular);

export function toolsByCategory(category: ToolCategory): Tool[] {
  return tools.filter((tool) => tool.category === category);
}
