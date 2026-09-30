/**
 * The keys your app stores in the session, so `session.get("userId")` is
 * typed. Role is here for rendering the nav; every guard reads it from the
 * users table instead, so a demoted user loses access on the next request.
 */
declare module "@elements/app" {
  interface SessionData {
    userId: string;
    userName: string;
    role: string;
  }
}

export {};
