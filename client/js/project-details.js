import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Get the container element to display project details
    const container = document.getElementById("projectContainer");

    // Used Chatgpt and GeeksforGeeks to help me with this part
    // extracting the project ID from URL... 
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("id");

    // if no project ID, show error message 
    if (!projectId) {
        container.innerHTML = "<p> Project not found. </p>";
        return;
    }

    try {
        // loading message
        container.innerHTML = "<p> Loading project details...</p>";
        // Query the project from Supabase
        const { data: project, error } = await supabase
            .from("project")
            .select("project_id, name, description, duedate")
            .eq("project_id", projectId)
            .single(); // we expect a single project (one project card)

        if (error) throw error;

        if (!project) {
            container.innerHTML = "<p> Project not found. </p>";
            return;
        }

        // format the date
        const formatDate = (dateString) => {
            if (!dateString) return "No date set";
            return new Date(dateString).toLocaleDateString();
        };

        const dueDate = formatDate(project.duedate);

        container.innerHTML =
            `<button class = "back-button" onclick="window.location.href = './projects.html'"> Back to Projects </button>
            <div class = "project-header">
                <h1> ${project.name} </h1>
                <div class = "project-meta">
                    <strong>Due:</strong> ${dueDate}
                </div>
            </div>
            <div class = "project-description">
                <h3>Description</h3>
                <p>${project.description || "No description provided."}</p>
            </div>
            <div class = "project-actions">
                <button class = "edit-project-button">Edit Project</button>
                <button class = "add-task-button">Add Task</button>
                <button class = "add-recurring-task-button">Add Recurring Task</button>
            </div>
            <div class = "tasks-section">
                <h3>Tasks</h3>
                <p>Tasks functionality coming soon...</p>
            </div>`
            ;

        const addBtn = document.querySelector(".add-task-button")
        if (addBtn) {
            addBtn.addEventListener("click", () => {
                const url = new URL("./create-task.html", window.location.href)
                url.searchParams.set("project_id", projectId)
                window.location.href = url.toString()
            })
        }

        const editBtn = document.querySelector(".edit-project-button");
        if (editBtn) {
            editBtn.addEventListener("click", () => {
                const url = new URL("./edit-project.html", window.location.href);
                url.searchParams.set("id", projectId);
                window.location.href = url.toString();
            });
        }

        const addReccuringTaskBtn = document.querySelector(".add-recurring-task-button")
        if (addReccuringTaskBtn) {
            addReccuringTaskBtn.addEventListener("click", () => {
                const url = new URL("./create-recurring-task.html", window.location.href)
                url.searchParams.set("project_id", projectId)
                window.location.href = url.toString()
            })
        }

        // Load and render tasks for this project 
        async function loadTasks() {
            const tasksSection = document.querySelector('.tasks-section');
            if (!tasksSection) return;

            // show a loading state inside the tasks section
            tasksSection.innerHTML = `
                <h3>Tasks</h3>
                <p>Loading tasks...</p>
            `;


            const { data: tasks, error: taskErr } = await supabase
                .from('task')
                .select('task_id, project_id, name, description, due_at, status, sense_of_urgency')
                .eq('project_id', projectId)
                .order('due_at', { ascending: true });

            if (taskErr) {
                console.error('Error loading tasks:', taskErr);
                tasksSection.innerHTML = `
                    <h3>Tasks</h3>
                    <p style="color:#b91c1c;">Failed to load tasks: ${taskErr.message}</p>
                `;
                return;
            }

            // Show "no tasks yet" message
            if (!tasks || tasks.length === 0) {
                tasksSection.innerHTML = `
                    <h3>Tasks</h3>
                    <p>No tasks yet. Use "Add Task" to create one.</p>
                `;
                return;
            }

            // render the list (Used Chatgpt)
            const fmt = (d) => d ? new Date(d).toLocaleDateString() : '—';
            const list = document.createElement('div');
            list.className = 'tasks-list';

            tasks.forEach(t => {
                const card = document.createElement('div');
                card.className = 'task-card';
                card.innerHTML = `
                    <div>
                        <h4 class="task-name">${t.name}</h4>
                        <p class="task-desc">${t.description || 'No description provided.'}</p>
                        <div class="task-meta">
                            <span><strong>Due:</strong> ${fmt(t.due_at)}</span>
                            ${t.status ? ` • <span><strong>Status:</strong> ${t.status}</span>` : ''}
                            ${t.sense_of_urgency ? ` • <span class="urgency-tag urgency-${t.sense_of_urgency.toLowerCase()}"> ${t.sense_of_urgency}</span>` : ''}
                        </div>
                    </div>
                    <div class="task-actions">
                        <button
                            class="edit-task-btn"
                            data-task-id=${t.task_id}
                        >
                            Edit
                        </button>
                        <button
                            class="delete-task-btn"
                            data-task-id="${t.task_id}"
                        >
                            Delete
                        </button>
                        <button
                            class = "complete-task-btn"
                            data-task-id="${t.task_id}"
                        >
                            <i data-lucide="check"></i>
                    </div>
                `;
                list.appendChild(card);
            });

            // To keep search bar right above task cards
            tasksSection.innerHTML = `
            <h3>Tasks</h3>
            <div class="search-container">
                <input type="text" id="searchTasks" placeholder="Search tasks..." />
            </div>
            <p id="taskNoResults" class="no-results" hidden>No matching tasks.</p>
            `;
            tasksSection.appendChild(list);
            lucide.createIcons();

            list.addEventListener("click", (event) => {
                const editBtn = event.target.closest(".edit-task-btn")
                if (!editBtn) return

                const taskId = editBtn.getAttribute("data-task-id")
                if (!taskId) return

                const url = new URL("./edit-task.html", window.location.href)
                url.searchParams.set('id', taskId)
                window.location.href = url.toString()
            })

            list.addEventListener("click", async (event) => {
                const btn = event.target.closest('.delete-task-btn')
                if (!btn) return

                const taskId = btn.getAttribute("data-task-id")
                if (!taskId) return

                const ok = window.confirm("Delete this task?")
                if (!ok) return

                const card = btn.closest('.task-card');

                try {
                    const { error: deleteError } = await supabase
                        .from("task")
                        .delete()
                        .eq('task_id', taskId)

                    if (deleteError) throw deleteError

                    if (card) card.remove()

                    const remaining = list.querySelectorAll(".task-card").length
                    if (remaining === 0) {
                        tasksSection.innerHTML = `
                        <h3>Tasks</h3>
                        <p>No tasks yet. Use "Add Task" to create one.</p>
                        `
                    } else if (noResultsEl) {
                        noResultsEl.hidden = true
                    }
                } catch (error) {
                    console.error("delete faield")
                    alert(`failed to delete task: ${error.message}`)
                }
            })

            list.addEventListener("click", async (event) => {
                const completeBtn = event.target.closest('.complete-task-btn');
                if (completeBtn) {
                    const taskId = completeBtn.getAttribute("data-task-id");
                    if (!taskId) {
                        return;
                    }
                    await completeTask(taskId, completeBtn);
                    return;
                }
                
            })

        }
        // we used Deepseek and Gemini to help create our searchBar() function.
        function searchBar() {
            const input = document.getElementById('searchTasks');
            const noResultsEl = document.getElementById('taskNoResults');
            
            // if the search doesn't exist just exit.
            if (!input) {
                return; 
            }

            input.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                let visible = 0; // this will count how many visible tasks there are.
                let recurringCount = 0;
                // searching through each regular task (not recurring task)
                const regularTasks = document.querySelectorAll('.tasks-list .task-card')
                // 
                regularTasks.forEach(task => {
                    const isVisible = filterTaskCard(task, query);
                    if (isVisible) {
                        visible++; // if the task is visible, then increment counter.
                    }
                });
                // searching through each recurring task
                const recurringTasks = document.querySelectorAll('.recurring-body .task-card');
                recurringTasks.forEach(task => {
                    const isVisible = filterTaskCard(task, query);
                    if (isVisible) {
                        visible++; // increment again if recurring task is visible.
                        recurringCount++;
                    }
                });

                // this function will basically automatically expand the recurring tasks dropdown if there is a match
                if (recurringCount > 0 && query !== '') { // if the recurringCount is greater than 0 and the query is not empty...
                    const recurringBody = document.querySelector('.recurring-body');
                    const expandToggle = document.querySelector('.reccuring-toggle');

                    if (recurringBody) {
                        recurringBody.style.display = "block";
                        // update the toggle of the recurring dropdown to expand
                        if (expandToggle) {
                            expandToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-up-icon lucide-chevron-up"><path d="m18 15-6-6-6 6"/></svg>';
                        }
                    }


                }
                if (noResultsEl) {
                    // the "no results" message stays hidden if the visible count is above 0 (there are tasks that match the user's search) or if the query is empty (user hasn't searched for anything yet...).
                    noResultsEl.hidden = visible > 0 || query === '';
                }
            })

        }
        function filterTaskCard(card, query) {
            if (!query) {
                card.style.display = '' // show each task/recurring task card if the user hasn't searched for anything yet.
                return true;
            }

            const name = card.querySelector('.task-name')?.textContent?.toLowerCase() || '';
            const desc = card.querySelector('.task-desc')?.textContent?.toLowerCase() || '';
            const match = name.includes(query) || desc.includes(query); // this checks if the query matches the name or the description
            // this means that the user can search for a task based on it's name OR based on it's description.

            card.style.display = match ? '' : 'none'; // show the match if it's found.
            return match;
        }

        
        async function completeTask(taskId, completeBtn) {
            const complete = confirm("Mark this task as completed?");
            if (!complete) {
                return;
            }

            try {
                const originalIcon = completeBtn.innerHTML;
                completeBtn.innerHTML = '<i data-lucide = "loader-2" class = "spinner"></i>';
                if (window.lucide) {
                    lucide.createIcons();
                }
                completeBtn.disabled = true; // user has clicked button.

                const { data: task, error: fetchError } = await supabase
                    .from("task")
                    .select("*")
                    .eq("task_id", taskId)
                    .single();

                if (fetchError) {
                    throw fetchError;
                }

                // put the task into completed tasks table
                // basically transferring everything from OG tasks table into our completed tasks table
                const { error: archiveError } = await supabase
                    .from("completed_tasks")
                    .insert({
                        task_id: task.task_id,
                        project_id: task.project_id,
                        supabase_uid: task.supabase_uid,
                        name: task.name,
                        description: task.description,
                        sense_of_urgency: task.sense_of_urgency,
                        status: task.status,
                        due_date: task.due_at,
                        completed_at: new Date().toISOString() // completion date
                    });

                if (archiveError) {
                    throw archiveError;
                }

                // delete tasks from OG task table
                const { error: deleteError } = await supabase
                    .from("task")
                    .delete()
                    .eq("task_id", taskId);

                if (deleteError) {
                    throw deleteError;
                }

                // remove from actual page
                const taskCard = completeBtn.closest('.task-card');
                taskCard.remove();

                const tasksSection = document.querySelector('.tasks-section');
                const remainingTasks = document.querySelectorAll('.task-card');
                // if user deletes their last task, inform them that there are no more tasks (zero tasks)
                if (remainingTasks.length === 0) {
                    tasksSection.innerHTML = `
                        <h3>Tasks</h3>
                        <p> No tasks yet. </p>
                    `;
                } 
            } catch (error) {
                console.error("Error completing the task:", error.message);
                alert("Failed to complete task: " + (error?.message || String(error)));
                completeBtn.innerHTML = originalIcon;
                if (window.lucide) {
                    lucide.createIcons();
                }
                completeBtn.disabled = false; // enable the button to be pressed again.
            }
        }

        async function loadRecurringTasks() {
            const tasksSection = document.querySelector('.tasks-section')
            if (!tasksSection) return

           const { data: recurring_tasks, error: fetchError } = await supabase
                .from('recurring_task')
                .select('recurring_task_id, name, description, interval_value, interval_unit, sense_of_urgency, status, remind_days_before, is_active')
                .eq('project_id', projectId)
            
                if (fetchError) {
                    console.error('Error loading recurring tasks: ', fetchError)
                    body.innerHTML = '<p>Error Fetching recurring tasks</p>'
                    return
                }

                if (!recurring_tasks || recurring_tasks.length === 0) {
                    return
                }

            const recurringSection = document.createElement('div')
            recurringSection.className = 'recurring-section'
            tasksSection.insertAdjacentElement('afterend', recurringSection)

            recurringSection.innerHTML = `
                <div class="recurring-header">
                    <h3>Recurring Tasks</h3>
                    <span class="recurring-toggle">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-up-icon lucide-chevron-up"><path d="m18 15-6-6-6 6"/></svg>
                    </span>
                </div>
                <div class="recurring-body">
                    <p>Loading recurring tasks...</p>
                </div>
            `

            const body = recurringSection.querySelector('.recurring-body')
            const toggle = recurringSection.querySelector('.recurring-toggle')
            const header = recurringSection.querySelector('.recurring-header')

            header.addEventListener('click', () => {
                const isOpen = body.style.display === "block"
                if (isOpen) {
                    body.style.display = "none"
                    toggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-up-icon lucide-chevron-up"><path d="m18 15-6-6-6 6"/></svg>'
                } else {
                    body.style.display = "block"
                    toggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down-icon lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>'
                }
            })


                const list = document.createElement('div')
                list.className = 'tasks-list'

                recurring_tasks.forEach(recurring_task => {
                    const item = document.createElement('div')
                    item.className = 'task-card'

                    //const next = recurring_task.next_run_at ? new Date(recurring_task.next_run_at).toLocaleString().replace(',', ' •') : '-'
                    item.innerHTML =  `
                        <h4 class = "task-name">${recurring_task.name}</h4>
                        <p class = "task-desc">${recurring_task.description || 'No description made.'}</p>
                        <div class = "task-meta">
                            <span><bold>Every:</bold> ${recurring_task.interval_value} ${recurring_task.interval_unit}</span>
                            <span><bold>• Next Due Date:</bold> ${recurring_task.due_in_days} days </span>
                            <span><strong>• Status:</strong> ${recurring_task.status}</span>
                            <span class="urgency-tag urgency-${recurring_task.sense_of_urgency.toLowerCase()}">• Urgency:</strong> ${recurring_task.sense_of_urgency}</span>
                        </div>
                        <div class = "task-actions">
                            <button
                                class = "edit-task-btn" 
                                data-recurring-task-id=${recurring_task.recurring_task_id}
                            >
                                Edit
                            </button>
                            <button
                                class = "delete-task-btn"
                                data-recurring-task-id=${recurring_task.recurring_task_id}
                            >
                                Delete
                            </button>
                        </div>

                    `;
                    list.appendChild(item)
                });
                body.innerHTML = ''
                body.appendChild(list)

                // edit task event listener
                list.addEventListener("click", (event) => {
                    const editBtn = event.target.closest(".edit-task-btn")
                    if (!editBtn) return

                    const recurringTaskId = editBtn.getAttribute("data-recurring-task-id")
                    if (!recurringTaskId) return
                    alert("coming soon..")
                    // gonna have to implement the recurring task edit html later on.
                    // const url = new URL("./recurring-task-edit.html", window.location.href);
                    // url.searchParams.set('id', taskId)
                    // window.location.href = url.toString()
                })

                list.addEventListener("click", async (event) => {
                    const btn = event.target.closest('.delete-task-btn')
                    if (!btn) return

                    const recurringTaskId = btn.getAttribute("data-recurring-task-id")
                    if (!recurringTaskId) return

                    const ok = window.confirm("Delete this task?")
                    if (!ok) return

                    const card = btn.closest('.task-card')

                    try {
                        const { error: deleteError } = await supabase
                            .from("recurring_task")
                            .delete()
                            .eq('recurring_task_id', recurringTaskId)

                        if (deleteError) throw deleteError

                        if (card) card.remove()

                        const remainingTasks = list.querySelectorAll(".task-card").length
                        if (remainingTasks === 0) {
                            body.innerHTML = '<p> No recurring tasks yet. Use "Add Recurring Tasks" to create one. </p>'
                        }
                    } catch (error) {
                        console.error("Failed: ", error)
                        alert(`Failed to properly delete the task: ${error.message}`)
                    }

                })

                
        }

        // Call once to render tasks
        await loadTasks();
        await loadRecurringTasks()
        searchBar();


    } catch (error) {
        // log and show error message if something not working...
        console.error("Error loading project details:", error.message);
        const msg = error?.message || String(error);
        container.innerHTML = `<p style="color: red;">Failed to load project details: ${msg}</p>`;
    }
});