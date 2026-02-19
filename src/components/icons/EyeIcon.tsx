import type { SVGProps } from "react";

export default function EyeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M2.5 12C4.8 7.8 8.2 5.5 12 5.5C15.8 5.5 19.2 7.8 21.5 12C19.2 16.2 15.8 18.5 12 18.5C8.2 18.5 4.8 16.2 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
