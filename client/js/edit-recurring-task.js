import { supabase } from "./supabaseClient.js";

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search)
    const recurringTaskId = params.get('id')

    const form = document.getElementById('editRecurringTaskForm')
    const nameEl = document.getElementById('name')
    const descEl = document.getElementById('description')
    const urgencyEl = document.getElementById('sense_of_urgency')
    const statusEl = document.getElementById('status')
    const intervalValueEl = document.getElementById('interval_value')
    const intervalUnitEl = document.getElementById('interval_unit')
    const remindDaysEl = document.getElementById('remind_days_before')
    const isActiveEl = document.getElementById('is_active')
    const backBtn = document.getElementById('backBtn')

    if (!recurringTaskId) {
        alert("recurring task not found")
        return
    }

    let projectIdForReturn = null
    try {
        const { data: recurringTask, error } = await supabase
            .from("recurring_task")
            .select("recurring_task_id, project_id, name, description, sense_of_urgency, status, interval_value, interval_unit, remind_days_before, is_active")
            .eq('recurring_task_id', recurringTaskId)
            .single()

        if (error) throw error
        if (!recurringTask) throw new Error("Recurring task not found")

        projectIdForReturn = recurringTask.project_id

        nameEl.value = recurringTask.name || ''
        descEl.value = recurringTask.description || ''
        urgencyEl.value = recurringTask.sense_of_urgency || 'medium'
        statusEl.value = recurringTask.status || 'todo'
        intervalValueEl.value = recurringTask.interval_value || 1
        intervalUnitEl.value = recurringTask.interval_unit || 'week'
        remindDaysEl.value = recurringTask.remind_days_before || 0
        isActiveEl.value = recurringTask.is_active ? 'true' : 'false'
    } catch (error) {
        console.error(`Failed to load recurring task: ${error.message}`)
        alert('Failed to load recurring task')
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
            interval_value: parseInt(intervalValueEl.value) || 1,
            interval_unit: intervalUnitEl.value || 'week',
            remind_days_before: parseInt(remindDaysEl.value) || 0,
            is_active: isActiveEl.value === 'true',
            //updated_at: new Date().toISOString()
        }
        try {
            const { error: updErr } = await supabase
                .from('recurring_task')
                .update(payload)
                .eq('recurring_task_id', recurringTaskId)
                .select()
            if (updErr) throw updErr
            alert('Recurring task updated successfully.')
        

        if (projectIdForReturn) {
            const url = new URL('./project-details.html', window.location.href)
            url.searchParams.set('id', projectIdForReturn)
            window.location.href = url.toString()
        } else {
            window.location.href = './projects.html'
        }
    } catch (error) {
        console.error(`Update Failed: ${error.message}`)
        alert('Failed to update recurring task')
    }
    })
})