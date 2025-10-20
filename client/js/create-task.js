import { supabase } from "./supabaseClient.js";

const params = new URLSearchParams(window.location.search)
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

document.getElementById("createTaskForm").addEventListener("submit", async (event) => {
  event.preventDefault()

  const name = document.getElementById("name").value.trim();
  const description = document.getElementById("description").value.trim() || null;
  const sense_of_urgency = document.getElementById("sense_of_urgency").value;
  const status = document.getElementById("status").value;
  const due_at = document.getElementById("due_at").value || null;

  const { data: { session } } = await supabase.auth.getSession()
  const supabase_uid = session.user.id
  console.log(supabase_uid)

  const { error } = await supabase
  .from("task")
  .insert([{
    project_id: Number(projectId),
    name,
    description,
    sense_of_urgency,
    status,
    due_at,
    supabase_uid
  }])

  if (error) {
    console.log(error)
    alert("Failed to create a new task")
    return
  }

  alert("Task created successfully")
  const url = new URL("./project-details.html", window.location.href)
  url.searchParams.set("id", String(projectId))
  window.location.href = url.toString()
})