"use client";

import { createContext, useContext, useState } from "react";

export type AspectType = "square" | "portrait" | "landscape";
export type AspectRatio = "1024x1024" | "1024x1536" | "1536x1024";

interface HeaderContextType {
  aspect: AspectType;
  setAspect: (aspect: AspectType) => void;
  size: number;
  setSize: (size: number) => void;
  ratio: AspectRatio;
  setRatio: (ratio: AspectRatio) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: React.ReactNode }) {
  const [aspect, setAspect] = useState<AspectType>("landscape");
  const [size, setSize] = useState<number>(80);
  const [ratio, setRatio] = useState<AspectRatio>("1024x1024");

  return (
    <HeaderContext.Provider
      value={{ aspect, setAspect, size, setSize, ratio, setRatio }}
    >
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeaderSettings() {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error("useHeaderSettings must be used within a HeaderProvider");
  }
  return context;
}
