-- add hiring schema

create or replace function touchUpdatedAt()
returns trigger
language plpgsql
as $$
begin
  new.updatedAt = now();
  return new;
end;
$$;

create type userRole as enum ('admin', 'interviewer');
create type jobStatus as enum ('open', 'closed');
create type applicationStage as enum ('applied', 'screen', 'interview', 'offer', 'hired', 'rejected');
create type recommendation as enum ('strong_no', 'no', 'yes', 'strong_yes');

create table users (
  id uuid primary key default uuidGenerateV7(),
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now(),
  email text not null unique,
  name text not null,
  passwordHash text not null,
  role userRole not null default 'interviewer'
);

create trigger usersTouchUpdatedAt
  before update on users
  for each row execute function touchUpdatedAt();

create table jobs (
  id uuid primary key default uuidGenerateV7(),
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now(),
  title text not null,
  team text not null,
  location text not null,
  description text not null default '',
  question text not null default 'Tell us about something you built or shipped that you are proud of.',
  status jobStatus not null default 'open'
);

create trigger jobsTouchUpdatedAt
  before update on jobs
  for each row execute function touchUpdatedAt();

create table applications (
  id uuid primary key default uuidGenerateV7(),
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now(),
  jobId uuid not null references jobs(id) on delete cascade,
  name text not null,
  email text not null,
  phone text not null default '',
  answer text not null default '',
  resumeName text not null,
  resumeSize integer not null,
  resumeData bytea not null,
  stage applicationStage not null default 'applied',
  movedAt timestamptz not null default now(),
  rejectionSentAt timestamptz
);

create index applicationsJobIdIdx on applications (jobId);

create trigger applicationsTouchUpdatedAt
  before update on applications
  for each row execute function touchUpdatedAt();

create table assignments (
  id uuid primary key default uuidGenerateV7(),
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now(),
  applicationId uuid not null references applications(id) on delete cascade,
  userId uuid not null references users(id) on delete cascade,
  unique (applicationId, userId)
);

create index assignmentsUserIdIdx on assignments (userId);

create trigger assignmentsTouchUpdatedAt
  before update on assignments
  for each row execute function touchUpdatedAt();

create table notes (
  id uuid primary key default uuidGenerateV7(),
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now(),
  applicationId uuid not null references applications(id) on delete cascade,
  authorId uuid not null references users(id) on delete cascade,
  body text not null
);

create index notesApplicationIdIdx on notes (applicationId);

create trigger notesTouchUpdatedAt
  before update on notes
  for each row execute function touchUpdatedAt();

create table scorecards (
  id uuid primary key default uuidGenerateV7(),
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now(),
  applicationId uuid not null references applications(id) on delete cascade,
  interviewerId uuid not null references users(id) on delete cascade,
  skills smallint not null check (skills between 1 and 4),
  communication smallint not null check (communication between 1 and 4),
  ownership smallint not null check (ownership between 1 and 4),
  recommendation recommendation not null,
  comments text not null default '',
  unique (applicationId, interviewerId)
);

create trigger scorecardsTouchUpdatedAt
  before update on scorecards
  for each row execute function touchUpdatedAt();

-- Applications arrive from the public apply rpc, and stages change from the
-- candidate page as well as the board, so the write itself tells every open
-- board. The payload is the id alone: each app server reads the card back
-- through the board's select, which carries the joined columns.
create or replace function applicationsNotify() returns trigger
language plpgsql as $$
declare
  r record;
begin
  r := coalesce(new, old);

  perform pg_notify(
    channel_name('applications'),
    json_build_object('op', lower(tg_op), 'id', r.id)::text
  );

  return r;
end;
$$;

create trigger applicationsNotifyTrigger
  after insert or update or delete on applications
  for each row execute function applicationsNotify();

-- A scorecard or an assignment changes what a board card shows, so touch the
-- application and let its trigger carry the change.
create or replace function touchApplication() returns trigger
language plpgsql as $$
declare
  r record;
begin
  r := coalesce(new, old);
  update applications set updatedAt = now() where id = r.applicationId;
  return r;
end;
$$;

create trigger scorecardsTouchApplication
  after insert or update or delete on scorecards
  for each row execute function touchApplication();

create trigger assignmentsTouchApplication
  after insert or delete on assignments
  for each row execute function touchApplication();
