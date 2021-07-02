import React from 'react';

interface CloseButtonPros {
  className?: string;
}

function CloseButton({ className }: CloseButtonPros) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 10 10"
      height="10"
      width="10"
      className={className}
    >
      <path
        fill="currentColor"
        d="M 0,0 0,0.7 4.3,5 0,9.3 0,10 0.7,10 5,5.7 9.3,10 10,10 10,9.3 5.7,5 10,0.7 10,0 9.3,0 5,4.3 0.7,0 Z"
      />
    </svg>
  );
}

export default CloseButton;
