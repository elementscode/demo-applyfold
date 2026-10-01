![Applyfold, an applicant tracking system built with Elements: the Senior Backend Engineer pipeline board with candidates across applied, screen, interview, offer, hired and rejected, a new application just arrived, and scorecard averages.](https://elements.dev/demos/01a0f3be-aac0-7295-8f51-ea54afb37bfb/poster?v=5cdfe60df4dd)

# Applyfold

> A demo app built with [Elements](https://elements.dev).

A careers page with PDF resume uploads, a drag-and-drop pipeline board for each job, and interview scorecards, all live.

**Demo:** [Applyfold](https://elements.dev/demos/01a0f3be-aac0-7295-8f51-ea54afb37bfb)

## Agent specs

What one run of the prompt below took, from an empty Elements project to this
app.

- **Agent:** Claude Code, Opus 5.5 Medium
- **Time:** 17 min
- **Cost:** $6.75 at API rates, September 2026

## Get started

```bash
elements create applyfold -scaffold=elementscode/demo-applyfold
```

## How it's built

Applyfold needed resume uploads, a pipeline board that updates for everyone watching, emails to applicants, and two kinds of hiring accounts. Each of those is a part of Elements, so the agent spent its 17 minutes on the hiring workflow itself.

### What Elements gave the app

- **A live pipeline board.** `applications` is a LiveTable in `app/pages/board/template.ehtml`, partitioned by job. Dropping a card calls `cards.update`, and a trigger in the schema migration notifies the job's channel on every insert and stage change, so new applications and moves appear on every open board.
- **File uploads as form fields.** The `apply` rpc in `app/pages/job/template.ehtml` takes the resume as a `File` beside the other fields, checks the PDF signature and size, and stores the bytes. `app/routes/resume.ts` serves the file back to the candidate page's preview.
- **Server calls as function calls.** Scorecards, notes, assignments and the job editor call `@rpc` functions such as `saveScorecard` and `saveJob` straight from the page. A `ValidationError` carries field messages back to their form.
- **Email templates.** `app/emails/application-received` and `app/emails/rejection` are templates sent with `email()`. Dragging a candidate to rejected opens a prompt that calls `sendRejection` in `app/shared/services/candidates.ts`.
- **Sessions and roles.** `app/shared/services/auth.ts` holds the guards: `requireAdmin` for job pages and the board, and `applicationAccessOrThrow` so an interviewer sees only the candidates assigned to them.
- **Data from SQL files.** Two migrations define the schema and seed three accounts, four jobs, 21 candidates and ten scorecards. Every seeded candidate has a one-page PDF built in SQL by `seedResumePdf`. The project server applied each migration as soon as it was saved.

### What the project server gave the agent

The project server runs alongside the agent and answers as soon as a file is saved: it type-checks the templates, TypeScript and SQL, applies migrations and reruns the tests, so every question came back right away and the agent kept building.

### What shipped

The app type-checks with zero errors and all 19 tests pass. Every page was checked on desktop and phone before publishing, along with a board move watched live from a second tab.

Start in `app/pages/board/template.ehtml`.

## Seed data and demo accounts

The careers page belongs to Wrenbolt, a made-up startup that builds software
for trade crews; the name is set in `app/shared/services/hiring.ts`. The seed
creates four jobs (Senior Backend Engineer, Product Designer and Customer
Success Manager open, Founding Recruiter closed) and twenty-one candidates
across every stage, each with a one-page PDF resume. Ten interview scorecards,
several notes, and interviewer assignments fill out the boards. The public
careers page is at `/`, and the hiring team signs in at `/signin`, which lists
the accounts. Every account's password is `applyfold`.

| Email                  | Name            | Role        |
| ---------------------- | --------------- | ----------- |
| admin@wrenbolt.test    | Maya Okafor     | admin       |
| jonas@wrenbolt.test    | Jonas Lindqvist | interviewer |
| priya@wrenbolt.test    | Priya Raman     | interviewer |

Emails (application confirmations and rejections) are written to the app log
in development.

## The prompt

```text
Build an applicant tracking system named applyfold for a growing startup, with a
public careers page.

PUBLIC
- Careers page listing open jobs, each with a description page.
- Apply: name, email, phone, resume upload (PDF), a short answer.
- The applicant gets a confirmation email.

HIRING TEAM (accounts: admin and interviewer)
- Admins create jobs (title, team, location, markdown description, open or
  closed).
- Each job's pipeline board: applied, screen, interview, offer, hired,
  rejected. Drag a candidate to move them.
- Candidate page: resume preview, application answers, notes, and interview
  scorecards (1 to 4 on each of three criteria plus a recommendation).
- Interviewers see only candidates assigned to them and fill in scorecards.
- Moving a candidate to rejected offers to send a polite rejection email.

Seed one admin, two interviewers, three open jobs, and fifteen candidates
across stages with a few scorecards. Show the seeded logins on the sign-in
page.

Board moves and new applications update in real time.
```

## License

MIT. See [LICENSE](LICENSE).
