import { IS_DEMO } from "./supabase";

/**
 * FitHub Security & Access Control Configuration
 * Allowed emails list can be specified in environment (VITE_ALLOWED_EMAILS)
 * as comma-separated values, or added to DEFAULT_ALLOWED_EMAILS.
 */

const envEmails = import.meta.env.VITE_ALLOWED_EMAILS
  ? (import.meta.env.VITE_ALLOWED_EMAILS as string)
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  : [];

export const DEFAULT_ALLOWED_EMAILS: string[] = [
  "admin@example.com",
  "demo@isafithub.dev",
];

export const ALLOWED_EMAILS = Array.from(
  new Set([...envEmails, ...DEFAULT_ALLOWED_EMAILS])
);

export function isEmailAllowed(email?: string | null): boolean {
  // Showcase build: authentication is disabled and the demo user is always allowed.
  if (IS_DEMO) return true;
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  
  // If env emails are configured, prioritize strict match against env emails
  if (envEmails.length > 0) {
    return envEmails.includes(normalized);
  }
  
  // Otherwise match allowed list
  return ALLOWED_EMAILS.includes(normalized);
}
