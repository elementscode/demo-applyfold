-- seed demo data: the logins shown on the sign-in page, jobs, candidates

-- A one-page PDF resume, built by hand so every seeded candidate has a real
-- file to preview. Text must not contain parentheses or backslashes.
create function seedResumePdf(pName text, contact text, headline text, lines text[]) returns bytea
language plpgsql as $$
declare
  content text;
  y int := 720;
  line text;
  objs text[];
  doc text;
  offsets int[] := '{}';
  xrefAt int;
  i int;
begin
  content := 'BT /F1 24 Tf 0.07 0.1 0.15 rg 72 ' || y || ' Td (' || pName || ') Tj ET' || E'\n';
  y := y - 22;
  content := content || 'BT /F2 10 Tf 0.4 0.44 0.5 rg 72 ' || y || ' Td (' || contact || ') Tj ET' || E'\n';
  y := y - 20;
  content := content || 'BT /F2 13 Tf 0.07 0.1 0.15 rg 72 ' || y || ' Td (' || headline || ') Tj ET' || E'\n';
  y := y - 14;
  content := content || '0.82 0.84 0.87 RG 1 w 72 ' || y || ' m 540 ' || y || ' l S' || E'\n';
  y := y - 24;

  foreach line in array lines loop
    if left(line, 1) = '#' then
      y := y - 8;
      content := content || 'BT /F1 12 Tf 0.07 0.1 0.15 rg 72 ' || y || ' Td (' || upper(substr(line, 2)) || ') Tj ET' || E'\n';
      y := y - 20;
    else
      content := content || 'BT /F2 11 Tf 0.2 0.24 0.3 rg 72 ' || y || ' Td (' || line || ') Tj ET' || E'\n';
      y := y - 16;
    end if;
  end loop;

  objs := array[
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Length ' || octet_length(content) || E' >>\nstream\n' || content || 'endstream'
  ];

  doc := E'%PDF-1.4\n';

  for i in 1 .. array_length(objs, 1) loop
    offsets := offsets || octet_length(doc);
    doc := doc || i || E' 0 obj\n' || objs[i] || E'\nendobj\n';
  end loop;

  xrefAt := octet_length(doc);
  doc := doc || E'xref\n0 ' || (array_length(objs, 1) + 1) || E'\n0000000000 65535 f \n';

  for i in 1 .. array_length(offsets, 1) loop
    doc := doc || lpad(offsets[i]::text, 10, '0') || E' 00000 n \n';
  end loop;

  doc := doc || 'trailer << /Size ' || (array_length(objs, 1) + 1) || E' /Root 1 0 R >>\nstartxref\n' || xrefAt || E'\n%%EOF\n';

  return convert_to(doc, 'UTF8');
end;
$$;

insert into users (email, name, role, passwordHash) values
  ('admin@wrenbolt.test', 'Maya Okafor', 'admin', crypt('applyfold', genSalt('bf', 8))),
  ('jonas@wrenbolt.test', 'Jonas Lindqvist', 'interviewer', crypt('applyfold', genSalt('bf', 8))),
  ('priya@wrenbolt.test', 'Priya Raman', 'interviewer', crypt('applyfold', genSalt('bf', 8)));

insert into jobs (title, team, location, status, question, description) values
  ('Senior Backend Engineer', 'Engineering', 'Remote, US or EU', 'open',
   'Tell us about a system you designed that had to survive real traffic. What would you change now?',
$md$Wrenbolt helps field service teams schedule, dispatch and get paid. We are 38 people and growing, and the backend is where most of the hard problems live: routing, billing, and a sync engine that has to work in a basement with one bar of signal.

## What you will do

- Own services end to end, from the schema to the on-call rotation
- Design the offline sync protocol our mobile apps depend on
- Make billing boring: correct, auditable and fast
- Review code and pair with the four engineers on the platform team

## What we are looking for

- Six or more years building production backends
- Deep comfort with Postgres, including the parts that hurt
- You write things down, and you like it when others do too
- Experience with payments or scheduling is a plus, not a requirement

## What we offer

- Salary range **$175k to $210k**, plus equity
- Four weeks off, and a company-wide week in December
- A team offsite twice a year$md$),

  ('Product Designer', 'Design', 'New York, NY', 'open',
   'Share a piece of work you are proud of and walk us through one decision you would defend.',
$md$Our customers are electricians, plumbers and HVAC crews. They use Wrenbolt in a truck, between jobs, sometimes with gloves on. Designing for them is a craft, and we are looking for someone who wants to get very good at it.

## What you will do

- Lead design for the technician mobile app, from research to shipped pixels
- Ride along with customers at least once a quarter
- Build out our design system with the front-end team
- Prototype fast and test with real crews

## What we are looking for

- Four or more years of product design, with work you can show
- Strong interaction and visual skills, with a bias toward clarity
- Comfort presenting to customers and to engineers

## What we offer

- Salary range **$150k to $180k**, plus equity
- Hybrid schedule, three days in our SoHo office
- A generous hardware and learning budget$md$),

  ('Customer Success Manager', 'Customer Success', 'Austin, TX', 'open',
   'Describe a time you turned an unhappy customer into an advocate. What did you actually do?',
$md$Every Wrenbolt customer runs a business that keeps the lights and the heat on. When something goes wrong for them, it goes wrong for their customers too. Customer Success is how we make sure that almost never happens.

## What you will do

- Onboard new accounts, from ten-person shops to regional operators
- Own renewal and expansion for a book of around 60 customers
- Turn what you hear into clear requests for product and engineering

## What we are looking for

- Three or more years in customer success, account management or support
- Calm under pressure, and good on the phone
- Experience in the trades or field services is a real plus

## What we offer

- Salary range **$85k to $105k**, plus variable and equity
- Our Austin office on East 6th, with lunch on Thursdays$md$),

  ('Founding Recruiter', 'People', 'Remote, US', 'closed',
   'What is the best hire you ever made, and how did you find them?',
$md$We have filled this role. Thank you to everyone who applied.$md$);

create temporary table seedCandidates (
  jobTitle text,
  name text,
  email text,
  phone text,
  stage applicationStage,
  daysAgo int,
  headline text,
  answer text,
  lines text[]
) on commit drop;

insert into seedCandidates values
  ('Senior Backend Engineer', 'Ana Souza', 'ana.souza@example.com', '+1 415 555 0142', 'interview', 12,
   'Staff Engineer, Rowhouse Payments',
   'I rebuilt the ledger at Rowhouse after a double-charge incident. We moved to an append-only journal with idempotency keys on every write. Today I would split reads out much earlier; we spent a quarter fighting lock contention we saw coming.',
   array['#Experience', 'Rowhouse Payments - Staff Engineer, 2021 to now', '  Led the ledger rewrite, 0 double charges since launch', '  Cut settlement batch time from 40 minutes to 3',
         'Tessel - Senior Engineer, 2017 to 2021', '  Built the event pipeline, 2 billion events a day',
         '#Skills', 'Go, Postgres, Kafka, Terraform, distributed tracing',
         '#Education', 'BSc Computer Science, University of Sao Paulo']),

  ('Senior Backend Engineer', 'Marcus Chen', 'marcus.chen@example.com', '+1 206 555 0187', 'offer', 21,
   'Senior Software Engineer, Fieldkit',
   'At Fieldkit I designed the offline sync for our inspection app. Conflicts were resolved per field with vector clocks. It held up at 30k daily users, but I would pick CRDTs for the list fields next time; our merge rules were too clever.',
   array['#Experience', 'Fieldkit - Senior Software Engineer, 2020 to now', '  Designed offline-first sync used by 30k inspectors', '  Mentored five engineers, two now lead teams',
         'Amberline - Software Engineer, 2016 to 2020', '  Scheduling service for a 2,000 truck fleet',
         '#Skills', 'Rust, TypeScript, Postgres, SQLite, CRDTs',
         '#Education', 'BS Computer Engineering, University of Washington']),

  ('Senior Backend Engineer', 'Leila Haddad', 'leila.haddad@example.com', '+44 20 7946 0321', 'applied', 2,
   'Backend Engineer, Parcelly',
   'I built the dispatch service at Parcelly that assigns 80k deliveries a day. The first version was a cron job; the second is an event-driven queue with backpressure. I would add load shedding from day one.',
   array['#Experience', 'Parcelly - Backend Engineer, 2019 to now', '  Dispatch service, 80k assignments a day', '  On-call lead for the logistics platform',
         '#Skills', 'Python, Go, Postgres, Redis, AWS',
         '#Education', 'MEng Computing, Imperial College London']),

  ('Senior Backend Engineer', 'Tomas Rivera', 'tomas.rivera@example.com', '+34 91 555 0199', 'screen', 7,
   'Platform Engineer, Quanta Health',
   'Our appointment reminders at Quanta went out twice during a failover. I designed an outbox table and a single delivery worker per shard. It was not glamorous, but it has been correct for two years.',
   array['#Experience', 'Quanta Health - Platform Engineer, 2020 to now', '  Outbox-based notifications, 5M messages a month',
         'Nubo - Software Engineer, 2017 to 2020', '  Billing integrations with three payment processors',
         '#Skills', 'Java, Kotlin, Postgres, Kubernetes',
         '#Education', 'Telecommunications Engineering, UPM Madrid']),

  ('Senior Backend Engineer', 'Grace Kim', 'grace.kim@example.com', '+1 312 555 0110', 'rejected', 18,
   'Software Engineer, Brightpath Learning',
   'I built a course catalog API that handled a back-to-school spike of 20x normal traffic. We cached aggressively at the edge. Next time I would invest in load testing before the spike rather than during it.',
   array['#Experience', 'Brightpath Learning - Software Engineer, 2021 to now', '  Catalog API and search, 20x seasonal peaks',
         '#Skills', 'Node.js, TypeScript, MongoDB, Redis',
         '#Education', 'BS Computer Science, University of Illinois']),

  ('Senior Backend Engineer', 'Dev Patel', 'dev.patel@example.com', '+1 646 555 0175', 'interview', 9,
   'Senior Engineer, Tallyho Invoicing',
   'I led the migration of our invoicing monolith from MySQL to Postgres with zero downtime, using dual writes and a verification job. I would build the verification tooling first next time; it found the bugs that mattered.',
   array['#Experience', 'Tallyho Invoicing - Senior Engineer, 2019 to now', '  Zero-downtime MySQL to Postgres migration', '  Tax calculation engine for 14 countries',
         'Loop Commerce - Engineer, 2016 to 2019',
         '#Skills', 'Ruby, Go, Postgres, MySQL, GCP',
         '#Education', 'BTech Computer Science, IIT Bombay']),

  ('Product Designer', 'Hana Watanabe', 'hana.watanabe@example.com', '+1 917 555 0133', 'hired', 30,
   'Senior Product Designer, Tillage',
   'At Tillage I redesigned the harvest logging flow for farmers using the app one-handed on a tractor. We cut the steps from nine to three. The decision I would defend is removing the free-text field everyone asked for.',
   array['#Experience', 'Tillage - Senior Product Designer, 2020 to now', '  Harvest logging redesign, task time down 60 percent', '  Built the Tillage design system',
         'Fernhouse Studio - Designer, 2017 to 2020',
         '#Skills', 'Prototyping, field research, design systems',
         '#Education', 'BFA Interaction Design, Parsons']),

  ('Product Designer', 'Olu Adeyemi', 'olu.adeyemi@example.com', '+1 347 555 0164', 'interview', 10,
   'Product Designer, Mealbox',
   'I designed the delivery driver app at Mealbox. The decision I would defend is a single giant button for the next action, which tested badly in the office and great in cars.',
   array['#Experience', 'Mealbox - Product Designer, 2021 to now', '  Driver app used by 4,000 couriers',
         'Freelance - Designer, 2018 to 2021',
         '#Skills', 'Prototyping, usability testing, motion',
         '#Education', 'BA Graphic Design, University of Lagos']),

  ('Product Designer', 'Sofia Rossi', 'sofia.rossi@example.com', '+39 02 555 0148', 'screen', 5,
   'UX Designer, Cantiere',
   'I redesigned the job-site safety checklist at Cantiere. The decision I would defend is making every item photographable instead of checkable, which made the audits honest.',
   array['#Experience', 'Cantiere - UX Designer, 2020 to now', '  Safety checklist redesign, audits up 3x',
         '#Skills', 'Research, information architecture, wireframes',
         '#Education', 'MA Design, Politecnico di Milano']),

  ('Product Designer', 'Ben Carter', 'ben.carter@example.com', '+1 718 555 0126', 'applied', 1,
   'Designer, Northpaw',
   'I am most proud of the onboarding for the Northpaw pet-sitting app. I would defend the choice to ask for a photo of the pet before anything else. It doubled completion.',
   array['#Experience', 'Northpaw - Designer, 2022 to now', '  Onboarding flow, completion up 2x',
         '#Skills', 'Illustration, prototyping, visual design',
         '#Education', 'BFA Communication Design, Pratt Institute']),

  ('Product Designer', 'Nadia Petrova', 'nadia.petrova@example.com', '+1 929 555 0151', 'interview', 8,
   'Lead Designer, Voltcart',
   'I led design for the Voltcart charging map. The decision I would defend is showing only chargers that work right now, even though it made the map look emptier.',
   array['#Experience', 'Voltcart - Lead Designer, 2019 to now', '  Charging map used by 200k drivers', '  Hired and managed three designers',
         'Moskit Maps - Product Designer, 2015 to 2019',
         '#Skills', 'Data visualization, research, leadership',
         '#Education', 'MA Design, HSE Moscow']),

  ('Customer Success Manager', 'Jamal Wright', 'jamal.wright@example.com', '+1 512 555 0139', 'applied', 3,
   'Account Manager, Roofline',
   'A roofing company was about to churn after a botched import wiped their schedule. I drove to their office with a laptop and rebuilt it with them by hand. They renewed for three years.',
   array['#Experience', 'Roofline - Account Manager, 2020 to now', '  Book of 80 accounts, 112 percent net retention',
         '#Skills', 'CRM, health scoring, onboarding, training',
         '#Education', 'BBA Marketing, Texas State University']),

  ('Customer Success Manager', 'Emma Lindgren', 'emma.lindgren@example.com', '+1 737 555 0172', 'screen', 6,
   'Customer Success Lead, Pipefitter',
   'A plumbing franchise owner called me angry every week. I set up a standing Friday call and a shared doc of every issue. After two months he became our loudest reference.',
   array['#Experience', 'Pipefitter - Customer Success Lead, 2019 to now', '  Led a team of four CSMs', '  Built the onboarding playbook',
         '#Skills', 'Playbooks, renewals, help desk, QBRs',
         '#Education', 'BA Communications, University of Texas']),

  ('Customer Success Manager', 'Carlos Mendes', 'carlos.mendes@example.com', '+1 512 555 0190', 'offer', 15,
   'Customer Success Manager, Gridwise',
   'An HVAC operator lost a week of invoices in our system. I owned the recovery, sent daily updates, and got them a credit before they asked. They expanded to four more locations that year.',
   array['#Experience', 'Gridwise - Customer Success Manager, 2020 to now', '  Book of 55 accounts, zero logo churn in 2025',
         'Former HVAC dispatcher, 2015 to 2020',
         '#Skills', 'Health scoring, SQL basics, training, field ops',
         '#Education', 'AAS Business, Austin Community College']),

  ('Customer Success Manager', 'Aisha Bello', 'aisha.bello@example.com', '+1 832 555 0118', 'applied', 0,
   'Support Specialist, Keyhole',
   'A locksmith customer was double billed and posted about it. I called them, fixed it the same day, and asked if we could share the story. They posted the follow-up themselves.',
   array['#Experience', 'Keyhole - Support Specialist, 2022 to now', '  First response time down from 6 hours to 40 minutes',
         '#Skills', 'Help desk, live chat, writing, escalation',
         '#Education', 'BA English, University of Houston']),

  ('Senior Backend Engineer', 'Yusuf Demir', 'yusuf.demir@example.com', '+49 30 555 0144', 'applied', 1,
   'Backend Engineer, Hopfen Mobility',
   'I built the trip pricing service at Hopfen. Surge pricing broke our cache every Friday night, so I moved price rules into Postgres and precomputed zones every minute. I would write the load test before the launch, not after.',
   array['#Experience', 'Hopfen Mobility - Backend Engineer, 2020 to now', '  Pricing service, 1.2M trips a month', '  Cut p99 latency from 900 ms to 120 ms',
         '#Skills', 'Go, Postgres, Redis, gRPC',
         '#Education', 'BSc Computer Science, TU Berlin']),

  ('Senior Backend Engineer', 'Mei Lin', 'mei.lin@example.com', '+1 628 555 0163', 'applied', 0,
   'Senior Engineer, Stackyard',
   'At Stackyard I owned the job scheduler that runs 3 million background tasks a day. We replaced a homegrown lock service with advisory locks in Postgres. I would add per-tenant quotas from the start.',
   array['#Experience', 'Stackyard - Senior Engineer, 2018 to now', '  Background job platform, 3M tasks a day', '  Led the move to Postgres advisory locks',
         'Coinlight - Engineer, 2015 to 2018',
         '#Skills', 'TypeScript, Node.js, Postgres, Terraform',
         '#Education', 'BS Computer Science, UC Berkeley']),

  ('Senior Backend Engineer', 'Kwame Asante', 'kwame.asante@example.com', '+1 404 555 0156', 'hired', 34,
   'Staff Engineer, Routewell',
   'I designed the route optimizer at Routewell for 900 delivery vans. The first version solved the whole city at once and timed out. Splitting by depot and solving in parallel made it fast and good enough.',
   array['#Experience', 'Routewell - Staff Engineer, 2019 to now', '  Route optimizer for 900 vans across 12 cities', '  On-call lead, 99.98 percent uptime',
         'Pollen Labs - Senior Engineer, 2015 to 2019',
         '#Skills', 'Python, Go, Postgres, OR-Tools, AWS',
         '#Education', 'MS Operations Research, Georgia Tech']),

  ('Customer Success Manager', 'Rachel Stein', 'rachel.stein@example.com', '+1 512 555 0128', 'interview', 9,
   'Senior CSM, Tradepost',
   'An electrical contractor wanted to cancel after a pricing change. I sat with their office manager for an afternoon, found two features they were paying for and not using, and set them up. They renewed and added seats.',
   array['#Experience', 'Tradepost - Senior CSM, 2019 to now', '  Book of 70 accounts, 118 percent net retention', '  Ran the customer advisory board',
         '#Skills', 'Renewals, QBRs, onboarding, training',
         '#Education', 'BA Economics, Rice University']),

  ('Customer Success Manager', 'Diego Alvarez', 'diego.alvarez@example.com', '+1 210 555 0181', 'rejected', 14,
   'Sales Development Rep, Cloudnine',
   'A customer was unhappy with a delayed feature. I escalated it to product every week until it shipped, then called them the day it went live.',
   array['#Experience', 'Cloudnine - Sales Development Rep, 2022 to now', '  Top SDR two quarters running',
         '#Skills', 'Prospecting, CRM, cold calling',
         '#Education', 'BBA, UT San Antonio']),

  ('Product Designer', 'Lucy Moreau', 'lucy.moreau@example.com', '+1 646 555 0107', 'rejected', 16,
   'Visual Designer, Petit Four',
   'I am proud of the rebrand I led for a bakery chain. I would defend the hand-drawn type, which the owners loved and customers remembered.',
   array['#Experience', 'Petit Four - Visual Designer, 2021 to now', '  Rebrand across 11 locations',
         '#Skills', 'Branding, typography, illustration',
         '#Education', 'BFA Graphic Design, SVA']);

insert into applications (jobId, name, email, phone, answer, resumeName, resumeSize, resumeData, stage, createdAt, movedAt, rejectionSentAt)
  select j.id, c.name, c.email, c.phone, c.answer,
         lower(replace(c.name, ' ', '-')) || '-resume.pdf',
         octet_length(seedResumePdf(c.name, c.email || '   ' || c.phone, c.headline, c.lines)),
         seedResumePdf(c.name, c.email || '   ' || c.phone, c.headline, c.lines),
         c.stage,
         now() - make_interval(days => c.daysAgo, hours => 3),
         now() - make_interval(days => c.daysAgo / 2),
         case when c.stage = 'rejected' then now() - interval '2 days' end
    from seedCandidates c
    join jobs j on j.title = c.jobTitle;

drop function seedResumePdf(text, text, text, text[]);

insert into assignments (applicationId, userId)
  select a.id, u.id
    from (values
      ('Ana Souza', 'jonas@wrenbolt.test'),
      ('Marcus Chen', 'jonas@wrenbolt.test'),
      ('Marcus Chen', 'priya@wrenbolt.test'),
      ('Grace Kim', 'jonas@wrenbolt.test'),
      ('Dev Patel', 'jonas@wrenbolt.test'),
      ('Hana Watanabe', 'priya@wrenbolt.test'),
      ('Olu Adeyemi', 'priya@wrenbolt.test'),
      ('Nadia Petrova', 'priya@wrenbolt.test'),
      ('Nadia Petrova', 'jonas@wrenbolt.test'),
      ('Carlos Mendes', 'priya@wrenbolt.test'),
      ('Rachel Stein', 'priya@wrenbolt.test'),
      ('Kwame Asante', 'jonas@wrenbolt.test'),
      ('Kwame Asante', 'priya@wrenbolt.test')
    ) as v(candidate, email)
    join applications a on a.name = v.candidate
    join users u on u.email = v.email;

insert into scorecards (applicationId, interviewerId, skills, communication, ownership, recommendation, comments)
  select a.id, u.id, v.skills, v.communication, v.ownership, v.rec::recommendation, v.comments
    from (values
      ('Ana Souza', 'jonas@wrenbolt.test', 3, 3, 4, 'yes', 'Strong on data modeling and very clear about tradeoffs. System design was solid; a little light on observability.'),
      ('Marcus Chen', 'jonas@wrenbolt.test', 4, 4, 3, 'strong_yes', 'Best sync design discussion I have had in an interview. Would raise the bar on the platform team.'),
      ('Marcus Chen', 'priya@wrenbolt.test', 4, 3, 4, 'yes', 'Asked great questions about the technician experience. Thinks about users, not only systems.'),
      ('Grace Kim', 'jonas@wrenbolt.test', 2, 2, 3, 'no', 'Good instincts, but struggled with the consistency questions. Not senior enough for this role yet.'),
      ('Hana Watanabe', 'priya@wrenbolt.test', 4, 4, 4, 'strong_yes', 'Portfolio review was outstanding. The tractor case study maps directly to our technicians.'),
      ('Nadia Petrova', 'priya@wrenbolt.test', 3, 4, 3, 'yes', 'Very strong communicator and presenter. Wants more research time than we can give today.'),
      ('Carlos Mendes', 'priya@wrenbolt.test', 3, 4, 4, 'yes', 'Former dispatcher, knows our customers cold. Would ramp faster than anyone we have seen.'),
      ('Rachel Stein', 'priya@wrenbolt.test', 4, 4, 3, 'yes', 'Walked through a renewal save step by step. Warm and direct, and she asked sharp questions about our churn numbers.'),
      ('Kwame Asante', 'jonas@wrenbolt.test', 4, 3, 4, 'strong_yes', 'Route optimizer deep dive was excellent. Knows when good enough is the right answer.'),
      ('Kwame Asante', 'priya@wrenbolt.test', 4, 4, 4, 'strong_yes', 'Explained a hard system to a non-engineer without talking down. Hire.')
    ) as v(candidate, email, skills, communication, ownership, rec, comments)
    join applications a on a.name = v.candidate
    join users u on u.email = v.email;

insert into notes (applicationId, authorId, body, createdAt)
  select a.id, u.id, v.body, now() - make_interval(days => v.daysAgo)
    from (values
      ('Marcus Chen', 'Offer sent at the top of the band. He asked for a start date in early November.', 1),
      ('Ana Souza', 'Referred by Tomasz on the platform team. Available to start in four weeks.', 6),
      ('Carlos Mendes', 'References came back glowing. Preparing the offer letter.', 2),
      ('Tomas Rivera', 'Phone screen booked for Thursday. Needs visa sponsorship for a US contract, fine for EU.', 3),
      ('Hana Watanabe', 'Signed. Starts October 14.', 4),
      ('Kwame Asante', 'Signed. Starts October 20 and joins the platform team.', 3),
      ('Leila Haddad', 'Strong resume. Moving to screen once Tomas is through.', 1)
    ) as v(candidate, body, daysAgo)
    join applications a on a.name = v.candidate
    join users u on u.email = 'admin@wrenbolt.test';
