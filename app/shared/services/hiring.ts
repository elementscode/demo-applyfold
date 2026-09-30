export const COMPANY = "Wrenbolt";

export type Stage = "applied" | "screen" | "interview" | "offer" | "hired" | "rejected";

export type Recommendation = "strong_no" | "no" | "yes" | "strong_yes";

export type Criterion = "skills" | "communication" | "ownership";

export interface StageInfo {
  id: Stage;
  label: string;
  intent: string;
}

export const STAGES: StageInfo[] = [
  { id: "applied", label: "Applied", intent: "" },
  { id: "screen", label: "Screen", intent: "is-info" },
  { id: "interview", label: "Interview", intent: "is-accent" },
  { id: "offer", label: "Offer", intent: "is-warning" },
  { id: "hired", label: "Hired", intent: "is-success" },
  { id: "rejected", label: "Rejected", intent: "is-danger" },
];

export const CRITERIA: { id: Criterion; label: string; hint: string }[] = [
  { id: "skills", label: "Skills", hint: "Depth in the craft the role needs" },
  { id: "communication", label: "Communication", hint: "Clear, structured, listens well" },
  { id: "ownership", label: "Ownership", hint: "Drives outcomes without being chased" },
];

export const RECOMMENDATIONS: { id: Recommendation; label: string; intent: string }[] = [
  { id: "strong_no", label: "Strong no", intent: "is-danger" },
  { id: "no", label: "No", intent: "is-warning" },
  { id: "yes", label: "Yes", intent: "is-info" },
  { id: "strong_yes", label: "Strong yes", intent: "is-success" },
];

export function stageInfo(id: string): StageInfo {
  return STAGES.find((s) => s.id === id) ?? STAGES[0];
}

export function recommendationInfo(id: string) {
  return RECOMMENDATIONS.find((r) => r.id === id) ?? RECOMMENDATIONS[0];
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export function shortDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function daysAgo(d: Date): string {
  let days = Math.floor((Date.now() - +new Date(d)) / 86400000);

  if (days <= 0) {
    return "today";
  }

  if (days === 1) {
    return "yesterday";
  }

  return `${days}d ago`;
}
