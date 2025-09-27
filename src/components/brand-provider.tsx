"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { loadBrand } from "../lib/theme";

interface BrandContextValue {
  name: string;
  tagline: string;
  logo: string;
}

const defaultBrand: BrandContextValue = {
  name: "Nordia ISP Suite",
  tagline: "Automatización white-label para ISPs visionarios",
  logo: "/themes/default-logo.svg",
};

const BrandContext = createContext<BrandContextValue>(defaultBrand);

export const BrandProvider = ({ children }: { children: React.ReactNode }) => {
  const [value, setValue] = useState(defaultBrand);

  useEffect(() => {
    loadBrand().then(setValue).catch(() => setValue(defaultBrand));
  }, []);

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
};

export const useBrand = () => useContext(BrandContext);
