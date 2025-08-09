"use client";
import React, { createContext, useContext, useState } from "react";

type PromptContextType = {
  // Text prompt
  prompt: string;
  setPrompt: (text: string) => void;
  // Edit mode inputs
  baseImageUrl?: string;
  setBaseImageUrl: (url?: string) => void;
  maskUrl?: string;
  setMaskUrl: (url?: string) => void;

  // Helpers
  clearEditing: () => void; // clears baseImageUrl + maskUrl
  clearAll: () => void; // clears prompt + editing fields
};

const PromptContext = createContext<PromptContextType | undefined>(undefined);

export const usePrompt = () => {
  const ctx = useContext(PromptContext);
  if (!ctx) {
    throw new Error("usePrompt must be used within a PromptProvider");
  }
  return ctx;
};

export function PromptProvider({ children }: { children: React.ReactNode }) {
  const [prompt, setPrompt] = useState<string>("");
  const [baseImageUrl, setBaseImageUrl] = useState<string | undefined>();
  const [maskUrl, setMaskUrl] = useState<string | undefined>();

  const clearEditing = () => {
    setBaseImageUrl(undefined);
    setMaskUrl(undefined);
  };

  const clearAll = () => {
    setPrompt("");
    clearEditing();
  };

  const value: PromptContextType = {
    prompt,
    setPrompt,
    baseImageUrl,
    setBaseImageUrl,
    maskUrl,
    setMaskUrl,
    clearEditing,
    clearAll,
  };

  return (
    <PromptContext.Provider value={value}>{children}</PromptContext.Provider>
  );
}
