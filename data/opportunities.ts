import type { Opportunity } from "@/lib/types";

export const opportunities: Opportunity[] = [
  {
    id: "nnpc-seplat",
    title: "NNPC/Seplat undergraduate scholarship",
    organization: "Seplat Energy",
    category: "Scholarship",
    deadline: "2026-10-03",
    eligibility: "200 level, engineering and sciences",
    location: "Nationwide",
    href: "/opportunities/nnpc-seplat",
  },
  {
    id: "flutterwave-internship",
    title: "Frontend engineering internship",
    organization: "Flutterwave",
    category: "Internship",
    deadline: "2026-09-28",
    eligibility: "SIWES placement accepted",
    location: "Lagos · Hybrid",
    href: "/opportunities/flutterwave-internship",
  },
  {
    id: "hult-prize",
    title: "Hult Prize campus round",
    organization: "Hult Prize Foundation",
    category: "Competition",
    deadline: "2026-10-12",
    eligibility: "Teams of 3–4 students",
    location: "UNIBEN",
    href: "/opportunities/hult-prize",
  },
  {
    id: "career-fair",
    title: "Faculty of Engineering career fair",
    organization: "UNIBEN Careers Office",
    category: "Event",
    deadline: "2026-09-22",
    location: "Akenzua Hall",
    href: "/opportunities/career-fair",
  },
  {
    id: "campus-night",
    title: "Campus Night 2026",
    organization: "UNIBEN Students' Union",
    category: "Event",
    deadline: "2026-09-25",
    location: "UNIBEN, Main Bowl",
    eligibility: "Free entry with student ID",
    href: "/opportunities/campus-night",
  },
  {
    id: "mtn-foundation",
    title: "MTN Foundation science scholarship",
    organization: "MTN Foundation",
    category: "Scholarship",
    deadline: "2026-11-01",
    eligibility: "CGPA 3.5 and above",
    location: "Nationwide",
    href: "/opportunities/mtn-foundation",
  },
  {
    id: "data-fellowship",
    title: "Data analysis fellowship, cohort 4",
    organization: "Data Science Nigeria",
    category: "Fellowship",
    deadline: "2026-10-19",
    eligibility: "Final year and recent graduates",
    location: "Remote",
    href: "/opportunities/data-fellowship",
  },
];

export const homeOpportunities = opportunities.slice(0, 4);

/** "Closes in 8 days" reads better than a raw date in a feed. */
export function deadlineLabel(deadline: string, today = new Date()): string {
  const target = new Date(`${deadline}T23:59:59`);
  const days = Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
  if (days < 0) return "Closed";
  if (days === 0) return "Closes today";
  if (days === 1) return "Closes tomorrow";
  if (days <= 14) return `Closes in ${days} days`;
  return `Closes ${target.toLocaleDateString("en-NG", { day: "numeric", month: "short" })}`;
}

export function isClosingSoon(deadline: string, today = new Date()): boolean {
  const target = new Date(`${deadline}T23:59:59`);
  const days = Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
  return days >= 0 && days <= 7;
}
