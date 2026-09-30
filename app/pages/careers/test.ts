import { test, equal, assert } from "@elements/app";
import { listOpenJobs, groupByTeam } from "#app/shared/services/jobs";
import { makeJob } from "#app/shared/testing/fixtures";

test("careers", () => {
  test("lists open jobs only, grouped by team", () => {
    let openId = makeJob("open", "Open Role");
    let closedId = makeJob("closed", "Closed Role");

    // The list also holds the seed jobs, so assert on the rows made here.
    let jobs = listOpenJobs();
    let ids = jobs.map((j) => j.id);

    assert(ids.includes(openId), "expected the open job in the list");
    assert(!ids.includes(closedId), "expected the closed job left out");

    let engineering = groupByTeam(jobs).find((g) => g.team === "Engineering");
    equal(engineering?.jobs.some((j) => j.id === openId), true);
  });
});
