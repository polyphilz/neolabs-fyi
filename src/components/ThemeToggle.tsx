/**
 * Light/dark switch.
 *
 * Both icons are rendered and CSS picks which one shows, rather than the button
 * choosing in JavaScript. The static pages render this through Astro with no
 * client directive, so at paint time there is no script to ask — and the theme
 * may be coming from `prefers-color-scheme` rather than from storage, which
 * markup can't know either. Letting the stylesheet decide keeps the same markup
 * correct in both cases and leaves the explorer's hydrated copy nothing to
 * mismatch on.
 *
 * The click itself is handled by a delegated listener in the layout, so this
 * stays inert markup and the static pages keep shipping no component JS.
 */
export function ThemeToggle() {
  return (
    <button
      type="button"
      className="island-btn theme-toggle"
      data-theme-toggle
      aria-label="Toggle light and dark theme"
    >
      {/* Sun — shown on a dark page, where the button switches to light. */}
      <svg
        className="theme-icon theme-icon-sun"
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.4v2.2M12 19.4v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.4 12h2.2M19.4 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" />
      </svg>
      {/* Moon — shown on a light page. */}
      <svg
        className="theme-icon theme-icon-moon"
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.5 13.4A8.6 8.6 0 1 1 10.6 3.5a6.7 6.7 0 0 0 9.9 9.9z" />
      </svg>
    </button>
  );
}
