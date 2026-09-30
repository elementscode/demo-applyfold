import { test, equal, assert, sql } from "@elements/app";
import { makeUser, makeJob, loginAs } from "#app/shared/testing/fixtures";
import { saveJob, loadJobForm, emptyJobForm } from "./services";

async function attempt(fn: () => unknown | Promise<unknown>): Promise<any> {
  try {
    await fn();
  } catch (err) {
    return err;
  }
}

test("job editor", async () => {
  test("an admin closes a job", async () => {
    let id = makeJob();
    loginAs(makeUser("admin"));

    await attempt(() => saveJob({ ...loadJobForm(id), status: "closed" }));

    equal(loadJobForm(id).status, "closed");
  });

  test("a new job needs a title and location", async () => {
    loginAs(makeUser("admin"));
    let err = await attempt(() => saveJob(emptyJobForm()));

    equal(Object.keys(err?.errors ?? {}).sort(), ["location", "title"]);
  });

  test("interviewers cannot edit jobs", async () => {
    let id = makeJob();
    loginAs(makeUser("interviewer"));

    let err = await attempt(() => saveJob({ ...loadJobForm(id), title: "Hacked" }));

    assert(err !== undefined, "expected a refusal");
    equal(sql<{ title: string }>(`select title from jobs where id = ${id}`).firstOrThrow().title, "Test Engineer");
  });
});
