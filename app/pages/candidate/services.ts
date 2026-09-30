import { sql, ValidationError } from "@elements/app";
import { adminOrThrow, applicationAccessOrThrow } from "#app/shared/services/auth";
import { CRITERIA, RECOMMENDATIONS, Recommendation } from "#app/shared/services/hiring";

export interface Candidate {
  id: string;
  jobId: string;
  jobTitle: string;
  question: string;
  name: string;
  email: string;
  phone: string;
  answer: string;
  resumeName: string;
  resumeSize: number;
  stage: string;
  createdAt: Date;
  rejectionSentAt: Date | null;
}

export interface Note {
  id: string;
  body: string;
  authorName: string;
  createdAt: Date;
}

export interface Scorecard {
  id: string;
  interviewerId: string;
  interviewerName: string;
  skills: number;
  communication: number;
  ownership: number;
  recommendation: Recommendation;
  comments: string;
  updatedAt: Date;
}

export interface Person {
  id: string;
  name: string;
}

export interface ScorecardForm {
  applicationId: string;
  skills: number;
  communication: number;
  ownership: number;
  recommendation: Recommendation | "";
  comments: string;
}

export function getCandidate(id: string): Candidate {
  return sql<Candidate>(`
    select a.id, a.jobId, j.title as jobTitle, j.question, a.name, a.email, a.phone, a.answer,
           a.resumeName, a.resumeSize, a.stage::text as stage, a.createdAt, a.rejectionSentAt
      from applications a
      join jobs j on j.id = a.jobId
     where a.id = ${id}
  `).firstOrThrow("candidate not found");
}

export function listNotes(applicationId: string): Note[] {
  return sql<Note>(`
    select n.id, n.body, u.name as authorName, n.createdAt
      from notes n
      join users u on u.id = n.authorId
     where n.applicationId = ${applicationId}
     order by n.createdAt desc
  `).all();
}

export function listScorecards(applicationId: string): Scorecard[] {
  return sql<Scorecard>(`
    select s.id, s.interviewerId, u.name as interviewerName, s.skills, s.communication, s.ownership,
           s.recommendation::text as recommendation, s.comments, s.updatedAt
      from scorecards s
      join users u on u.id = s.interviewerId
     where s.applicationId = ${applicationId}
     order by s.updatedAt
  `).all();
}

export function listAssignees(applicationId: string): Person[] {
  return sql<Person>(`
    select u.id, u.name
      from assignments x
      join users u on u.id = x.userId
     where x.applicationId = ${applicationId}
     order by u.name
  `).all();
}

export function listInterviewers(): Person[] {
  return sql<Person>(`select id, name from users order by role, name`).all();
}

/** @rpc */
export function addNote(applicationId: string, body: string): Note[] {
  let user = applicationAccessOrThrow(applicationId);
  let text = body.trim();

  if (!text) {
    throw new ValidationError("Write a note first.");
  }

  sql(`insert into notes (applicationId, authorId, body) values (${applicationId}, ${user.id}, ${text})`);

  return listNotes(applicationId);
}

/** @rpc */
export function saveScorecard(form: ScorecardForm): Scorecard[] {
  let user = applicationAccessOrThrow(form.applicationId);

  for (let c of CRITERIA) {
    let score = form[c.id];

    if (!Number.isInteger(score) || score < 1 || score > 4) {
      throw new ValidationError(`Rate ${c.label.toLowerCase()} from 1 to 4.`);
    }
  }

  if (!RECOMMENDATIONS.some((r) => r.id === form.recommendation)) {
    throw new ValidationError("Choose a recommendation.");
  }

  sql(`
    insert into scorecards (applicationId, interviewerId, skills, communication, ownership, recommendation, comments)
         values (${form.applicationId}, ${user.id}, ${form.skills}, ${form.communication}, ${form.ownership},
                 ${form.recommendation}, ${form.comments.trim()})
    on conflict (applicationId, interviewerId) do update
       set skills = excluded.skills,
           communication = excluded.communication,
           ownership = excluded.ownership,
           recommendation = excluded.recommendation,
           comments = excluded.comments
  `);

  return listScorecards(form.applicationId);
}

/** @rpc */
export function assign(applicationId: string, userId: string): Person[] {
  adminOrThrow();

  if (!userId) {
    throw new ValidationError("Choose someone to assign.");
  }

  sql(`
    insert into assignments (applicationId, userId) values (${applicationId}, ${userId})
    on conflict (applicationId, userId) do nothing
  `);

  return listAssignees(applicationId);
}

/** @rpc */
export function unassign(applicationId: string, userId: string): Person[] {
  adminOrThrow();

  sql(`delete from assignments where applicationId = ${applicationId} and userId = ${userId}`);

  return listAssignees(applicationId);
}
