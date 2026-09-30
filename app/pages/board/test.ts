import { test, equal, assert, sql } from "@elements/app";
import { makeUser, makeJob, makeApplication, loginAs } from "#app/shared/testing/fixtures";
import { applications } from "./template";

function stageOf(id: string): string {
  return sql<{ stage: string }>(`select stage::text as stage from applications where id = ${id}`).firstOrThrow().stage;
}

test("board", () => {
  test("an admin moves a candidate between stages", () => {
    let jobId = makeJob();
    let id = makeApplication(jobId);
    loginAs(makeUser("admin"));

    let view = applications.view({ jobId });
    let card = view.get(id)!;
    view.update({ ...card, stage: "interview" });

    equal(stageOf(id), "interview");
  });

  test("the card carries scorecard and interviewer details", () => {
    let jobId = makeJob();
    let id = makeApplication(jobId);
    let interviewer = makeUser("interviewer", "Priya Test");
    sql(`insert into assignments (applicationId, userId) values (${id}, ${interviewer.id})`);
    sql(`
      insert into scorecards (applicationId, interviewerId, skills, communication, ownership, recommendation)
           values (${id}, ${interviewer.id}, 4, 3, 2, 'yes')
    `);
    loginAs(makeUser("admin"));

    let card = applications.view({ jobId }).get(id)!;

    equal(card.scoreCount, 1);
    equal(card.avgScore, 3);
    equal(card.interviewers, "Priya");
  });

  test("an interviewer cannot move candidates", () => {
    let jobId = makeJob();
    let id = makeApplication(jobId);
    let admin = makeUser("admin");
    loginAs(admin);
    let view = applications.view({ jobId });
    let card = view.get(id)!;

    loginAs(makeUser("interviewer"));
    let refused = false;

    try {
      view.update({ ...card, stage: "offer" });
    } catch {
      refused = true;
    }

    assert(refused, "expected the update to be refused");
    equal(stageOf(id), "applied");
  });
});
