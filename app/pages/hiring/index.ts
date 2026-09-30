import { Request, Response, sql } from "@elements/app";
import { requireUser } from "#app/shared/services/auth";
import html, { JobSummary, AssignedCandidate } from "./template";

export default function route(req: Request, res: Response) {
  let user = requireUser();

  if (user.role === "admin") {
    let jobs = sql<JobSummary>(`
      select j.id, j.title, j.team, j.location, j.status,
             count(a.id)::int as total,
             (count(a.id) filter (where a.stage = 'applied'))::int as applied,
             (count(a.id) filter (where a.stage = 'screen'))::int as screen,
             (count(a.id) filter (where a.stage = 'interview'))::int as interview,
             (count(a.id) filter (where a.stage = 'offer'))::int as offer,
             (count(a.id) filter (where a.stage = 'hired'))::int as hired
        from jobs j
        left join applications a on a.jobId = j.id
       group by j.id
       order by j.status, j.createdAt
    `).all();

    return new html({ user, jobs, assigned: [] });
  }

  let assigned = sql<AssignedCandidate>(`
    select a.id, a.name, a.stage, j.title as jobTitle, a.createdAt,
           exists (select 1 from scorecards s where s.applicationId = a.id and s.interviewerId = ${user.id}) as scored
      from assignments x
      join applications a on a.id = x.applicationId
      join jobs j on j.id = a.jobId
     where x.userId = ${user.id}
     order by scored, a.movedAt desc
  `).all();

  return new html({ user, jobs: [], assigned });
}
