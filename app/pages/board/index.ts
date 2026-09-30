import { Request, Response } from "@elements/app";
import { requireAdmin } from "#app/shared/services/auth";
import { getJob } from "#app/shared/services/jobs";
import html, { applications } from "./template";

export default function route(req: Request, res: Response) {
  let user = requireAdmin();
  let job = getJob(req.params.id);

  return new html({ user, job, cards: applications.view({ jobId: job.id }) });
}
