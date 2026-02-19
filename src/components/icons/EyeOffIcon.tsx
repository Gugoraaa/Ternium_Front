import type { SVGProps } from "react";

export default function EyeOffIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M3 4L21 20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M10.2 10.5C9.8 10.9 9.5 11.4 9.5 12C9.5 13.4 10.6 14.5 12 14.5C12.6 14.5 13.1 14.3 13.5 13.9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M7.2 7.6C5.4 8.8 3.9 10.5 2.5 12C4.8 16.2 8.2 18.5 12 18.5C13.7 18.5 15.3 18 16.8 17.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M19.7 15.7C20.4 14.6 21 13.4 21.5 12C19.2 7.8 15.8 5.5 12 5.5C11.1 5.5 10.2 5.6 9.4 5.9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
