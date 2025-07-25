"use client";

import { useEffect, useState } from "react";

/**
 * DynamicAspectImage component that adjusts the aspect ratio of an image
 * based on its natural dimensions.
 */

interface Props {
  src: string;
  alt: string;
  className?: string;
}

interface GcdFunction {
  (a: number, b: number): number;
}

export function DynamicAspectImage({ src, alt, className }: Props) {
  const [aspectClass, setAspectClass] = useState("aspect-square");

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const ratioW = img.naturalWidth;
      const ratioH = img.naturalHeight;

      // Reduce to a smaller fraction (e.g., 1920x1280 → 3/2)

      const gcd: GcdFunction = (a, b) => (b === 0 ? a : gcd(b, a % b));
      const divisor = gcd(ratioW, ratioH);
      const w = Math.round(ratioW / divisor);
      const h = Math.round(ratioH / divisor);

      setAspectClass(`aspect-[${w}/${h}]`);
    };
  }, [src]);

  return (
    <div
      className={`w-2xs ${aspectClass} bg-gray-200  overflow-hidden ${className}`}
    >
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </div>
  );
}
