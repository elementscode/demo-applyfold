import { Request, Response } from "@elements/app";
import { requireAdmin } from "#app/shared/services/auth";
import { loadJobForm, emptyJobForm } from "./services";
import html from "./template";

export default function route(req: Request, res: Response) {
  let user = requireAdmin();
  let initial = req.params.id ? loadJobForm(req.params.id) : emptyJobForm();

  return new html({ user, initial });
}
