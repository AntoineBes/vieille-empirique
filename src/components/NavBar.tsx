"use client";

import { useState } from "react";

const NAV_LINKS = [
  { href: "/documents", label: "Documents" },
  { href: "/statistiques", label: "Statistiques" },
  { href: "/documentation", label: "Documentation" },
];

export function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="divider bg-white sticky top-0 z-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-white px-4 py-2 text-sm font-medium"
      >
        Aller au contenu principal
      </a>

      <nav className="container-wide py-3 flex items-center justify-between" aria-label="Navigation principale">
        <a href="/" className="font-serif text-lg font-semibold tracking-tight">
          Veille <span className="text-accent-economie">Empirique</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm link-subtle"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden p-2 -mr-2 text-ink-600"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden divider">
          <div className="container-wide py-4 flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm link-subtle"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
