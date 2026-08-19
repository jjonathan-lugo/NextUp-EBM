// Small hand-drawn line icons for the homepage's feature cards
// (pages/index.js) — plain inline SVG rather than an icon library or
// external image files, so there's nothing to fetch and they inherit
// color via `currentColor` (see styles.featureIcon's `color: var(--accent)`
// in home.module.css). Generic 24x24 outline style, stroke-based.
function IconBase({ children, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export function TimerIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l3 2" />
      <path d="M9 2h6" />
      <path d="M12 2v3" />
    </IconBase>
  )
}

export function BoltIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M12 2 4 14h6l-1 8 9-13h-6l1-7z" />
    </IconBase>
  )
}

export function PhoneIcon(props) {
  return (
    <IconBase {...props}>
      <rect x="6" y="2" width="12" height="20" rx="2.5" />
      <path d="M11 18h2" />
    </IconBase>
  )
}

// Filled, not outlined — doesn't use IconBase (which defaults to
// fill="none") since a solid star reads as a highlight/badge, closer
// to what it's marking (TipCard's "this is a hint" flag) than a plain
// line icon would.
export function StarIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
      stroke="none"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.27l-5.8 3.09 1.11-6.46-4.7-4.58 6.49-.94L12 2.5z" />
    </svg>
  )
}
