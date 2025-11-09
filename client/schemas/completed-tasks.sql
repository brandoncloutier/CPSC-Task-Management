CREATE TABLE completed_tasks (
  completed_task_id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  supabase_uid UUID NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  due_date DATE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT completed_tasks_supabase_uid_fkey
    FOREIGN KEY (supabase_uid)
    REFERENCES public.user(supabase_uid)
    ON DELETE CASCADE
);