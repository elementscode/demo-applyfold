import { test, assert, session } from "@elements/app";
import { signin } from "#app/shared/services/auth";
import { makeUser, PASSWORD } from "#app/shared/testing/fixtures";

test("signin", () => {
  test("logs in with the right password, case-insensitive email", () => {
    let user = makeUser("interviewer");
    signin(user.email.toUpperCase(), PASSWORD);

    assert(session.get("userId") === user.id, "expected a session for the user");
  });

  test("refuses a wrong password without saying which part was wrong", () => {
    let user = makeUser("admin");
    let message = "";

    try {
      signin(user.email, "wrong-password");
    } catch (err: any) {
      message = err.message;
    }

    assert(message === "That email and password do not match.", `got ${message}`);
  });
});
