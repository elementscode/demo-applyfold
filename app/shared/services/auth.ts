import { sql, session, AuthError, ForbiddenError, NotFoundError, redirect } from "@elements/app";

export interface StaffUser {
  id: string;
  email: string;
  name: string;
  title: string;
  role: "admin" | "interviewer";
}

/** @rpc */
export function signin(email: string, password: string) {
  let address = email.trim().toLowerCase();

  if (!address || !password) {
    throw new AuthError("Enter your email and password.");
  }

  let user = sql<StaffUser>(`
    select id, email, name, title, role from users
     where email = ${address}
       and passwordHash = crypt(${password}, passwordHash)
  `).first();

  if (!user) {
    throw new AuthError("That email and password do not match.");
  }

  session.login({ userId: user.id, userName: user.name, role: user.role });
}

/** @rpc */
export function signout() {
  session.logout();
  redirect("/signin");
}

/**
 * The signed-in hiring team member, read fresh from the database on every call
 * so a role change applies on the next request rather than at next signin.
 */
export function currentStaff(): StaffUser {
  session.isLoggedInOrThrow();

  let user = sql<StaffUser>(`
    select id, email, name, title, role from users where id = ${session.getOrThrow("userId")}
  `).first();

  if (!user) {
    throw new AuthError();
  }

  return user;
}

/** For page routes: a visitor who is not signed in goes to the signin page. */
export function staffOrRedirect(): StaffUser | undefined {
  if (!session.isLoggedIn()) {
    redirect("/signin");
    return undefined;
  }

  return currentStaff();
}

export function requireAdmin(): StaffUser {
  let user = currentStaff();

  if (user.role !== "admin") {
    throw new ForbiddenError("Only admins can do that.");
  }

  return user;
}

export function isAssigned(applicationId: string, userId: string): boolean {
  return !sql(`
    select 1 from assignments where applicationId = ${applicationId} and userId = ${userId}
  `).empty();
}

/**
 * Admins see every candidate. Interviewers see only the ones assigned to them,
 * and this is the one check every candidate route and rpc goes through.
 */
export function requireCandidateAccess(applicationId: string): StaffUser {
  let user = currentStaff();

  if (!/^[0-9a-f-]{36}$/i.test(applicationId)) {
    throw new NotFoundError("candidate not found");
  }

  if (user.role !== "admin" && !isAssigned(applicationId, user.id)) {
    throw new ForbiddenError("This candidate is not assigned to you.");
  }

  return user;
}
