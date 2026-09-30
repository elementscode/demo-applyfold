import { test, assert } from "@elements/app";
import { makeUser, makeJob, makeApplication, assignTo } from "#app/shared/testing/fixtures";
import { canSeeApplication } from "#app/shared/services/auth";

test("hiring access", () => {
  test("interviewers see only candidates assigned to them; admins see all", () => {
    let jobId = makeJob();
    let mine = makeApplication(jobId, "Mine");
    let other = makeApplication(jobId, "Other");
    let interviewer = makeUser("interviewer");
    let admin = makeUser("admin");
    assignTo(mine, interviewer.id);

    assert(canSeeApplication(interviewer, mine), "assigned candidate should be visible");
    assert(!canSeeApplication(interviewer, other), "unassigned candidate should be hidden");
    assert(canSeeApplication(admin, other), "admin sees every candidate");
  });
});
