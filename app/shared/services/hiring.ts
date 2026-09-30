export const STAGES = ["applied", "screen", "interview", "offer", "hired", "rejected"] as const;

export type Stage = typeof STAGES[number];

export const STAGE_LABELS: Record<Stage, string> = {
  applied: "Applied",
  screen: "Screen",
  interview: "Interview",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected",
};

export const CRITERIA = [
  { key: "craft", label: "Craft", hint: "Depth of skill in the core work of the role" },
  { key: "communication", label: "Communication", hint: "Clear, honest, and easy to work through problems with" },
  { key: "ownership", label: "Ownership", hint: "Takes responsibility and follows through without being chased" },
] as const;

export type Criterion = typeof CRITERIA[number]["key"];

export const RECOMMENDATIONS = ["strong_no", "no", "yes", "strong_yes"] as const;

export type Recommendation = typeof RECOMMENDATIONS[number];

export const RECOMMENDATION_LABELS: Record<Recommendation, string> = {
  strong_no: "Strong no",
  no: "No",
  yes: "Yes",
  strong_yes: "Strong yes",
};

export const SCORE_LABELS = ["", "Poor", "Mixed", "Good", "Excellent"];

export function formatScore(score: number | null): string {
  return score === null ? "" : score.toFixed(1);
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export function timeAgo(date: Date, now: Date = new Date()): string {
  let seconds = Math.max(0, Math.round((+now - +date) / 1000));

  if (seconds < 60) {
    return "just now";
  }

  let minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  let hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  let days = Math.round(hours / 24);
  if (days < 30) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export const APPLICATION_QUESTION = "What's something you built or improved that you're proud of, and why?";
