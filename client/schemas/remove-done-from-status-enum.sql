-- Used Gemini to help with writing SQL statements.
-- Rename the enum
ALTER TYPE status RENAME TO status_old;

-- Update all the 'done' values to 'todo'
UPDATE task SET status = 'todo' WHERE status = 'done';
UPDATE recurring_task SET status = 'todo' WHERE status = 'done';
UPDATE completed_tasks SET status = 'todo' WHERE status = 'done';

-- Now let's rename the enum
ALTER TYPE task_status RENAME TO old_task_status;

-- Create a new enum without the 'done' value...
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'blocked');

-- Now we can update all of our tables (task, completed_tasks, recurring_task) to use this new enum...
ALTER TABLE task 
ALTER COLUMN status TYPE task_status 
USING status::text::task_status;

ALTER TABLE recurring_task 
ALTER COLUMN status TYPE task_status 
USING status::text::task_status;

ALTER TABLE completed_tasks 
ALTER COLUMN status TYPE task_status 
USING status::text::task_status;

-- Now just drop the old enum
DROP TYPE old_task_status;
