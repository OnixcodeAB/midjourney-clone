"use client";
import React, { createContext, useContext, useState } from "react";

const PromptContext = createContext<{
  prompt: string;
  setPrompt: (text: string) => void;
}>({
  prompt: "",
  setPrompt: () => {},
});

export const usePrompt = () => useContext(PromptContext);

export function PromptProvider({ children }: { children: React.ReactNode }) {
  const [prompt, setPrompt] = useState("");

  return (
    <PromptContext.Provider value={{ prompt, setPrompt }}>
      {children}
    </PromptContext.Provider>
  );
}
