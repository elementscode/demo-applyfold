import { test, equal } from "@elements/app";
import { listOpenJobs, groupByTeam } from "#app/shared/services/jobs";
import { makeJob } from "#app/shared/testing/fixtures";

test("careers", () => {
  test("lists open jobs only, grouped by team", () => {
    makeJob("open", "Open Role");
    makeJob("closed", "Closed Role");

    let jobs = listOpenJobs();

    equal(jobs.map((j) => j.title), ["Open Role"]);
    equal(groupByTeam(jobs).map((g) => g.team), ["Engineering"]);
  });
});
