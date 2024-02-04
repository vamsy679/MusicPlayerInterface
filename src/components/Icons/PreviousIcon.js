import React from "react";

function PreviousIcon({ size = 18 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M21 5v14l-8 -7z"></path>
      <path d="M10 5v14l-8 -7z"></path>
    </svg>
  );
}

export default PreviousIcon;
