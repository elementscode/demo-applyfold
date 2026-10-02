![Applyfold, an applicant tracking system built with Elements: the Senior Backend Engineer pipeline board with candidates across applied, screen, interview, offer, hired and rejected, a new application just arrived, and scorecard averages.](https://elements.dev/demos/01a0f3be-aac0-7295-8f51-ea54afb37bfb/poster?v=5cdfe60df4dd)

# Applyfold

> A demo app built with [Elements](https://elements.dev).

A careers page with PDF resume uploads, a drag-and-drop pipeline board for each job, and interview scorecards, all live.

**Demo:** [Applyfold](https://elements.dev/demos/01a0f3be-aac0-7295-8f51-ea54afb37bfb)

## Agent specs

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

- **A live pipeline board.** Applications are a LiveTable, one view per job. Dragging a candidate to a new column saves the move, and a database trigger broadcasts every new application and stage change, so each open board updates whether the change came from the careers page, a candidate's page or another board.

- **Resume uploads.** The apply form sends the resume as a file field to an `@rpc` function, which checks that the bytes are a real PDF under 5 MB and stores it. The hiring team previews it on the candidate's page.

- **Server calls as function calls.** Scorecards, notes, interviewer assignments and the job editor call server functions straight from the page with `@rpc`, and validation messages come back to the field they belong to.

- **Email to applicants.** Each application sends a confirmation from an email template. Dragging a candidate to rejected offers a polite rejection email, sent from a second template.

- **Sessions and roles.** Admins see every job and board. An interviewer sees only the candidates assigned to them, and one guard enforces it on every page and server call.

- **Data from SQL files.** Migrations define the schema and seed three accounts, four jobs, 21 candidates and ten scorecards, each candidate with a one-page PDF resume built in SQL. The project server applied each one as soon as it was saved.

### What the project server gave the agent

The project server runs alongside the agent and answers as soon as a file is saved: it type-checks the templates, TypeScript and SQL, applies migrations and reruns the tests, so every question came back right away and the agent kept building.

### What shipped

The app type-checks with zero errors and all 19 tests pass. Every page works on desktop and phone, and live updates arrive across tabs, such as a new application or a board move appearing on another open board.

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

**Demo:** [Applyfold](https://elements.dev/demos/01a0f3be-aac0-7295-8f51-ea54afb37bfb)

## License

MIT. See [LICENSE](LICENSE).
