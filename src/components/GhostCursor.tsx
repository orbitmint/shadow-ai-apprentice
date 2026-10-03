'use client';

import React, { useEffect, useState } from 'react';
import { MousePointer2 } from 'lucide-react';

export const GhostCursor: React.FC<{
  isActive: boolean;
  onComplete?: () => void;
}> = ({ isActive, onComplete }) => {
  const [position, setPosition] = useState({ x: 100, y: 150 });
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    // Stage 1: Move to invoice total
    setPosition({ x: 80, y: 100 });

    const t1 = setTimeout(() => {
      // Stage 2: Glide to cost center dropdown
      setPosition({ x: 260, y: 280 });
    }, 700);

    const t2 = setTimeout(() => {
      // Stage 3: Click
      setIsClicking(true);
    }, 1800);

    const t3 = setTimeout(() => {
      setIsClicking(false);
      onComplete?.();
    }, 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div
      className="absolute pointer-events-none z-50 transition-all duration-700 ease-out"
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
      }}
    >
      <div className="relative">
        <MousePointer2
          className={`w-6 h-6 text-amber-400 fill-amber-500 filter drop-shadow-md transition-transform ${
            isClicking ? 'scale-75' : 'scale-100'
          }`}
        />
        <span className="absolute -top-6 left-5 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold font-mono shadow-md whitespace-nowrap animate-pulse">
          Sabine&rsquo;s Cursor
        </span>
        {isClicking && (
          <span className="absolute -top-1 -left-1 w-8 h-8 rounded-full bg-amber-400/40 animate-ping" />
        )}
      </div>
    </div>
  );
};
