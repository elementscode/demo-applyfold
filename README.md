![Applicant tracking with a pipeline board, built by Claude Code on Elements: the Senior Backend Engineer pipeline board with candidates across applied, screen, interview, offer, hired and rejected, a new application just arrived, and scorecard averages.](https://elements.dev/demos/01a0f3be-aac0-7295-8f51-ea54afb37bfb/poster?v=5cdfe60df4dd)

# Applicant tracking with a pipeline board, built by Claude Code on Elements

> Applyfold is a full-stack app built with Claude Code on Elements.

A careers page with PDF resume uploads, a drag-and-drop pipeline board for each job, and interview scorecards, all live.

[Run this app on your machine](https://elements.dev/demos/01a0f3be-aac0-7295-8f51-ea54afb37bfb). Use this demo as inspiration, or as the starting point for your own app. Your agent creates a new app with this one as the scaffold, and you prompt it to add whatever features you want.

## How it's built

Applyfold needed resume uploads, a pipeline board that updates for everyone watching, emails to applicants, and two kinds of hiring accounts. Each of those is a part of Elements, so the agent spent its 17 minutes on the hiring workflow itself.

- **A live pipeline board.** Applications are a LiveTable, one view per job. Dragging a candidate to a new column saves the move, and a database trigger broadcasts every new application and stage change, so each open board updates whether the change came from the careers page, a candidate's page or another board.

- **Resume uploads.** The apply form sends the resume as a file field to an `@rpc` function, which checks that the bytes are a real PDF under 5 MB and stores it. The hiring team previews it on the candidate's page.

- **Server calls as function calls.** Scorecards, notes, interviewer assignments and the job editor call server functions straight from the page with `@rpc`, and validation messages come back to the field they belong to.

- **Email to applicants.** Each application sends a confirmation from an email template. Dragging a candidate to rejected offers a polite rejection email, sent from a second template.

- **Sessions and roles.** Admins see every job and board. An interviewer sees only the candidates assigned to them, and one guard enforces it on every page and server call.

- **Data from SQL files.** Migrations define the schema and seed three accounts, four jobs, 21 candidates and ten scorecards, each candidate with a one-page PDF resume built in SQL. The project server applied each one as soon as it was saved.

## Why Elements

Elements is an integrated full-stack app framework and a project server. The project server checks the agent's work as it builds: it type-checks the server and browser code, analyzes the program, applies migrations and runs the tests, then reports the results to the agent. A security mistake, such as calling a server-only function from the browser, is a compile error. The agent reads the report and fixes its own mistakes before it tells you a feature is done. The same checks run on every feature you ask for next.
