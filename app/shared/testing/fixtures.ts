import { sql, session, File } from "@elements/app";
import { User } from "#app/shared/services/auth";

export const PASSWORD = "applyfold";

export function makeUser(role: "admin" | "interviewer", name = role === "admin" ? "Ada Admin" : "Ivan Interviewer"): User {
  let email = `${name.toLowerCase().replace(/\s+/g, ".")}@test.dev`;

  return sql<User>(`
    insert into users (email, name, role, passwordHash)
         values (${email}, ${name}, ${role}, crypt(${PASSWORD}, genSalt('bf', 4)))
    returning id, email, name, role
  `).firstOrThrow();
}

export function loginAs(user: User) {
  session.login({ userId: user.id, userName: user.name, role: user.role });
}

export function makeJob(status: "open" | "closed" = "open", title = "Test Engineer"): string {
  return sql<{ id: string }>(`
    insert into jobs (title, team, location, status, description)
         values (${title}, 'Engineering', 'Remote', ${status}, '## Hello')
    returning id
  `).firstOrThrow().id;
}

export function makeApplication(jobId: string, name = "Casey Candidate", stage = "applied"): string {
  return sql<{ id: string }>(`
    insert into applications (jobId, name, email, phone, answer, resumeName, resumeSize, resumeData, stage)
         values (${jobId}, ${name}, 'casey@example.com', '+1 555 0100', 'An answer.', 'casey.pdf', 5,
                 ${pdfBytes()}, ${stage})
    returning id
  `).firstOrThrow().id;
}

export function assignTo(applicationId: string, userId: string) {
  sql(`insert into assignments (applicationId, userId) values (${applicationId}, ${userId})`);
}

export function pdfBytes(): Uint8Array {
  return new TextEncoder().encode("%PDF-1.4\n%%EOF\n");
}

export function file(name: string, contentType: string, data: Uint8Array): File {
  return new File({ name, size: data.length, contentType, data, lastModified: new Date() });
}
