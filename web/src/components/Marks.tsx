// Product mark (Open Orbit) recoloured by theme tokens.
export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 26 26"
      width={size}
      height={size}
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M11 1.67 A11.5 11.5 0 0 1 15 24.33"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="3"
      />
      <circle cx="22.5" cy="13.5" r="3.5" fill="var(--cta)" />
    </svg>
  );
}

// Animated Madar AI mark (geometry from assets/madar-ai-mark.svg).
export function AiMark({
  size = 24,
  animated = true,
}: {
  size?: number;
  animated?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 46 46"
      width={size}
      height={size}
      aria-hidden="true"
      className="shrink-0"
    >
      <g className={animated ? "madar-outer" : undefined}>
        <circle
          cx="23"
          cy="23"
          r="22"
          fill="none"
          stroke="var(--mark-ring)"
          strokeWidth="2"
        />
        <path
          d="M7.44 7.44 A22 22 0 0 1 38.56 7.44"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
        />
      </g>
      <g className={animated ? "madar-inner" : undefined}>
        <circle
          cx="23"
          cy="23"
          r="15.5"
          fill="none"
          stroke="var(--mark-inner)"
          strokeWidth="1"
        />
        <circle cx="23" cy="7.5" r="2.5" fill="var(--accent)" />
      </g>
      <circle
        className={animated ? "madar-core" : undefined}
        cx="23"
        cy="23"
        r="4.5"
        fill="var(--cta)"
      />
    </svg>
  );
}
