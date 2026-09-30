import { Request, Response } from "@elements/app";
import { listOpenJobs, groupByTeam } from "#app/shared/services/jobs";
import html from "./template";

export default function route(req: Request, res: Response) {
  let jobs = listOpenJobs();

  return new html({ teams: groupByTeam(jobs), count: jobs.length });
}
