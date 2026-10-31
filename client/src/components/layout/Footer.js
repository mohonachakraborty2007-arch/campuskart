import Link from "next/link";

const links = [
  { href: "/about", label: "About" },
  { href: "/rules", label: "Posting rules" },
  { href: "/privacy", label: "Privacy" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-horizontal.png"
            alt="CampusKart"
            className="h-8 w-auto"
          />
          <p className="mt-3 max-w-xs text-sm text-muted">
            A student-only marketplace for buying, selling and trading on
            campus.
          </p>
        </div>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-muted transition hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-border">
        <p className="mx-auto max-w-[1200px] px-4 py-5 text-sm text-muted md:px-6">
          © {new Date().getFullYear()} CampusKart. Built by students, for
          students.
        </p>
      </div>
    </footer>
  );
}