import { sql } from "@elements/app";

export interface Job {
  id: string;
  createdAt: Date;
  title: string;
  team: string;
  location: string;
  description: string;
  question: string;
  status: "open" | "closed";
}

export interface TeamJobs {
  team: string;
  jobs: Job[];
}

export function listOpenJobs(): Job[] {
  return sql<Job>(`
    select id, createdAt, title, team, location, description, question, status
      from jobs
     where status = 'open'
     order by team, title
  `).all();
}

export function groupByTeam(jobs: Job[]): TeamJobs[] {
  let groups: TeamJobs[] = [];

  for (let job of jobs) {
    let group = groups.find((g) => g.team === job.team);

    if (!group) {
      group = { team: job.team, jobs: [] };
      groups.push(group);
    }

    group.jobs.push(job);
  }

  return groups;
}

export function getJob(id: string): Job {
  return sql<Job>(`
    select id, createdAt, title, team, location, description, question, status
      from jobs
     where id = ${id}
  `).firstOrThrow("job not found");
}
