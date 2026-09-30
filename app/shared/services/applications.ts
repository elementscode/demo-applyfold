import {
  LiveTable,
  sql,
  tx,
  email,
  File,
  ValidationError,
  ForbiddenError,
  NotFoundError,
} from "@elements/app";
import { requireAdmin, requireCandidateAccess } from "#app/shared/services/auth";
import { getOpenJob } from "#app/shared/services/jobs";
import { STAGES, Stage } from "#app/shared/services/hiring";
import ApplicationReceivedEmail from "#app/emails/application-received";
import RejectionEmail from "#app/emails/rejection";

/** One application as the board and dashboard hold it: no resume, no answers. */
export interface Candidate {
  id: string;
  jobId: string;
  name: string;
  email: string;
  stage: Stage;
  createdAt: Date;
  stageChangedAt: Date;
  rejectionSentAt: Date | null;
  scoreAvg: number | null;
  scorecardCount: number;
}

const MAX_RESUME_BYTES = 5 * 1024 * 1024;

// The pinned channel is what the applicationsNotify trigger publishes on, so
// an application submitted on the careers page, a scorecard, and a drag on the
// board all reach every open board the same way.
export let applications: LiveTable<Candidate> = new LiveTable<Candidate>({
  channel: (partition) => (partition ? `applications:${partition}` : "applications"),

  select: (partition) => sql<Candidate>(`
    select id, jobId, name, email, stage, createdAt, stageChangedAt,
           rejectionSentAt, scoreAvg, scorecardCount
      from applications
     where ${partition.jobId ?? null}::uuid is null or jobId = ${partition.jobId ?? null}::uuid
  `),

  insert: () => {
    throw new ForbiddenError("Applications come in through the careers page.");
  },

  update: (item) => {
    requireAdmin();

    if (!STAGES.includes(item.stage)) {
      throw new ValidationError("Unknown stage.");
    }

    return sql<Candidate>(`
      update applications set stage = ${item.stage}
       where id = ${item.id}
      returning id, jobId, name, email, stage, createdAt, stageChangedAt,
                rejectionSentAt, scoreAvg, scorecardCount
    `).firstOrThrow("candidate not found");
  },

  delete: () => {
    throw new ForbiddenError();
  },
});

export interface ApplyForm {
  jobId: string;
  name: string;
  email: string;
  phone: string;
  answer: string;
  resume?: File;
}

export interface ApplyResult {
  name: string;
  email: string;
  jobTitle: string;
}

function isPdf(file: File): boolean {
  let d = file.data;

  // "%PDF" at the start of the bytes. The declared type is the uploader's
  // claim; the magic number is what the file actually is.
  return file.contentType === "application/pdf"
    && d.length > 4
    && d[0] === 0x25 && d[1] === 0x50 && d[2] === 0x44 && d[3] === 0x46;
}

export function validateApplication(form: ApplyForm) {
  let errors: Record<string, string[]> = {};

  if (!form.name.trim()) {
    errors.name = ["Tell us your name."];
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) {
    errors.email = ["Enter an email address we can reach you at."];
  }

  if (form.phone.replace(/\D/g, "").length < 7) {
    errors.phone = ["Enter a phone number, including the area code."];
  }

  if (!form.resume) {
    errors.resume = ["Attach your resume as a PDF."];
  } else if (!isPdf(form.resume)) {
    errors.resume = ["Your resume needs to be a PDF file."];
  } else if (form.resume.size > MAX_RESUME_BYTES) {
    errors.resume = ["Your resume is over 5 MB. Try exporting a smaller PDF."];
  }

  if (!form.answer.trim()) {
    errors.answer = ["A few sentences is plenty."];
  } else if (form.answer.length > 2000) {
    errors.answer = ["Keep it under 2,000 characters."];
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }
}

/** @rpc */
export function apply(form: ApplyForm): ApplyResult {
  let job = getOpenJob(form.jobId);

  validateApplication(form);

  let resume = form.resume!;
  let name = form.name.trim();
  let address = form.email.trim().toLowerCase();

  tx(() => {
    let app = sql<{ id: string }>(`
      insert into applications (jobId, name, email, phone, answer)
           values (${job.id}, ${name}, ${address}, ${form.phone.trim()}, ${form.answer.trim()})
      returning id
    `).firstOrThrow();

    sql(`
      insert into resumes (applicationId, name, size, data)
           values (${app.id}, ${resume.name}, ${resume.size}, ${resume.data})
    `);
  });

  email({
    to: address,
    subject: `We received your application for ${job.title}`,
    body: new ApplicationReceivedEmail({ name, jobTitle: job.title, jobId: job.id }),
  });

  return { name, email: address, jobTitle: job.title };
}

/** @rpc */
export function setStage(applicationId: string, stage: Stage) {
  requireAdmin();

  if (!STAGES.includes(stage)) {
    throw new ValidationError("Unknown stage.");
  }

  sql(`update applications set stage = ${stage} where id = ${applicationId}`);
}

/** @rpc */
export function sendRejection(applicationId: string): Date {
  let admin = requireAdmin();

  let app = sql<{ name: string; email: string; stage: string; rejectionSentAt: Date | null; jobTitle: string }>(`
    select a.name, a.email, a.stage, a.rejectionSentAt, j.title as jobTitle
      from applications a
      join jobs j on j.id = a.jobId
     where a.id = ${applicationId}
  `).first();

  if (!app) {
    throw new NotFoundError("candidate not found");
  }

  if (app.stage !== "rejected") {
    throw new ValidationError("Move the candidate to rejected first.");
  }

  if (app.rejectionSentAt) {
    throw new ValidationError("A rejection email was already sent.");
  }

  email({
    to: app.email,
    subject: `Your application for ${app.jobTitle}`,
    body: new RejectionEmail({
      name: app.name.split(" ")[0],
      jobTitle: app.jobTitle,
      senderName: admin.name,
    }),
  });

  return sql<{ rejectionSentAt: Date }>(`
    update applications set rejectionSentAt = now()
     where id = ${applicationId}
    returning rejectionSentAt
  `).firstOrThrow().rejectionSentAt;
}

