import { Request, Response, redirect, session, sql } from "@elements/app";
import html, { DemoLogin } from "./template";

export default function route(req: Request, res: Response) {
  if (session.isLoggedIn()) {
    redirect("/hiring");
    return;
  }

  // The seeded accounts use a reserved .test domain, so this list is empty
  // anywhere the development seed has not run.
  let demoLogins = sql<DemoLogin>(`
    select name, email, title, role from users
     where email like '%@applyfold.test'
     order by role, name
  `).all();

  return new html({ demoLogins });
}
