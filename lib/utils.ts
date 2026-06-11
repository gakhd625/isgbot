import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (vercelHost ? `https://${vercelHost}` : "https://isgbot.vercel.app");
  return `${base.replace(/\/$/, "")}${path}`;
}

export function sanitizeText(value: string) {
  return value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
}
