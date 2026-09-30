import { Marked } from "marked";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// marked passes raw HTML in the source straight through. Job descriptions are
// shown to the public, so any HTML an author types is rendered as text.
const marked = new Marked({
  gfm: true,
  renderer: {
    html(token) {
      return escapeHtml(token.text);
    },
  },
});

export function renderMarkdown(source: string): string {
  return marked.parse(source, { async: false }) as string;
}

/** The first paragraph as plain text, for a job card's summary line. */
export function summarize(source: string, max: number = 180): string {
  let para = source
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .find((p) => p && !p.startsWith("#") && !p.startsWith("-")) ?? "";
  let text = para.replace(/[*_`#>\[\]]/g, "").replace(/\s+/g, " ");

  return text.length > max ? text.slice(0, max - 1).trimEnd() + "…" : text;
}
