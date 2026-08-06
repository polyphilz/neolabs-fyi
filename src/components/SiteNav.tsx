interface Props {
  currentPath?: string;
}

const links = [
  { href: "/table", label: "Table" },
  { href: "/about", label: "About" },
];

/** Shared desktop navigation and its compact, native mobile overflow menu. */
export function SiteNav({ currentPath = "/" }: Props) {
  return (
    <>
      <nav
        className="island island-nav desktop-site-nav"
        aria-label="Site navigation"
      >
        {links.map((item) => (
          <a
            key={item.href}
            href={item.href}
            aria-current={currentPath === item.href ? "page" : undefined}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <details className="mobile-site-nav">
        <summary className="island" aria-label="Open site navigation">
          <span>Menu</span>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3 5h10M3 8h10M3 11h10" />
          </svg>
        </summary>
        <nav className="mobile-site-menu" aria-label="Site navigation">
          {links.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={currentPath === item.href ? "page" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </details>
    </>
  );
}
