import { Request, Response, sql } from "@elements/app";
import { staffOrRedirect } from "#app/shared/services/auth";
import { listAllJobs } from "#app/shared/services/jobs";
import { applications } from "#app/shared/services/applications";
import html, { AssignedCandidate } from "./template";

export default function route(req: Request, res: Response) {
  let user = staffOrRedirect();

  if (!user) {
    return;
  }

  if (user.role === "admin") {
    return new html({ user, jobs: listAllJobs(), apps: applications.view(), assigned: [] });
  }

  let assigned = sql<AssignedCandidate>(`
    select a.id, a.name, a.stage, a.createdAt, j.title as jobTitle,
           s.id is not null as scored
      from assignments x
      join applications a on a.id = x.applicationId
      join jobs j on j.id = a.jobId
      left join scorecards s on s.applicationId = a.id and s.interviewerId = ${user.id}
     where x.userId = ${user.id}
     order by (s.id is not null), a.stageChangedAt desc
  `).all();

  return new html({ user, jobs: [], assigned });
}
