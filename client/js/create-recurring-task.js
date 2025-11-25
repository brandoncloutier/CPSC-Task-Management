import { supabase } from "./supabaseClient.js";

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get("project_id")

  const backBtn = document.getElementById("backBtn")
  if (backBtn && projectId) {
    backBtn.addEventListener("click", (event) => {
      event.preventDefault()
      const url = new URL("./project-details.html", window.location.href)
      url.searchParams.set("id", String(projectId))
      window.location.href = url.toString()
    })
  }

  const form = document.getElementById("createRecurringTaskForm")
  form.addEventListener("submit", async (event) => {
    event.preventDefault()

    const name = document.getElementById("name").value
    const description = document.getElementById("description").value
    const sense_of_urgency = document.getElementById("sense_of_urgency").value
    const status = document.getElementById("status").value
    const first_task_due_date = document.getElementById("first_task_due_date").value
    const remind_days_before_val = document.getElementById("remind_days_before").value
    const interval_value = document.getElementById("interval_value").value
    const interval_unit = document.getElementById("interval_unit").value

    const { data: { session } } = await supabase.auth.getSession()
    const supabase_uid = session.user.id

    const getCurrentDate = () => {
      const date = new Date()
      date.setHours(0, 0, 0, 0)

      return (date)
    }
    const newRecurringTask = {
      project_id: Number(projectId),
      supabase_uid: supabase_uid,
      name: name || null,
      description: description || null,
      sense_of_urgency: sense_of_urgency || null,
      status: status || null,
      remind_days_before: remind_days_before_val ? Number(remind_days_before_val) : 0,
      interval_value: interval_value ? Number(interval_value) : 1,
      interval_unit: interval_unit,
      first_task_due_date: first_task_due_date ? new Date(first_task_due_date?.replace(/-/g, '\/')?.replace(/T.+/, '')) : getCurrentDate(),
    }
    // Set next_task_due_date
    newRecurringTask.next_task_due_date = newRecurringTask.first_task_due_date

    // Set next_reminder_run_at
    newRecurringTask.next_reminder_run_at = new Date(newRecurringTask.next_task_due_date)
    newRecurringTask.next_reminder_run_at.setDate(newRecurringTask.next_reminder_run_at.getDate() - newRecurringTask.remind_days_before)

    const { data: insertedRecurringTask, error: insertError } = await supabase
      .from("recurring_task")
      .insert([newRecurringTask])
      .select()
      .single();

    if (insertError) {
      console.error(insertError);
      alert(`Error adding new recurring task: ${insertError.message}`)
      return
    }

    alert("recurring task created")
    const url = new URL("./project-details.html", window.location.href)
    url.searchParams.set("id", String(projectId))
    window.location.href = url.toString()
  })
})