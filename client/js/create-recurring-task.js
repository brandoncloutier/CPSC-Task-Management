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
    const start_date = document.getElementById("start_date").value
    const due_in_days_val = document.getElementById("due_in_days").value
    const interval_value = document.getElementById("interval_value").value
    const interval_unit = document.getElementById("interval_unit").value
    const is_active = document.getElementById("is_active").checked

    const { data: { session } } = await supabase.auth.getSession()
    const supabase_uid = session.user.id

    const newRecurringTask = {
      project_id: Number(projectId),
      supabase_uid: supabase_uid,
      name: name || null,
      description: description || null,
      sense_of_urgency: sense_of_urgency || null,
      status: status || null,
      due_in_days: due_in_days_val ? Number(due_in_days_val) : 0,
      interval_value: interval_value ? Number(interval_value) : 1,
      interval_unit: interval_unit,
      start_date: start_date || new Date(),
      is_active: is_active
    }

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