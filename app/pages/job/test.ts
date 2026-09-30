import { test, equal, assert, sql } from "@elements/app";
import { makeJob, file, pdfBytes } from "#app/shared/testing/fixtures";
import { apply, ApplyForm } from "./template";

function form(jobId: string, overrides: Partial<ApplyForm> = {}): ApplyForm {
  return {
    jobId,
    name: "Rosa Delgado",
    email: " Rosa@Example.com ",
    phone: "+1 303 555 0100",
    answer: "I rebuilt a flaky CI pipeline.",
    resume: file("rosa.pdf", "application/pdf", pdfBytes()),
    ...overrides,
  };
}

async function errorsOf(fn: () => unknown | Promise<unknown>): Promise<Record<string, string[]>> {
  try {
    await fn();
  } catch (err: any) {
    return err.errors ?? { thrown: [err.message] };
  }

  return {};
}

test("apply", async () => {
  test("stores the application in the applied stage and returns the address", async () => {
    let jobId = makeJob();
    let sentTo = apply(form(jobId));

    equal(sentTo, "rosa@example.com");

    let row = sql<{ name: string; stage: string; resumeName: string }>(`
      select name, stage::text as stage, resumeName from applications where jobId = ${jobId}
    `).firstOrThrow();

    equal(row, { name: "Rosa Delgado", stage: "applied", resumeName: "rosa.pdf" });
  });

  test("rejects a file that is not a PDF, whatever it claims to be", async () => {
    let jobId = makeJob();
    let html = new TextEncoder().encode("<script>alert(1)</script>");
    let errors = await errorsOf(() => apply(form(jobId, { resume: file("cv.pdf", "application/pdf", html) })));

    equal(errors.resume, ["Your resume must be a PDF."]);
    equal(sql(`select 1 from applications where jobId = ${jobId}`).all().length, 0);
  });

  test("requires every field", async () => {
    let jobId = makeJob();
    let errors = await errorsOf(() => apply(form(jobId, { name: " ", email: "nope", phone: "12", answer: "", resume: undefined })));

    equal(Object.keys(errors).sort(), ["answer", "email", "name", "phone", "resume"]);
  });

  test("refuses a closed job", async () => {
    let jobId = makeJob("closed");
    let errors = await errorsOf(() => apply(form(jobId)));

    assert(errors.thrown?.[0].includes("no longer accepting"), "expected closed-job error");
  });
});
