import { App } from "@elements/app";
import config from "#config";
import home from "#app/pages/home";
import job from "#app/pages/job";
import signin from "#app/pages/signin";
import dashboard from "#app/pages/dashboard";
import board from "#app/pages/board";
import candidate from "#app/pages/candidate";
import jobEdit from "#app/pages/job-edit";
import serveResume from "#app/routes/resume";
import notFound from "#app/pages/errors/not-found";
import unhandled from "#app/pages/errors/unhandled";

const app = new App();

app.route("/", home);
app.route("/careers/:id", job);
app.route("/signin", signin);
app.route("/hiring", dashboard);
app.route("/hiring/jobs/new", jobEdit);
app.route("/hiring/jobs/:id", board);
app.route("/hiring/jobs/:id/edit", jobEdit);
app.route("/hiring/candidates/:id", candidate);
app.route("/hiring/candidates/:id/resume", serveResume);

app.error((req, res, err) => {
  switch (err.statusCode) {
    case 404:
      return notFound(req, res, err);

    default:
      return unhandled(req, res, err);
  }
});

app.start(config);
