-- seed demo hiring data
/** @env development */

insert into users (email, name, title, role, passwordHash) values
  ('maya@applyfold.test', 'Maya Chen', 'Head of People', 'admin', crypt('applyfold', genSalt('bf', 12))),
  ('dev@applyfold.test', 'Dev Patel', 'Staff Engineer', 'interviewer', crypt('applyfold', genSalt('bf', 12))),
  ('sam@applyfold.test', 'Sam Rivera', 'Design Lead', 'interviewer', crypt('applyfold', genSalt('bf', 12)));

insert into jobs (title, team, location, status, createdAt, description) values
  ('Senior Backend Engineer', 'Platform', 'Remote (US)', 'open', now() - interval '21 days', $md$
We're looking for a backend engineer who likes owning a system end to end: the schema, the queues, the pager, and the conversation with the customer who found the edge case.

## What you'll do

- Design and ship the services behind hiring pipelines for thousands of teams
- Own Postgres performance as our largest customers grow past a million applications
- Build the event system that powers real-time boards and integrations
- Mentor two mid-level engineers and review a lot of thoughtful code

## What we're looking for

- 5+ years building production web services
- Deep comfort with SQL and relational modeling
- You write things down: design docs, runbooks, good commit messages
- Bonus: experience with multi-tenant SaaS or background job systems

## Compensation

$175k to $210k, meaningful equity, and a $2,000 yearly learning budget.
$md$),
  ('Product Designer', 'Design', 'New York, NY', 'open', now() - interval '14 days', $md$
Hiring is stressful for everyone involved. We want a designer who can make it feel calm, for the recruiter juggling forty roles and for the candidate refreshing their inbox.

## What you'll do

- Lead design for the candidate experience: careers pages, applications, and scheduling
- Run research sessions with recruiters and hiring managers every week
- Prototype in code when a static mock won't answer the question
- Grow and maintain our design system with the frontend team

## What we're looking for

- 4+ years designing shipped software products
- A portfolio that shows your process, not just the final screens
- Strong writing: you name things well and cut copy ruthlessly
- Bonus: you have hired people and have opinions about it

## Compensation

$150k to $180k and equity. Three days a week in our Flatiron office.
$md$),
  ('Customer Success Lead', 'Operations', 'Remote (Europe)', 'open', now() - interval '9 days', $md$
Our customers are small, fast-growing teams hiring for the first time. You'll be the person who makes sure their first twenty hires go well.

## What you'll do

- Own onboarding for new customers in EMEA, from kickoff call to first hire
- Turn recurring questions into help center articles and product feedback
- Partner with sales on renewals and expansion
- Build the playbook as we grow the team from one to five

## What we're looking for

- 3+ years in customer success, support, or account management at a SaaS company
- Calm under pressure and clear in writing
- Fluent English; a second European language is a plus

## Compensation

EUR 70k to 85k, equity, and a home office stipend.
$md$),
  ('Founding Data Analyst', 'Data', 'San Francisco, CA', 'closed', now() - interval '60 days', $md$
This role has been filled. Thanks to everyone who applied.
$md$);

insert into applications (jobId, name, email, phone, answer, stage, createdAt, stageChangedAt, rejectionSentAt)
select j.id, v.name, v.email, v.phone, v.answer, v.stage,
       now() - (v.appliedDays || ' days')::interval - (v.appliedHours || ' hours')::interval,
       now() - (v.stageDays || ' days')::interval,
       case when v.stage = 'rejected' then now() - (v.stageDays || ' days')::interval end
  from (values
    ('Senior Backend Engineer', 'Priya Raman', 'priya.raman@example.com', '+1 415 555 0142',
     'I rebuilt the billing pipeline at my last company so invoices were generated from an append-only ledger instead of mutable rows. Disputes dropped to near zero because we could always replay exactly what happened.',
     'offer', 18, 3, 1),
    ('Senior Backend Engineer', 'Marcus Webb', 'marcus.webb@example.com', '+1 312 555 0187',
     'A small open source library for rate limiting with Postgres advisory locks. It is boring on purpose, and a few hundred companies run it in production.',
     'interview', 15, 5, 4),
    ('Senior Backend Engineer', 'Elena Sorokina', 'elena.sorokina@example.com', '+1 646 555 0113',
     'I led the migration of a 4TB Postgres database to a new cluster with under a minute of downtime. The proudest part was the rehearsal plan, which we ran six times.',
     'interview', 13, 4, 2),
    ('Senior Backend Engineer', 'Tomás Herrera', 'tomas.herrera@example.com', '+1 512 555 0164',
     'An internal job queue that replaced three different cron setups. On-call pages for failed jobs went from weekly to once a quarter.',
     'screen', 9, 2, 6),
    ('Senior Backend Engineer', 'Hannah Okafor', 'hannah.okafor@example.com', '+1 206 555 0199',
     'I built a feature flag service used by forty engineers. I learned that the hard part is cleaning flags up, so I added expiry dates and a weekly digest.',
     'applied', 2, 2, 3),
    ('Senior Backend Engineer', 'Jonah Feld', 'jonah.feld@example.com', '+1 617 555 0121',
     'A search indexer for a legal documents product that kept results fresh within five seconds of an edit.',
     'applied', 1, 1, 7),
    ('Senior Backend Engineer', 'Wei Zhang', 'wei.zhang@example.com', '+1 408 555 0135',
     'I wrote the first version of our public API and its documentation, and I still answer most of the developer forum questions.',
     'rejected', 16, 8, 2),
    ('Senior Backend Engineer', 'Ravi Iyer', 'ravi.iyer@example.com', '+1 669 555 0118',
     'I cut our p99 API latency from 900ms to 120ms by finding one missing index and then writing the tooling so nobody could ship that mistake again.',
     'hired', 20, 2, 4),
    ('Senior Backend Engineer', 'Mei Tanaka', 'mei.tanaka@example.com', '+1 503 555 0166',
     'I designed the webhook delivery system at my last job: retries with backoff, a dead letter queue, and a replay button that support can use without paging engineering.',
     'offer', 17, 1, 3),
    ('Senior Backend Engineer', 'Chloe Martin', 'chloe.martin@example.com', '+1 773 555 0109',
     'I turned a nightly batch import into a streaming pipeline, so customers saw their data in seconds instead of the next morning.',
     'screen', 6, 1, 5),
    ('Senior Backend Engineer', 'Samuel Adeyemi', 'samuel.adeyemi@example.com', '+1 404 555 0183',
     'I maintain the Postgres extension our team uses for tenant isolation, and I wrote the migration guide that got four other teams onto it.',
     'applied', 0, 0, 2),
    ('Product Designer', 'Aisha Bello', 'aisha.bello@example.com', '+1 718 555 0158',
     'I redesigned the checkout for a grocery delivery app. Completion went up 11 percent, but I am prouder of the research diary study that told us why people were abandoning.',
     'hired', 13, 1, 5),
    ('Product Designer', 'Lucas Moreau', 'lucas.moreau@example.com', '+1 917 555 0176',
     'A scheduling tool for community health clinics, designed with the front desk staff who use it eight hours a day.',
     'interview', 10, 3, 1),
    ('Product Designer', 'Nora Lindqvist', 'nora.lindqvist@example.com', '+1 347 555 0102',
     'I built the design system at a fintech startup from a Figma file into a coded component library the whole team used.',
     'screen', 6, 1, 8),
    ('Product Designer', 'Diego Alvarez', 'diego.alvarez@example.com', '+1 929 555 0147',
     'An onboarding flow for a meditation app that cut time to first session in half.',
     'applied', 1, 1, 2),
    ('Product Designer', 'Grace Kim', 'grace.kim@example.com', '+1 646 555 0190',
     'Mostly brand and marketing sites so far. I am looking to move into product work.',
     'rejected', 11, 6, 4),
    ('Customer Success Lead', 'Sofia Rossi', 'sofia.rossi@example.com', '+39 02 5550 1234',
     'I took over a book of 60 accounts with 70 percent retention and brought it to 94 percent in a year, mostly by fixing onboarding.',
     'interview', 8, 2, 3),
    ('Customer Success Lead', 'Liam O''Connor', 'liam.oconnor@example.com', '+353 1 555 0172',
     'I wrote the help center for a payroll product from scratch. Ticket volume fell by a third in the first quarter.',
     'screen', 5, 1, 6),
    ('Customer Success Lead', 'Amara Nwosu', 'amara.nwosu@example.com', '+44 20 5550 1188',
     'I ran customer training webinars in English and French for a logistics platform, and turned the recordings into a self-serve course.',
     'applied', 0, 0, 5)
  ) as v(jobTitle, name, email, phone, answer, stage, appliedDays, stageDays, appliedHours)
  join jobs j on j.title = v.jobTitle;

-- A one-page PDF for each demo candidate, so the resume preview has something
-- real to show. Standard fonts only, ASCII text, offsets computed in bytes.
create function demoPdfText(s text) returns text
language sql immutable as $$
  select replace(replace(replace(translate(s, 'áàâäãéèêëíìîïóòôöõúùûüñçÁÉÍÓÚÑ', 'aaaaaeeeeiiiiooooouuuuncAEIOUN'), '\', '\\'), '(', '\('), ')', '\)');
$$;

create function demoResumePdf(fullName text, contact text, headline text, lines text[]) returns bytea
language plpgsql as $$
declare
  content text;
  objs text[];
  pdf text;
  offsets integer[] := '{}';
  xrefAt integer;
  y integer := 650;
  line text;
  i integer;
begin
  content := 'BT /F1 26 Tf 72 720 Td (' || demoPdfText(fullName) || ') Tj ET' || E'\n'
          || 'BT /F2 11 Tf 0.35 0.35 0.4 rg 72 700 Td (' || demoPdfText(contact) || ') Tj ET' || E'\n'
          || 'BT /F2 13 Tf 0.1 0.1 0.15 rg 72 680 Td (' || demoPdfText(headline) || ') Tj ET' || E'\n'
          || '0.8 0.8 0.85 RG 1 w 72 668 m 540 668 l S' || E'\n';

  foreach line in array lines loop
    if left(line, 2) = '# ' then
      y := y - 10;
      content := content || 'BT /F1 12 Tf 0.1 0.1 0.15 rg 72 ' || y || ' Td (' || demoPdfText(upper(substr(line, 3))) || ') Tj ET' || E'\n';
      y := y - 20;
    else
      content := content || 'BT /F2 11 Tf 0.2 0.2 0.25 rg 72 ' || y || ' Td (' || demoPdfText(line) || ') Tj ET' || E'\n';
      y := y - 17;
    end if;
  end loop;

  objs := array[
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Length ' || octet_length(content) || ' >>' || E'\nstream\n' || content || E'\nendstream'
  ];

  pdf := E'%PDF-1.4\n';
  for i in 1..6 loop
    offsets := offsets || octet_length(pdf);
    pdf := pdf || i || E' 0 obj\n' || objs[i] || E'\nendobj\n';
  end loop;

  xrefAt := octet_length(pdf);
  pdf := pdf || E'xref\n0 7\n0000000000 65535 f \n';
  for i in 1..6 loop
    pdf := pdf || lpad(offsets[i]::text, 10, '0') || E' 00000 n \n';
  end loop;
  pdf := pdf || E'trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n' || xrefAt || E'\n%%EOF\n';

  return convert_to(pdf, 'UTF8');
end;
$$;

insert into resumes (applicationId, name, size, data)
select a.id,
       lower(replace(replace(translate(a.name, 'áéíóúñ', 'aeioun'), ' ', '-'), '''', '')) || '-resume.pdf',
       octet_length(p.data),
       p.data
  from applications a
  join (values
    ('priya.raman@example.com', 'Senior Software Engineer, Ledgerly', array[
      '# Experience',
      'Ledgerly - Senior Software Engineer, 2021 to present',
      'Rebuilt invoicing on an append-only ledger; disputes down 90 percent.',
      'Led a team of four through a Postgres 11 to 15 upgrade.',
      'Carta - Software Engineer, 2017 to 2021',
      'Built equity plan import tooling used by 3,000 companies.',
      '# Skills',
      'Go, TypeScript, PostgreSQL, Kafka, Terraform',
      '# Education',
      'B.S. Computer Science, University of Michigan']),
    ('marcus.webb@example.com', 'Backend Engineer, Parcelwise', array[
      '# Experience',
      'Parcelwise - Backend Engineer, 2019 to present',
      'Owns the shipping rates service, 40M requests a day.',
      'Maintainer of pg-throttle, an open source rate limiter.',
      'Groupon - Software Engineer, 2015 to 2019',
      '# Skills',
      'Ruby, Go, PostgreSQL, Redis']),
    ('elena.sorokina@example.com', 'Staff Engineer, Vantage Health', array[
      '# Experience',
      'Vantage Health - Staff Engineer, 2020 to present',
      'Migrated a 4TB database with under a minute of downtime.',
      'Designed the HIPAA audit log pipeline.',
      'Yandex - Software Engineer, 2014 to 2020',
      '# Skills',
      'Python, Rust, PostgreSQL, Kubernetes',
      '# Education',
      'M.S. Applied Mathematics, Moscow State University']),
    ('tomas.herrera@example.com', 'Software Engineer, Tidepool', array[
      '# Experience',
      'Tidepool - Software Engineer, 2020 to present',
      'Replaced three cron systems with one job queue.',
      'Indeed - Software Engineer, 2017 to 2020',
      '# Skills',
      'Java, Kotlin, TypeScript, PostgreSQL']),
    ('hannah.okafor@example.com', 'Senior Engineer, Brightline', array[
      '# Experience',
      'Brightline - Senior Engineer, 2019 to present',
      'Built the feature flag service used by 40 engineers.',
      'Amazon - SDE II, 2015 to 2019',
      '# Skills',
      'TypeScript, Node.js, DynamoDB, PostgreSQL']),
    ('jonah.feld@example.com', 'Software Engineer, Casetext', array[
      '# Experience',
      'Casetext - Software Engineer, 2018 to present',
      'Built the incremental search indexer; 5 second freshness.',
      '# Skills',
      'Python, Elasticsearch, PostgreSQL']),
    ('wei.zhang@example.com', 'API Engineer, Shiplane', array[
      '# Experience',
      'Shiplane - API Engineer, 2019 to present',
      'Wrote the first public API and its reference docs.',
      '# Skills',
      'Go, OpenAPI, MySQL']),
    ('ravi.iyer@example.com', 'Senior Backend Engineer, Loopline', array[
      '# Experience',
      'Loopline - Senior Backend Engineer, 2019 to present',
      'Cut p99 API latency from 900ms to 120ms.',
      'Built the query review bot that flags missing indexes.',
      'Parkway - Software Engineer, 2015 to 2019',
      '# Skills',
      'Go, PostgreSQL, gRPC, Terraform']),
    ('mei.tanaka@example.com', 'Senior Software Engineer, Relaywise', array[
      '# Experience',
      'Relaywise - Senior Software Engineer, 2020 to present',
      'Designed webhook delivery with retries and replay.',
      'Event fanout at 2B events a month.',
      '# Skills',
      'Elixir, Go, PostgreSQL, Kafka']),
    ('chloe.martin@example.com', 'Data Engineer, Fieldnote', array[
      '# Experience',
      'Fieldnote - Data Engineer, 2020 to present',
      'Replaced a nightly batch import with streaming ingest.',
      '# Skills',
      'Python, TypeScript, PostgreSQL, Debezium']),
    ('samuel.adeyemi@example.com', 'Platform Engineer, Quarry', array[
      '# Experience',
      'Quarry - Platform Engineer, 2021 to present',
      'Maintains the tenant isolation Postgres extension.',
      '# Skills',
      'C, Rust, PostgreSQL internals']),
    ('aisha.bello@example.com', 'Senior Product Designer, Basketful', array[
      '# Experience',
      'Basketful - Senior Product Designer, 2020 to present',
      'Redesigned checkout; completion up 11 percent.',
      'Ran a six week diary study with 30 households.',
      'IDEO - Designer, 2016 to 2020',
      '# Skills',
      'Figma, prototyping in React, research, design systems']),
    ('lucas.moreau@example.com', 'Product Designer, CareDesk', array[
      '# Experience',
      'CareDesk - Product Designer, 2019 to present',
      'Designed clinic scheduling with front desk staff.',
      '# Skills',
      'Figma, usability testing, service design']),
    ('nora.lindqvist@example.com', 'Design Systems Designer, Mintbank', array[
      '# Experience',
      'Mintbank - Design Systems Designer, 2020 to present',
      'Took the design system from Figma to a coded library.',
      '# Skills',
      'Figma, CSS, Storybook, accessibility']),
    ('diego.alvarez@example.com', 'Product Designer, Stillwater', array[
      '# Experience',
      'Stillwater - Product Designer, 2021 to present',
      'Onboarding redesign halved time to first session.',
      '# Skills',
      'Figma, motion, user interviews']),
    ('grace.kim@example.com', 'Brand Designer, Freelance', array[
      '# Experience',
      'Freelance - Brand Designer, 2018 to present',
      'Identity and web work for 25 small businesses.',
      '# Skills',
      'Illustrator, Webflow, typography']),
    ('sofia.rossi@example.com', 'Customer Success Manager, Fattura', array[
      '# Experience',
      'Fattura - Customer Success Manager, 2019 to present',
      'Raised retention on a 60 account book from 70 to 94 percent.',
      '# Languages',
      'Italian, English, Spanish']),
    ('liam.oconnor@example.com', 'Support Lead, Payfolio', array[
      '# Experience',
      'Payfolio - Support Lead, 2020 to present',
      'Wrote the help center; tickets down a third.',
      '# Skills',
      'Zendesk, Intercom, SQL basics']),
    ('amara.nwosu@example.com', 'Customer Education Manager, Routely', array[
      '# Experience',
      'Routely - Customer Education Manager, 2020 to present',
      'Ran bilingual training webinars and a self-serve course.',
      '# Languages',
      'English, French'])
  ) as r(email, headline, lines) on r.email = a.email
  cross join lateral (
    select demoResumePdf(a.name, a.email || '  |  ' || a.phone, r.headline, r.lines) as data
  ) p;

drop function demoResumePdf(text, text, text, text[]);
drop function demoPdfText(text);

insert into assignments (applicationId, userId)
select a.id, u.id
  from (values
    ('priya.raman@example.com', 'dev@applyfold.test'),
    ('marcus.webb@example.com', 'dev@applyfold.test'),
    ('marcus.webb@example.com', 'sam@applyfold.test'),
    ('elena.sorokina@example.com', 'dev@applyfold.test'),
    ('mei.tanaka@example.com', 'dev@applyfold.test'),
    ('ravi.iyer@example.com', 'dev@applyfold.test'),
    ('chloe.martin@example.com', 'dev@applyfold.test'),
    ('tomas.herrera@example.com', 'dev@applyfold.test'),
    ('aisha.bello@example.com', 'sam@applyfold.test'),
    ('lucas.moreau@example.com', 'sam@applyfold.test'),
    ('nora.lindqvist@example.com', 'sam@applyfold.test'),
    ('sofia.rossi@example.com', 'sam@applyfold.test')
  ) as v(candidate, interviewer)
  join applications a on a.email = v.candidate
  join users u on u.email = v.interviewer;

insert into scorecards (applicationId, interviewerId, craft, communication, ownership, recommendation, summary, createdAt, updatedAt)
select a.id, u.id, v.craft, v.communication, v.ownership, v.recommendation, v.summary, now() - (v.daysAgo || ' days')::interval, now() - (v.daysAgo || ' days')::interval
  from (values
    ('priya.raman@example.com', 'dev@applyfold.test', 4, 4, 4, 'strong_yes',
     'Best systems design interview I have run this year. Walked through the ledger tradeoffs without prompting and asked sharp questions about our tenancy model.', 4),
    ('marcus.webb@example.com', 'dev@applyfold.test', 3, 3, 2, 'no',
     'Solid fundamentals, but struggled to reason about failure modes in the queue exercise and did not push back on a flawed requirement.', 3),
    ('marcus.webb@example.com', 'sam@applyfold.test', 3, 4, 3, 'yes',
     'Great collaborator in the cross-functional session. Explained technical constraints to me clearly and adjusted the plan when I raised a UX concern.', 3),
    ('elena.sorokina@example.com', 'dev@applyfold.test', 4, 3, 4, 'yes',
     'Very strong on Postgres internals. Communication was a little terse at first but warmed up. Would want a second opinion on mentoring.', 2),
    ('mei.tanaka@example.com', 'dev@applyfold.test', 4, 4, 3, 'yes',
     'Excellent on delivery guarantees and idempotency. She asked who owns the pager before anyone brought it up. Slightly light on mentoring examples.', 5),
    ('ravi.iyer@example.com', 'dev@applyfold.test', 4, 3, 4, 'strong_yes',
     'Found the slow query in our exercise in under ten minutes and explained the plan output clearly. Exactly the ownership we want.', 12),
    ('aisha.bello@example.com', 'sam@applyfold.test', 4, 4, 3, 'strong_yes',
     'Portfolio review was excellent: clear process, honest about what did not work. The whiteboard exercise showed real product judgment.', 6),
    ('lucas.moreau@example.com', 'sam@applyfold.test', 3, 2, 3, 'yes',
     'Thoughtful research practice and good craft. Presentation ran long and he had trouble summarizing; worth coaching rather than a blocker.', 1)
  ) as v(candidate, interviewer, craft, communication, ownership, recommendation, summary, daysAgo)
  join applications a on a.email = v.candidate
  join users u on u.email = v.interviewer;

insert into notes (applicationId, authorId, authorName, body, createdAt)
select a.id, u.id, u.name, v.body, now() - (v.hoursAgo || ' hours')::interval
  from (values
    ('priya.raman@example.com', 'maya@applyfold.test', 'Verbal offer made at $200k. She is weighing one other offer and will answer by Friday.', 20),
    ('priya.raman@example.com', 'dev@applyfold.test', 'References came back glowing. Her former manager called her the calmest person in an outage he has worked with.', 50),
    ('elena.sorokina@example.com', 'maya@applyfold.test', 'Scheduled the culture interview with Sam for next Tuesday.', 30),
    ('aisha.bello@example.com', 'maya@applyfold.test', 'Signed! Start date is the 14th. Sending the onboarding packet today.', 26),
    ('sofia.rossi@example.com', 'maya@applyfold.test', 'Based in Milan, happy with the EU remote setup. Salary expectations within band.', 40),
    ('tomas.herrera@example.com', 'maya@applyfold.test', 'Recruiter screen went well. Moving to a technical screen with Dev.', 44)
  ) as v(candidate, author, body, hoursAgo)
  join applications a on a.email = v.candidate
  join users u on u.email = v.author;
