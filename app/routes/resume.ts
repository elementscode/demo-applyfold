import { Request, Response, sql } from "@elements/app";
import { requireCandidateAccess } from "#app/shared/services/auth";

interface ResumeFile {
  name: string;
  data: Buffer;
}

export default function serveResume(req: Request, res: Response) {
  requireCandidateAccess(req.params.id);

  let resume = sql<ResumeFile>(`
    select name, data from resumes where applicationId = ${req.params.id}
  `).firstOrThrow("resume not found");

  // Only PDFs are accepted on upload, and this is the one type served inline.
  // The filename is the uploader's, so it is reduced to safe characters.
  let filename = resume.name.replace(/[^\w.\- ]+/g, "_");
  let disposition = req.params.download ? "attachment" : "inline";

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `${disposition}; filename="${filename}"`);
  res.setHeader("Cache-Control", "private, no-store");

  return resume.data;
}
