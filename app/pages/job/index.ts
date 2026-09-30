import { Request, Response } from "@elements/app";
import { getOpenJob } from "#app/shared/services/jobs";
import { renderMarkdown } from "#app/shared/services/markdown";
import html from "./template";

export default function route(req: Request, res: Response) {
  let job = getOpenJob(req.params.id);

  return new html({ job, descriptionHtml: renderMarkdown(job.description) });
}
