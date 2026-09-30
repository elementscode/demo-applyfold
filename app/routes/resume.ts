import { Request, Response, sql } from "@elements/app";
import { applicationAccessOrThrow } from "#app/shared/services/auth";

interface Resume {
  resumeName: string;
  resumeData: Buffer;
}

export default function serveResume(req: Request, res: Response) {
  applicationAccessOrThrow(req.params.id);

  let resume = sql<Resume>(`
    select resumeName, resumeData from applications where id = ${req.params.id}
  `).firstOrThrow("resume not found");

  // The apply rpc only stores files that start with the PDF signature, so
  // this type is a fact about the bytes rather than what the uploader said.
  let filename = resume.resumeName.replace(/[^\w.\- ]/g, "_");
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
  res.setHeader("Cache-Control", "private, max-age=0, must-revalidate");

  return resume.resumeData;
}
