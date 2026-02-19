import type { SVGProps } from "react";

export default function LockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M7 11V8.5C7 5.46243 9.46243 3 12.5 3C15.5376 3 18 5.46243 18 8.5V11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6.5 11H18.5C19.3284 11 20 11.6716 20 12.5V19.5C20 20.3284 19.3284 21 18.5 21H6.5C5.67157 21 5 20.3284 5 19.5V12.5C5 11.6716 5.67157 11 6.5 11Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
