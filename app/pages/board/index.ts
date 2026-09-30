import { Request, Response, ForbiddenError } from "@elements/app";
import { staffOrRedirect } from "#app/shared/services/auth";
import { getJob } from "#app/shared/services/jobs";
import { applications } from "#app/shared/services/applications";
import html from "./template";

export default function route(req: Request, res: Response) {
  let user = staffOrRedirect();

  if (!user) {
    return;
  }

  if (user.role !== "admin") {
    throw new ForbiddenError("Only admins can see the pipeline board.");
  }

  let job = getJob(req.params.id);

  return new html({ user, job, cards: applications.view({ jobId: job.id }) });
}
