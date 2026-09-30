import { Request, Response } from "@elements/app";
import { marked } from "marked";
import { getJob } from "#app/shared/services/jobs";
import html from "./template";

export default function route(req: Request, res: Response) {
  let job = getJob(req.params.id);
  let description = marked.parse(job.description) as string;

  return new html({ job, description });
}
