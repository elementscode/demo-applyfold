import { sql, redirect, FieldErrors, ValidationError } from "@elements/app";
import { adminOrThrow } from "#app/shared/services/auth";

export interface JobForm {
  id: string;
  title: string;
  team: string;
  location: string;
  status: "open" | "closed";
  question: string;
  description: string;
}

export const TEAMS = ["Engineering", "Design", "Product", "Customer Success", "Sales", "Marketing", "Operations", "People"];

export function loadJobForm(id: string): JobForm {
  return sql<JobForm>(`
    select id, title, team, location, status::text as status, question, description
      from jobs where id = ${id}
  `).firstOrThrow("job not found");
}

export function emptyJobForm(): JobForm {
  return {
    id: "",
    title: "",
    team: "Engineering",
    location: "",
    status: "open",
    question: "Tell us about something you built or shipped that you are proud of.",
    description: "## What you will do\n\n- \n\n## What we are looking for\n\n- \n\n## What we offer\n\n- ",
  };
}

/** @rpc */
export function saveJob(form: JobForm) {
  adminOrThrow();

  let errors: FieldErrors<JobForm> = {};
  let title = form.title.trim();
  let team = form.team.trim();
  let location = form.location.trim();
  let question = form.question.trim();

  if (!title) {
    errors.title = ["Give the role a title."];
  }

  if (!team) {
    errors.team = ["Choose a team."];
  }

  if (!location) {
    errors.location = ["Where is this role based?"];
  }

  if (!question) {
    errors.question = ["Applicants answer this question, so it cannot be empty."];
  }

  if (form.status !== "open" && form.status !== "closed") {
    errors.status = ["Choose open or closed."];
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }

  let id = form.id;

  if (id) {
    sql(`
      update jobs
         set title = ${title}, team = ${team}, location = ${location},
             status = ${form.status}, question = ${question}, description = ${form.description}
       where id = ${id}
    `);
  } else {
    id = sql<{ id: string }>(`
      insert into jobs (title, team, location, status, question, description)
           values (${title}, ${team}, ${location}, ${form.status}, ${question}, ${form.description})
      returning id
    `).firstOrThrow().id;
  }

  redirect(`/hiring/jobs/${id}`);
}
