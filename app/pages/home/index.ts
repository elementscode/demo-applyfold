import { Request, Response } from "@elements/app";
import { listOpenJobs } from "#app/shared/services/jobs";
import { summarize } from "#app/shared/services/markdown";
import html, { JobCard } from "./template";

export default function route(req: Request, res: Response) {
  let jobs: JobCard[] = listOpenJobs().map((j) => ({
    id: j.id,
    title: j.title,
    team: j.team,
    location: j.location,
    summary: summarize(j.description),
  }));

  return new html({ jobs });
}
