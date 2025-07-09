// components/RatioBox.tsx
import React from "react";

type RatioBoxProps = {
  ratio: string | null | undefined; // e.g. "1536x1024"
  isActive: boolean;
};

export function RatioBox({ ratio, isActive }: RatioBoxProps) {
  // Extraemos ancho y alto numéricos
  const [width, height] = (ratio ?? "").split("x").map(Number);

  return (
    <div
      className="relative"
      // Fijamos un ancho (6rem en este ejemplo) y la altura se ajusta vía aspect-ratio
      style={{ width: "5rem", aspectRatio: `${width} / ${height}` }}
    >
      {/* Contorno punteado */}
      <div
        className={`
          absolute inset-0
          border-2 border-dashed rounded-md
          transition-colors
          ${
            isActive
              ? "border-red-500 dark:border-red-400"
              : "border-gray-300 dark:border-gray-600"
          }
        `}
      />

      {/* Etiqueta centrada */}
      <div
        className={`
          absolute inset-0 flex items-center justify-center
          text-sm font-medium
          transition-colors
          ${
            isActive
              ? "text-red-600 dark:text-red-300"
              : "text-gray-700 dark:text-gray-300"
          }
        `}
      >
        {ratio}
      </div>
    </div>
  );
}
