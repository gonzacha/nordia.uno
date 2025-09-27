"use client";

interface BrandTheme {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  colors?: {
    primary: string;
    accent: string;
  };
}

export async function loadBrand(): Promise<BrandTheme> {
  const params = new URLSearchParams(window.location.search);
  const tenant = params.get("tenant") ?? "default";
  try {
    const res = await fetch(`/themes/${tenant}.json`);
    if (!res.ok) throw new Error("Missing theme");
    const theme = (await res.json()) as BrandTheme;
    applyColors(theme.colors);
    return theme;
  } catch (error) {
    const fallback = await fetch("/themes/default.json").then((res) => res.json());
    applyColors(fallback.colors);
    return fallback;
  }
}

function applyColors(colors?: { primary?: string; accent?: string }) {
  if (!colors) return;
  if (colors.primary) document.documentElement.style.setProperty("--brand-primary", colors.primary);
  if (colors.accent) document.documentElement.style.setProperty("--brand-accent", colors.accent);
}
