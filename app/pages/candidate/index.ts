import { Request, Response } from "@elements/app";
import { staffOrRedirect, requireCandidateAccess } from "#app/shared/services/auth";
import { loadCandidate, scorecardsFor, interviewersFor, notes } from "./services";
import html from "./template";

export default function route(req: Request, res: Response) {
  if (!staffOrRedirect()) {
    return;
  }

  let user = requireCandidateAccess(req.params.id);
  let candidate = loadCandidate(req.params.id);

  return new html({
    user,
    candidate,
    scorecards: scorecardsFor(candidate.id, user),
    interviewers: interviewersFor(candidate.id),
    notes: notes.view({ applicationId: candidate.id }),
  });
}
