create type public.recurring_interval_unit as enum (
  'day',
  'week',
  'month'
);

create table public.recurring_task (
  recurring_task_id serial primary key,
  project_id integer not null,
  supabase_uid uuid null,
  name varchar(100) null,
  description text null,
  sense_of_urgency public.urgency_level null,
  status public.task_status null,
  due_at date null,
  interval_value integer not null default 1,
  interval_unit public.recurring_interval_unit not null default 'week',
  start_date date not null default current_date,
  next_run_at timestamptz not null default now(),
  last_run_at timestamptz null,
  is_active boolean not null default true,
  constraint recurring_task_project_id_fkey
    foreign key (project_id)
    references public.project (project_id)
    on delete cascade,

  constraint recurring_task_supabase_uid_fkey
    foreign key (supabase_uid)
    references public."user" (supabase_uid)
    on delete cascade
);