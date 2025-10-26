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
                            ${t.sense_of_urgency ? ` • <span><strong>Urgency:</strong> ${t.sense_of_urgency}</span>` : ''}
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

            // Search bar 
            const container = document.querySelector('.tasks-list');
            const input = document.getElementById('searchTasks');
            const noResultsEl = document.getElementById('taskNoResults');
            if (container && input) {
                const getCards = () => Array.from(container.querySelectorAll('.task-card'));

                const filter = (term) => {
                    const q = term.toLowerCase().trim();
                    let visible = 0;

                    getCards().forEach(card => {
                        const name = card.querySelector('.task-name')?.textContent?.toLowerCase() || '';
                        const desc = card.querySelector('.task-desc')?.textContent?.toLowerCase() || '';
                        const match = !q || name.includes(q) || desc.includes(q);
                        card.style.display = match ? '' : 'none';
                        if (match) visible++;
                    });

                    if (noResultsEl) noResultsEl.hidden = (visible > 0) || !q;
                };

                input.addEventListener('input', (e) => filter(e.target.value));
            }

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

        }

        // Call once to render tasks
        await loadTasks();


    } catch (error) {
        // log and show error message if something not working...
        console.error("Error loading project details:", error.message);
        const msg = error?.message || String(error);
        container.innerHTML = `<p style="color: red;">Failed to load project details: ${msg}</p>`;
    }
});


