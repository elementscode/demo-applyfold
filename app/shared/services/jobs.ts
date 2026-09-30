import { sql, ValidationError, NotFoundError } from "@elements/app";
import { requireAdmin } from "#app/shared/services/auth";

export interface Job {
  id: string;
  title: string;
  team: string;
  location: string;
  description: string;
  status: "open" | "closed";
  createdAt: Date;
}

export interface JobInput {
  title: string;
  team: string;
  location: string;
  description: string;
  status: "open" | "closed";
}

export function listOpenJobs(): Job[] {
  return sql<Job>(`
    select id, title, team, location, description, status, createdAt
      from jobs
     where status = 'open'
     order by team, title
  `).all();
}

export function listAllJobs(): Job[] {
  return sql<Job>(`
    select id, title, team, location, description, status, createdAt
      from jobs
     order by status desc, createdAt desc
  `).all();
}

export function getJob(id: string): Job {
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    throw new NotFoundError("job not found");
  }

  return sql<Job>(`
    select id, title, team, location, description, status, createdAt
      from jobs
     where id = ${id}
  `).firstOrThrow("job not found");
}

export function getOpenJob(id: string): Job {
  let job = getJob(id);

  if (job.status !== "open") {
    throw new NotFoundError("This role is no longer open.");
  }

  return job;
}

function validateJob(input: JobInput) {
  let errors: Record<string, string[]> = {};

  if (!input.title.trim()) {
    errors.title = ["Give the job a title."];
  }

  if (!input.team.trim()) {
    errors.team = ["Which team is hiring?"];
  }

  if (!input.location.trim()) {
    errors.location = ["Where is the role based?"];
  }

  if (input.status !== "open" && input.status !== "closed") {
    errors.status = ["Choose open or closed."];
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }
}

/** @rpc */
export function saveJob(id: string | null, input: JobInput): Job {
  requireAdmin();
  validateJob(input);

  let title = input.title.trim();
  let team = input.team.trim();
  let location = input.location.trim();

  if (id) {
    return sql<Job>(`
      update jobs
         set title = ${title},
             team = ${team},
             location = ${location},
             description = ${input.description},
             status = ${input.status}
       where id = ${id}
      returning id, title, team, location, description, status, createdAt
    `).firstOrThrow("job not found");
  }

  return sql<Job>(`
    insert into jobs (title, team, location, description, status)
         values (${title}, ${team}, ${location}, ${input.description}, ${input.status})
    returning id, title, team, location, description, status, createdAt
  `).firstOrThrow();
}
