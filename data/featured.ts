import type { AnonymousMessage, FeaturedSlide } from "@/lib/types";

/**
 * The first slide is a real event when event data exists; the remaining slides
 * are the featured tools, which are the default if no event is live.
 */
export const featuredSlides: FeaturedSlide[] = [
  {
    id: "campus-night",
    kind: "event",
    tag: "Upcoming",
    title: "Campus Night 2026",
    blurb: "Live sets, food stalls and the departmental showcase, all on one ground.",
    meta: ["Friday, 25 September", "UNIBEN, Main Bowl", "Free entry with student ID"],
    image: "/mock/featured-event.svg",
    imageAlt: "Crowd lit by stage lights at a night-time campus concert",
    ctaLabel: "View event",
    href: "/opportunities/campus-night",
  },
  {
    id: "past-questions",
    kind: "tool",
    tag: "Popular this week",
    title: "Past questions",
    blurb: "Find questions for your course before your next exam.",
    meta: ["1,240 papers", "48 departments"],
    image: "/mock/featured-papers.svg",
    imageAlt: "Stack of past examination papers on a desk",
    ctaLabel: "Open past questions",
    href: "/tools/past-questions",
  },
  {
    id: "document-generator",
    kind: "tool",
    tag: "Most used tool",
    title: "Document generator",
    blurb: "Create properly formatted student documents in minutes.",
    meta: ["22 document types", "Ready to print"],
    image: "/mock/featured-documents.svg",
    imageAlt: "Formal letter laid out on a desk beside a pen",
    ctaLabel: "Generate a document",
    href: "/documents",
  },
];

/** Sample inbox used by the homepage anonymous demo. */
export const anonymousSamples: AnonymousMessage[] = [
  {
    id: "msg-1",
    body: "Okay I have to ask... who took this picture of you? 😂",
    receivedAt: "4 min ago",
    image: {
      src: "/mock/anon-attachment.svg",
      alt: "Photo attached to an anonymous message: three students laughing outside a lecture hall",
    },
  },
  {
    id: "msg-2",
    body: "You explained that circuits question better than the lecturer did. Thank you.",
    receivedAt: "1 hour ago",
  },
  {
    id: "msg-3",
    body: "Saw you at the faculty park today. This is all I'm saying.",
    receivedAt: "Yesterday",
  },
];
