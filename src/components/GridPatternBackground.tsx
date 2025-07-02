export default function GridPatternBackground() {
  return (
    <svg
      aria-hidden="true"
      style={{
        visibility: "visible",
        maskImage: "linear-gradient(to top, #ffffffad, transparent)",
        opacity: 0.3,
      }}
      className="pointer-events-none absolute inset-0 -z-10 w-full h-full fill-blue-500/50 stroke-blue-500/50"
    >
      <defs>
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
      />
    </svg>
  );
}
