import { Request, Response } from "@elements/app";
import { staffOrRedirect, requireAdmin } from "#app/shared/services/auth";
import { getJob, JobInput } from "#app/shared/services/jobs";
import html from "./template";

const BLANK: JobInput = {
  title: "",
  team: "",
  location: "",
  status: "open",
  description: "## What you'll do\n\n- \n\n## What we're looking for\n\n- \n",
};

export default function route(req: Request, res: Response) {
  if (!staffOrRedirect()) {
    return;
  }

  let user = requireAdmin();

  if (!req.params.id) {
    return new html({ user, jobId: null, job: { ...BLANK } });
  }

  let job = getJob(req.params.id);

  return new html({
    user,
    jobId: job.id,
    job: {
      title: job.title,
      team: job.team,
      location: job.location,
      status: job.status,
      description: job.description.trim(),
    },
  });
}
