import type { SVGProps } from "react";

export function EyeOff(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="m3 3 18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 4.24A9.8 9.8 0 0 1 12 4c5 0 8.27 4.13 9.5 6.02a2 2 0 0 1 0 2c-.43.66-1.08 1.51-1.95 2.34" />
      <path d="M6.61 6.61A15.9 15.9 0 0 0 2.5 10.02a2 2 0 0 0 0 2C3.73 13.91 7 18.04 12 18.04c1.4 0 2.67-.33 3.8-.86" />
    </svg>
  );
}
