export default function GridPatternBackground() {
  return (
    <svg
      aria-hidden="true"
      style={{
        visibility: "visible",
        maskImage:
          "linear-gradient(to bottom, #ffffffad 90%, transparent 100%)",
        opacity: 0.3,
        backgroundColor: "#323130",
      }}
      className="pointer-events-none absolute inset-0 -z-10 w-full h-full fill-green-500/50 stroke-green-500/50"
    >
      <defs>
        <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
        </filter>
        <pattern
          id="grid-pattern"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
          x="-1"
          y="-1"
        >
          <path d="M.5 20V.5H20" fill="none" strokeDasharray="0" />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        strokeWidth="0"
        fill="url(#grid-pattern)"
        filter="url(#blur)"
      />
    </svg>
  );
}
