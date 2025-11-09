CREATE TABLE completed_projects (
  completed_project_id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL,
  supabase_uid UUID NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  duedate DATE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT completed_projects_supabase_uid_fkey
    FOREIGN KEY (supabase_uid)
    REFERENCES public.user(supabase_uid)
    ON DELETE CASCADE
);