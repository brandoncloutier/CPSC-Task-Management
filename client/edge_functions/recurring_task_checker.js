// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';
console.info('server started');
Deno.serve(async (req)=>{
  const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
  const currentDate = new Date().toISOString();
  // Fetching all the recurring_tasks
  const { data: recurringTasks, error: fetchError } = await supabaseAdmin.from('recurring_task').select("*").lt("next_reminder_run_at", currentDate);
  // Catch Fetch Error
  if (fetchError) {
    console.log(fetchError);
    return;
  }
  const updatedRecurringTasks = [];
  const newTasks = [];
  recurringTasks.forEach((recurringTask)=>{
    const { recurring_task_id, project_id, supabase_uid, name, description, sense_of_urgency, status, remind_days_before, interval_value, interval_unit, next_task_due_date } = recurringTask;
    // Create new updated recurring task
    const new_next_task_due_date = new Date(next_task_due_date.replace(/-/g, '\/')?.replace(/T.+/, ''));
    if (interval_unit === "day") {
      new_next_task_due_date.setDate(new_next_task_due_date.getDate() + 1 * interval_value);
    } else if (interval_unit === "week") {
      new_next_task_due_date.setDate(new_next_task_due_date.getDate() + 7 * interval_value);
    } else if (interval_unit === "month") {
      new_next_task_due_date.setMonth(new_next_task_due_date.getMonth() + 1 * interval_value);
    } else {
      console.log("[Error] interval_unit not set");
      return;
    }
    const new_next_reminder_run_at = new Date(new_next_task_due_date);
    new_next_reminder_run_at.setDate(new_next_task_due_date.getDate() - remind_days_before);
    const updatedRecurringTask = {
      recurring_task_id: recurring_task_id,
      project_id: project_id,
      next_task_due_date: new_next_task_due_date,
      next_reminder_run_at: new_next_reminder_run_at
    };
    updatedRecurringTasks.push(updatedRecurringTask);
    // Create new task
    const newTask = {
      project_id: project_id,
      supabase_uid: supabase_uid,
      name: name,
      description: description,
      sense_of_urgency: sense_of_urgency,
      status: status,
      due_at: next_task_due_date
    };
    newTasks.push(newTask);
  });
  const { data: upserted_recurring_tasks, error: upsertRecurringTaskError } = await supabaseAdmin.from("recurring_task").upsert(updatedRecurringTasks, {
    onConflict: 'recurring_task_id'
  }).select();
  if (upsertRecurringTaskError) {
    console.log(upsertRecurringTaskError);
    return;
  }
  const { data: upserted_tasks, error: upsertTaskError } = await supabaseAdmin.from("task").upsert(newTasks).select();
  if (upsertTaskError) {
    console.log(upsertTaskError);
    return;
  }
  console.log("success");
  return new Response(JSON.stringify("completed"), {
    headers: {
      'Content-Type': 'application/json',
      'Connection': 'keep-alive'
    }
  });
});
