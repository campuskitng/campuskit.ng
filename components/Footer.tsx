import Link from "next/link";

const columns = [
  {
    heading: "Tools",
    links: [
      { label: "Past questions", href: "/tools/past-questions" },
      { label: "Document generator", href: "/documents" },
      { label: "CV generator", href: "/tools/cv-generator" },
      { label: "Anonymous", href: "/anonymous/robin" },
    ],
  },
  {
    heading: "Discover",
    links: [
      { label: "Opportunities", href: "/opportunities" },
      { label: "Marketplace", href: "/marketplace" },
      { label: "All tools", href: "/tools" },
    ],
  },
  {
    heading: "CampusKit",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-surface">
      <div className="shell grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2 text-title font-semibold text-ink">
            <span
              aria-hidden="true"
              className="grid h-7 w-7 place-items-center rounded-[9px] bg-brand text-[13px] font-bold text-white"
            >
              C
            </span>
            CampusKit
          </Link>
          <p className="mt-3 max-w-[30ch] text-label text-muted">
            Tools for Nigerian students, built around what people actually need each semester.
          </p>
        </div>

        {columns.map((column) => (
          <nav key={column.heading} aria-label={column.heading}>
            <h2 className="text-label font-semibold text-ink">{column.heading}</h2>
            <ul className="mt-3 space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-label text-muted transition-colors hover:text-brand-700"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="shell flex flex-col gap-2 border-t border-hairline py-5 text-meta text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} CampusKit</p>
        <p>Benin City, Nigeria</p>
      </div>
    </footer>
  );
}
