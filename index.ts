import { App } from "@elements/app";
import config from "#config";
import careers from "#app/pages/careers";
import job from "#app/pages/job";
import signin from "#app/pages/signin";
import hiring from "#app/pages/hiring";
import jobEdit from "#app/pages/job-edit";
import board from "#app/pages/board";
import candidate from "#app/pages/candidate";
import serveResume from "#app/routes/resume";
import forbidden from "#app/pages/errors/forbidden";
import notFound from "#app/pages/errors/not-found";
import unhandled from "#app/pages/errors/unhandled";

const app = new App();

app.route("/", careers);
app.route("/jobs/:id", job);
app.route("/signin", signin);
app.route("/hiring", hiring);
app.route("/hiring/jobs/new", jobEdit);
app.route("/hiring/jobs/:id/edit", jobEdit);
app.route("/hiring/jobs/:id", board);
app.route("/hiring/candidates/:id", candidate);
app.route("/hiring/candidates/:id/resume", serveResume);

app.error((req, res, err) => {
  switch (err.statusCode) {
    case 403:
      return forbidden(req, res, err);

    case 404:
      return notFound(req, res, err);

    default:
      return unhandled(req, res, err);
  }
});

app.start(config);
