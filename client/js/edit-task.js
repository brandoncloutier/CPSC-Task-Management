import { supabase } from './supabaseClient.js'

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search)
  const taskId = params.get('id')

  const form = document.getElementById('editTaskForm')
  const nameEl = document.getElementById('name')
  const descEl = document.getElementById('description')
  const urgencyEl = document.getElementById('sense_of_urgency')
  const statusEl = document.getElementById('status')
  const dueEl = document.getElementById('due_at')
  const backBtn = document.getElementById('backBtn')

  if (!taskId) {
    alert("task not found")
    return
  }

  let projectIdForReturn = null
  try {
    const { data: task, error } = await supabase
      .from("task")
      .select("task_id, project_id, name, description, sense_of_urgency, status, due_at")
      .eq('task_id', taskId)
      .single()

    if (error) throw error
    if (!task) throw new Error("Task not found")

    projectIdForReturn = task.project_id

    nameEl.value = task.name || ''
    descEl.value = task.description || ''
    urgencyEl.value = task.sense_of_urgency || ''
    statusEl.value = task.status || 'todo'
    dueEl.value = task.due_at
  } catch (error) {
    console.error(`Failed to load task: ${error.message}`)
    alert('Failed to load task')
    return
  }

  if (backBtn && projectIdForReturn) {
    backBtn.addEventListener('click', (event) => {
      event.preventDefault()
      const url = new URL('./project-details.html', window.location.href)
      url.searchParams.set('id', projectIdForReturn)
      window.location.href = url.toString()
    })
  } else if (backBtn) { // meaning we can't find the project...
        backBtn.addEventListener('click', (event) => {
            event.preventDefault()
            window.location.href = './projects.html'
        })
    }

  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    const name = nameEl.value.trim()
    if (!name) {
      alert('Task name is required')
      nameEl.focus()
      return
    }

    const payload = {
      name,
      description: descEl.value.trim() || null,
      sense_of_urgency: urgencyEl.value || null,
      status: statusEl.value || null,
      due_at: dueEl.value || null
    }

    try {
      const { error: updErr } = await supabase
        .from('task')
        .update(payload)
        .eq('task_id', taskId)
      if (updErr) throw updErr

      if (projectIdForReturn) {
        const url = new URL('./project-details.html', window.location.href)
        url.searchParams.set('id', projectIdForReturn)
        window.location.href = url.toString()
      } else {
        window.location.href = './projects.html'
      }
    } catch (error) {
      console.error(`Update Failed: ${error.message}`)
      alert('Failed to update task')
    } 
  })
})