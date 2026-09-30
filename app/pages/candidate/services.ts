import { LiveTable, sql, session, ValidationError, ForbiddenError, NotFoundError } from "@elements/app";
import { requireAdmin, requireCandidateAccess, StaffUser } from "#app/shared/services/auth";
import { CRITERIA, RECOMMENDATIONS, Recommendation, Stage } from "#app/shared/services/hiring";

export interface CandidateDetail {
  id: string;
  jobId: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  answer: string;
  stage: Stage;
  createdAt: Date;
  stageChangedAt: Date;
  rejectionSentAt: Date | null;
  resumeName: string | null;
  resumeSize: number | null;
}

export interface Scorecard {
  id: string;
  interviewerId: string;
  interviewerName: string;
  interviewerTitle: string;
  craft: number;
  communication: number;
  ownership: number;
  recommendation: Recommendation;
  summary: string;
  updatedAt: Date;
}

export interface ScorecardInput {
  craft: number;
  communication: number;
  ownership: number;
  recommendation: Recommendation | "";
  summary: string;
}

export interface Interviewer {
  id: string;
  name: string;
  title: string;
  assigned: boolean;
}

/**
 * What one viewer may see of the scorecards. An interviewer who has not
 * submitted their own sees only how many others exist, so earlier opinions do
 * not anchor theirs.
 */
export interface ScorecardView {
  mine: Scorecard | null;
  others: Scorecard[];
  hiddenCount: number;
}

export interface Note {
  id: string;
  applicationId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: Date;
}

export function loadCandidate(id: string): CandidateDetail {
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    throw new NotFoundError("candidate not found");
  }

  return sql<CandidateDetail>(`
    select a.id, a.jobId, j.title as jobTitle, a.name, a.email, a.phone, a.answer,
           a.stage, a.createdAt, a.stageChangedAt, a.rejectionSentAt,
           r.name as resumeName, r.size as resumeSize
      from applications a
      join jobs j on j.id = a.jobId
      left join resumes r on r.applicationId = a.id
     where a.id = ${id}
  `).firstOrThrow("candidate not found");
}

function allScorecards(applicationId: string): Scorecard[] {
  return sql<Scorecard>(`
    select s.id, s.interviewerId, u.name as interviewerName, u.title as interviewerTitle,
           s.craft, s.communication, s.ownership, s.recommendation, s.summary, s.updatedAt
      from scorecards s
      join users u on u.id = s.interviewerId
     where s.applicationId = ${applicationId}
     order by s.createdAt
  `).all();
}

export function scorecardsFor(applicationId: string, viewer: StaffUser): ScorecardView {
  let cards = allScorecards(applicationId);
  let mine = cards.find((c) => c.interviewerId === viewer.id) ?? null;
  let others = cards.filter((c) => c.interviewerId !== viewer.id);

  if (viewer.role !== "admin" && !mine) {
    return { mine, others: [], hiddenCount: others.length };
  }

  return { mine, others, hiddenCount: 0 };
}

export function interviewersFor(applicationId: string): Interviewer[] {
  return sql<Interviewer>(`
    select u.id, u.name, u.title, x.userId is not null as assigned
      from users u
      left join assignments x on x.userId = u.id and x.applicationId = ${applicationId}
     where u.role = 'interviewer'
     order by u.name
  `).all();
}

export function validateScorecard(input: ScorecardInput) {
  let errors: Record<string, string[]> = {};

  for (let c of CRITERIA) {
    let v = input[c.key];

    if (!Number.isInteger(v) || v < 1 || v > 4) {
      errors[c.key] = [`Score ${c.label.toLowerCase()} from 1 to 4.`];
    }
  }

  if (!RECOMMENDATIONS.includes(input.recommendation as Recommendation)) {
    errors.recommendation = ["Choose a recommendation."];
  }

  if (input.summary.length > 4000) {
    errors.summary = ["Keep the summary under 4,000 characters."];
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }
}

/** @rpc */
export function saveScorecard(applicationId: string, input: ScorecardInput): ScorecardView {
  let user = requireCandidateAccess(applicationId);

  validateScorecard(input);

  sql(`
    insert into scorecards (applicationId, interviewerId, craft, communication, ownership, recommendation, summary)
         values (${applicationId}, ${user.id}, ${input.craft}, ${input.communication}, ${input.ownership}, ${input.recommendation}, ${input.summary.trim()})
    on conflict (applicationId, interviewerId) do update
       set craft = excluded.craft,
           communication = excluded.communication,
           ownership = excluded.ownership,
           recommendation = excluded.recommendation,
           summary = excluded.summary
  `);

  return scorecardsFor(applicationId, user);
}

/** @rpc */
export function setAssigned(applicationId: string, interviewerId: string, assigned: boolean): Interviewer[] {
  requireAdmin();

  if (assigned) {
    sql(`
      insert into assignments (applicationId, userId)
           select ${applicationId}, id from users where id = ${interviewerId} and role = 'interviewer'
      on conflict do nothing
    `);
  } else {
    sql(`delete from assignments where applicationId = ${applicationId} and userId = ${interviewerId}`);
  }

  return interviewersFor(applicationId);
}

export let notes: LiveTable<Note> = new LiveTable<Note>({
  select: ({ applicationId }) => sql<Note>(`
    select id, applicationId, authorId, authorName, body, createdAt
      from notes
     where applicationId = ${applicationId}
  `),

  insert: (item) => {
    let user = requireCandidateAccess(item.applicationId!);
    let body = (item.body ?? "").trim();

    if (!body) {
      throw new ValidationError("Write something first.");
    }

    return sql<Note>(`
      insert into notes (id, applicationId, authorId, authorName, body)
           values (${item.id}, ${item.applicationId}, ${user.id}, ${user.name}, ${body})
      returning id, applicationId, authorId, authorName, body, createdAt
    `).firstOrThrow();
  },

  update: () => {
    throw new ForbiddenError("Notes can't be edited.");
  },

  delete: (item) => {
    requireCandidateAccess(item.applicationId);

    if (item.authorId !== session.getOrThrow("userId")) {
      throw new ForbiddenError("You can only delete your own notes.");
    }

    sql(`delete from notes where id = ${item.id} and authorId = ${item.authorId}`);
  },
});
