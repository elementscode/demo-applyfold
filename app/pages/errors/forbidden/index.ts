import { Request, Response } from "@elements/app";
import html from "./template";

export default function route(req: Request, res: Response, err: any) {
  res.status(403);

  return new html({ message: err?.message || "You do not have access to this page." });
}
