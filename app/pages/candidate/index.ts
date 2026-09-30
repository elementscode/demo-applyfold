import { Request, Response, ForbiddenError } from "@elements/app";
import { requireUser, canSeeApplication } from "#app/shared/services/auth";
import { getCandidate, listNotes, listScorecards, listAssignees, listInterviewers } from "./services";
import html from "./template";

export default function route(req: Request, res: Response) {
  let user = requireUser();
  let id = req.params.id;

  if (!canSeeApplication(user, id)) {
    throw new ForbiddenError("This candidate is not assigned to you.");
  }

  return new html({
    user,
    candidate: getCandidate(id),
    notes: listNotes(id),
    scorecards: listScorecards(id),
    assignees: listAssignees(id),
    people: user.role === "admin" ? listInterviewers() : [],
  });
}
