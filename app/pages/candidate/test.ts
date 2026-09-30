import { test, equal, assert, sql } from "@elements/app";
import { makeUser, makeJob, makeApplication, assignTo, loginAs } from "#app/shared/testing/fixtures";
import { setStage, sendRejection } from "#app/shared/services/candidates";
import { saveScorecard, addNote, assign, ScorecardForm } from "./services";

async function refused(fn: () => unknown | Promise<unknown>): Promise<boolean> {
  try {
    await fn();
  } catch {
    return true;
  }

  return false;
}

function scorecard(applicationId: string, overrides: Partial<ScorecardForm> = {}): ScorecardForm {
  return { applicationId, skills: 3, communication: 4, ownership: 2, recommendation: "yes", comments: " Solid. ", ...overrides };
}

test("candidate", async () => {
  test("an assigned interviewer saves and then updates their scorecard", async () => {
    let id = makeApplication(makeJob());
    let interviewer = makeUser("interviewer");
    assignTo(id, interviewer.id);
    loginAs(interviewer);

    saveScorecard(scorecard(id));
    let cards = saveScorecard(scorecard(id, { skills: 4, recommendation: "strong_yes" }));

    equal(cards.length, 1);
    equal(cards[0].skills, 4);
    equal(cards[0].recommendation, "strong_yes");
    equal(cards[0].comments, "Solid.");
  });

  test("an interviewer cannot score or annotate a candidate not assigned to them", async () => {
    let id = makeApplication(makeJob());
    loginAs(makeUser("interviewer"));

    assert(await refused(() => saveScorecard(scorecard(id))), "scorecard should be refused");
    assert(await refused(() => addNote(id, "hello")), "note should be refused");
  });

  test("scores must be 1 to 4 with a recommendation", async () => {
    let id = makeApplication(makeJob());
    loginAs(makeUser("admin"));

    assert(await refused(() => saveScorecard(scorecard(id, { skills: 5 }))), "5 should be refused");
    assert(await refused(() => saveScorecard(scorecard(id, { recommendation: "" }))), "missing recommendation should be refused");
  });

  test("only admins assign interviewers and change stages", async () => {
    let id = makeApplication(makeJob());
    let interviewer = makeUser("interviewer");
    loginAs(interviewer);

    assert(await refused(() => assign(id, interviewer.id)), "interviewer should not assign");
    assert(await refused(() => setStage(id, "hired")), "interviewer should not move stages");

    loginAs(makeUser("admin"));
    equal(assign(id, interviewer.id).map((p) => p.id), [interviewer.id]);
  });

  test("a rejection email is only sent to a rejected candidate, and is recorded", async () => {
    let id = makeApplication(makeJob());
    loginAs(makeUser("admin"));

    assert(await refused(() => sendRejection(id)), "should refuse before rejection");

    setStage(id, "rejected");
    sendRejection(id);

    let row = sql<{ sent: boolean }>(`select rejectionSentAt is not null as sent from applications where id = ${id}`).firstOrThrow();
    equal(row.sent, true);
  });
});
