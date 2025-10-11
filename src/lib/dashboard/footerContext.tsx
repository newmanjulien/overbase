"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface FooterContextValue {
  hideFooter: boolean;
  setHideFooter: (hide: boolean) => void;
}

const FooterContext = createContext<FooterContextValue | undefined>(undefined);

export const useFooterContext = () => {
  const ctx = useContext(FooterContext);
  if (!ctx)
    throw new Error("useFooterContext must be used within FooterProvider");
  return ctx;
};

export const FooterProvider = ({ children }: { children: ReactNode }) => {
  const [hideFooter, setHideFooter] = useState(false);

  return (
    <FooterContext.Provider value={{ hideFooter, setHideFooter }}>
      {children}
    </FooterContext.Provider>
  );
};
