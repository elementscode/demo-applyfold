-- add hiring schema

-- Auto-update updatedAt on row changes.
create or replace function touchUpdatedAt()
returns trigger
language plpgsql
as $$
begin
  new.updatedAt = now();
  return new;
end;
$$;

create table users (
  id uuid primary key default uuidGenerateV7(),
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now(),
  email text not null unique,
  name text not null,
  title text not null default '',
  role text not null default 'interviewer' check (role in ('admin', 'interviewer')),
  passwordHash text not null
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
  status text not null default 'open' check (status in ('open', 'closed'))
);

create index jobsStatusIdx on jobs (status);

create trigger jobsTouchUpdatedAt
  before update on jobs
  for each row execute function touchUpdatedAt();

create table applications (
  id uuid primary key default uuidGenerateV7(),
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now(),
  jobId uuid not null references jobs (id) on delete cascade,
  name text not null,
  email text not null,
  phone text not null default '',
  answer text not null default '',
  stage text not null default 'applied'
    check (stage in ('applied', 'screen', 'interview', 'offer', 'hired', 'rejected')),
  stageChangedAt timestamptz not null default now(),
  rejectionSentAt timestamptz,
  -- Kept current by the scorecards trigger below, so a board card can show the
  -- score without a join and the broadcast carries it.
  scoreAvg real,
  scorecardCount integer not null default 0
);

create index applicationsJobIdIdx on applications (jobId);

create trigger applicationsTouchUpdatedAt
  before update on applications
  for each row execute function touchUpdatedAt();

create or replace function applicationsStageChanged()
returns trigger
language plpgsql
as $$
begin
  if new.stage is distinct from old.stage then
    new.stageChangedAt = now();
  end if;
  return new;
end;
$$;

create trigger applicationsStageChangedTrigger
  before update on applications
  for each row execute function applicationsStageChanged();

create table resumes (
  id uuid primary key default uuidGenerateV7(),
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now(),
  applicationId uuid not null unique references applications (id) on delete cascade,
  name text not null,
  size integer not null,
  data bytea not null
);

create trigger resumesTouchUpdatedAt
  before update on resumes
  for each row execute function touchUpdatedAt();

create table assignments (
  applicationId uuid not null references applications (id) on delete cascade,
  userId uuid not null references users (id) on delete cascade,
  createdAt timestamptz not null default now(),
  primary key (applicationId, userId)
);

create index assignmentsUserIdIdx on assignments (userId);

create table notes (
  id uuid primary key default uuidGenerateV7(),
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now(),
  applicationId uuid not null references applications (id) on delete cascade,
  authorId uuid not null references users (id) on delete cascade,
  authorName text not null,
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
  applicationId uuid not null references applications (id) on delete cascade,
  interviewerId uuid not null references users (id) on delete cascade,
  craft smallint not null check (craft between 1 and 4),
  communication smallint not null check (communication between 1 and 4),
  ownership smallint not null check (ownership between 1 and 4),
  recommendation text not null
    check (recommendation in ('strong_no', 'no', 'yes', 'strong_yes')),
  summary text not null default '',
  unique (applicationId, interviewerId)
);

create trigger scorecardsTouchUpdatedAt
  before update on scorecards
  for each row execute function touchUpdatedAt();

create or replace function scorecardsSummarize()
returns trigger
language plpgsql
as $$
declare
  appId uuid;
begin
  appId := coalesce(new.applicationId, old.applicationId);

  update applications a
     set scoreAvg = s.avg,
         scorecardCount = s.n
    from (select avg((craft + communication + ownership) / 3.0)::real as avg,
                 count(*)::integer as n
            from scorecards
           where applicationId = appId) s
   where a.id = appId;

  return null;
end;
$$;

create trigger scorecardsSummarizeTrigger
  after insert or update or delete on scorecards
  for each row execute function scorecardsSummarize();

-- Every write to applications reaches open boards and dashboards, whatever made
-- it: the public apply rpc, a drag on the board, a scorecard, or psql.
create or replace function applicationsNotify()
returns trigger
language plpgsql
as $$
declare
  r record;
  payload text;
begin
  r := coalesce(new, old);

  payload := json_build_object(
    'op', lower(tg_op),
    'data', json_build_object(
      'id', r.id,
      'jobId', r.jobId,
      'name', r.name,
      'email', r.email,
      'stage', r.stage,
      'createdAt', json_build_object('$type', 'Date', '$value', (extract(epoch from r.createdAt) * 1000)::bigint),
      'stageChangedAt', json_build_object('$type', 'Date', '$value', (extract(epoch from r.stageChangedAt) * 1000)::bigint),
      'rejectionSentAt', case when r.rejectionSentAt is null then null
                              else json_build_object('$type', 'Date', '$value', (extract(epoch from r.rejectionSentAt) * 1000)::bigint) end,
      'scoreAvg', r.scoreAvg,
      'scorecardCount', r.scorecardCount
    )
  )::text;

  if octet_length(payload) >= 8000 then
    payload := json_build_object('op', lower(tg_op), 'id', r.id)::text;
  end if;

  perform pg_notify(channel_name('applications'), payload);
  perform pg_notify(channel_name('applications:jobId=' || r.jobId), payload);

  return r;
end;
$$;

create trigger applicationsNotifyTrigger
  after insert or update or delete on applications
  for each row execute function applicationsNotify();
