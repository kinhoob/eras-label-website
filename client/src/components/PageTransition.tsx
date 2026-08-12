import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";

export function PageTransitionHandler({ onTransitionStart }: { onTransitionStart?: () => void }) {
  const [location] = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    if (onTransitionStart) onTransitionStart();
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 500); // Exatamente 0.5s de transição com ampulheta
    return () => clearTimeout(timer);
  }, [location]);

  if (!isTransitioning) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#f6f3ee]/90 backdrop-blur-md flex flex-col items-center justify-center transition-opacity duration-300">
      <div className="flex flex-col items-center gap-4">
        <svg
          className="hourglass-spin text-[#c95139]"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 22h14" />
          <path d="M5 2h14" />
          <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
          <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
        </svg>
        <span className="font-serif tracking-widest text-xs uppercase text-[#23221e]">
          transição de era...
        </span>
      </div>
    </div>
  );
}
