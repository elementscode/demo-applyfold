import { sql, session, redirect, AuthError, ForbiddenError } from "@elements/app";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "interviewer";
}

/** @rpc */
export function signin(email: string, password: string) {
  let address = email.trim().toLowerCase();

  if (!address || !password) {
    throw new AuthError("Enter your email and password.");
  }

  let user = sql<User>(`
    select id, email, name, role from users
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
}

export function currentUser(): User | undefined {
  let userId = session.get("userId");

  if (!userId) {
    return undefined;
  }

  return sql<User>(`select id, email, name, role from users where id = ${userId}`).first();
}

/** For page routes: a visitor who is not signed in is sent to sign in. */
export function requireUser(): User {
  let user = currentUser();

  if (!user) {
    redirect("/signin");
    throw new AuthError("sign in required");
  }

  return user;
}

export function requireAdmin(): User {
  let user = requireUser();

  if (user.role !== "admin") {
    throw new ForbiddenError("Only admins can do that.");
  }

  return user;
}

/** For rpc and LiveTable handlers, where there is no page to redirect. */
export function userOrThrow(): User {
  session.isLoggedInOrThrow();

  let user = currentUser();

  if (!user) {
    throw new AuthError("Sign in again.");
  }

  return user;
}

export function adminOrThrow(): User {
  let user = userOrThrow();

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

/** Admins see every candidate; an interviewer sees only the ones assigned to them. */
export function canSeeApplication(user: User, applicationId: string): boolean {
  return user.role === "admin" || isAssigned(applicationId, user.id);
}

export function applicationAccessOrThrow(applicationId: string): User {
  let user = userOrThrow();

  if (!canSeeApplication(user, applicationId)) {
    throw new ForbiddenError("This candidate is not assigned to you.");
  }

  return user;
}
