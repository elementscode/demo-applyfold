import { sql, email, ValidationError, NotFoundError } from "@elements/app";
import { adminOrThrow } from "#app/shared/services/auth";
import { STAGES, Stage } from "#app/shared/services/hiring";
import RejectionEmail from "#app/emails/rejection";

export function isStage(stage: string): stage is Stage {
  return STAGES.some((s) => s.id === stage);
}

/** @rpc */
export function setStage(applicationId: string, stage: Stage) {
  adminOrThrow();

  if (!isStage(stage)) {
    throw new ValidationError("Unknown stage.");
  }

  sql(`
    update applications
       set stage = ${stage}, movedAt = now()
     where id = ${applicationId} and stage <> ${stage}
  `);
}

/** @rpc */
export function sendRejection(applicationId: string): Date {
  adminOrThrow();

  let app = sql<{ name: string; email: string; stage: string; jobTitle: string }>(`
    select a.name, a.email, a.stage, j.title as jobTitle
      from applications a
      join jobs j on j.id = a.jobId
     where a.id = ${applicationId}
  `).first();

  if (!app) {
    throw new NotFoundError("Candidate not found.");
  }

  if (app.stage !== "rejected") {
    throw new ValidationError("Move the candidate to rejected before sending a rejection.");
  }

  email({
    to: app.email,
    subject: `Your application for ${app.jobTitle}`,
    body: new RejectionEmail({ name: app.name, jobTitle: app.jobTitle }),
  });

  return sql<{ rejectionSentAt: Date }>(`
    update applications set rejectionSentAt = now() where id = ${applicationId}
    returning rejectionSentAt
  `).firstOrThrow().rejectionSentAt;
}
