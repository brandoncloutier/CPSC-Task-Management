import {supabase} from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById("projectsContainer");
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
        alert('Please create an account or log in to get started!');
        window.location.href = './index.html';
        return;
    }

    try {
        // show loading state...
        container.innerHTML = "<p>Loading projects...</p>";

        // we query the "projects" table for all projects
        const { data: projects, error } = await supabase
            .from("project")
            .select("project_id, name, description, duedate")
            .order("duedate", { ascending: true });

        if (error) throw error;

        // No data, then tell there are no projects.
        if (!projects || projects.length === 0) {
            container.innerHTML = `
                <div class="no-project">
                <p> You have no projects yet. Click the button below to create your first project!</p>
                <a href="./create-project.html" class = "create-first-project-button"> Create Project</a>
                </div>
            `;
            return;
        }
        // Clear loading state
        container.innerHTML = "";

        // Create project cards
        projects.forEach(project => {
            const card = document.createElement("div");
            card.classList.add("project-card");
            card.innerHTML = `
                <h2>${project.name}</h2>
                <p>${project.description || "No description provided."}</p>
                <p><strong>Due:</strong> ${project.duedate || "No due date set"}</p>
                <div class="project-buttons">
                    <button class="view-project-button" data-id="${project.project_id}">View Project</button>
                    <button class = "delete-project-button" data-id = "${project.project_id}">
                        <i data-lucide = "trash-2"></i>
                    </button>
                    <button class = "complete-project-button" data-id = "${project.project_id}">
                        <i data-lucide = "check"></i>
                    </button>
                </div>
                `;  
                container.appendChild(card);
                lucide.createIcons(); // re-create icons after adding new elements
        });

        const create_project_button = document.createElement("div");
        create_project_button.innerHTML = `<a href="./create-project.html"><button id="create-project-btn">Create Project</button></a>`
        create_project_button.id = "create-project-btn-wrapper"
        container.appendChild(create_project_button)

        container.addEventListener("click", (e) => {
            if (e.target.classList.contains("view-project-button")) {
                const projectId = e.target.dataset.id;
                window.location.href = `./project-details.html?id=${projectId}`
            }
            const deleteButton = e.target.closest('.delete-project-button');
            if (deleteButton) {
                const projectId = deleteButton.dataset.id;
                deleteProject(projectId, deleteButton);
            }

            const completeButton = e.target.closest('.complete-project-button');
            if (completeButton) {
                const projectId = completeButton.dataset.id;
                completeProject(projectId, completeButton);
            }
        })
    } catch (error) {
        console.error("Error loading projects:", error.message);
        const msg = error?.message || String(error);
        // if we can't load projects, show them the error message.
        container.innerHTML = `<p style ="color: red;"> Failed to load projects: ${msg}</p>`;
    }
});
// deleting the project if the user wants to
async function deleteProject(projectId, deleteButton) {
    const confirmed = confirm("Are you sure you want to delete this project? This action cannot be undone!");
    // if they don't confirm, just return.
    if (!confirmed) return;

    try {
        const originalIcon = deleteButton.innerHTML;
        deleteButton.innerHTML = '<i data-lucide="loader-2" class="spinner"></i>';
        if (window.lucide) {
            lucide.createIcons();
        }
        deleteButton.disabled = true;
        // delete the project from supabase
        const { error } = await supabase
            .from("project")
            .delete()
            .eq("project_id", projectId);
        if (error) throw error;
        // remove the project card from the UI
        const projectCard = deleteButton.closest('.project-card');
        projectCard.remove();

        // if successful, show a success message
        alert("Project deleted!");

        const remainingProjects = document.querySelectorAll('.project-card');
        if (remainingProjects.length === 0) {
            location.reload(); // reload to show "no projects" message
            //alert("No projects remaining. Please create a new project.");
        }
    } catch(error) {
        console.error("Error deleting project:", error.message);
        alert("Failed to delete project: " + (error?.message || String(error)));
        deleteButton.innerHTML = originalIcon;
        if (window.lucide) {
            lucide.createIcons();
        }
        deleteButton.disabled = false;
    }
}

// complete the project if the user clicks the green checkmark.
async function completeProject(projectId, completeProjectButton) {
    const complete = confirm("Are you sure you want to mark this project as completed?");
    if (!complete) {
        return;
    }

    try {
        const originalIcon = completeProjectButton.innerHTML;
        completeProjectButton.innerHTML = '<i data-lucide="loader-2" class = "spinner"></i>';
        if (window.lucide) {
            lucide.createIcons();
        }
        completeProjectButton.disabled = true // user has clicked the button now.

        const { data: project, error: fetchError } = await supabase 
            .from('project')
            .select("*")
            .eq("project_id", projectId)
            .single();

        if (fetchError) {
            throw fetchError;
        }

        // since we are marking the ENTIRE project as complete, we can safely assume that the tasks are also complete as well since the ENTIRE project has been marked done.
        // so get all the tasks for this project and automatically mark them as completed too.

        const { data: tasks, error: tasksError } = await supabase
            .from('task')
            .select('*')
            .eq('project_id', projectId)
            .eq('supabase_uid', project.supabase_uid);

        if (tasksError) {
            throw tasksError;
        }

        // now move the tasks to completed_tasks table as well
        if (tasks && tasks.length > 0) {
            const completedTasks = tasks.map(task => ({
                task_id: task.task_id,
                project_id: task.project_id,
                supabase_uid: task.supabase_uid,
                name: task.name,
                description: task.description,
                sense_of_urgency: task.sense_of_urgency,
                status: task.status,
                due_date: task.due_at,
                completed_at: new Date().toISOString()
            }));

            const {error: completeTasksError} = await supabase
                .from('completed_tasks')
                .insert(completedTasks) // insert the completed tasks.

            if (completeTasksError) {
                throw completeTasksError;
            }

            // now delete the tasks from OG tasks table
            const { error: deleteTaskError} = await supabase
                .from('task')
                .delete()
                .eq('project_id', projectId)
                .eq('supabase_uid', project.supabase_uid);
            
            if (deleteTaskError) {
                throw deleteTaskError;
            }
        }   

        // put the project into the completed projects table
        // basically transferring everything from OG projects table into our completed projects table
        const { error: archiveError } = await supabase
            .from("completed_projects")
            .insert({
                project_id: project.project_id,
                supabase_uid: project.supabase_uid,
                name: project.name,
                description: project.description,
                duedate: project.duedate
            });
        if (archiveError) {
            throw archiveError;
        }
        // delete the project from OG projects table
        const { error: deleteError } = await supabase
            .from("project")
            .delete()
            .eq("project_id", projectId);

        if (deleteError) {
            throw deleteError;
        }

        // now we remove the project from the actual page.
        const projectCard = completeProjectButton.closest('.project-card');
        projectCard.remove();
        // if there are no projects left, then reload the page so that it can inform the user that there are no projects now.
        const remainingProjects = document.querySelectorAll('.project-card');
        if (remainingProjects.length === 0) { 
            location.reload(); // this will reload the page and show the message that lets the user know they dont have anymore projects..
        }
    } catch (error) {
        console.error("Error with marking project as complete:", error.message);
        alert("Failed to mark project as complete: " + (error?.message || String(error)));
        completeProjectButton.innerHTML = originalIcon; 
        if (window.lucide) {
            lucide.createIcons();
        }
        completeProjectButton.disabled = false; // enable the button again after function is complete.
    }
}



// Search bar 
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('projectsContainer');
  const input = document.getElementById('searchProjects');
  const noResultsEl = document.getElementById('projectNoResults');
  if (!container || !input) return;

  const getCards = () => Array.from(container.querySelectorAll('.project-card'));

  const filter = (term) => {
    const q = term.toLowerCase().trim();
    let visible = 0;

    getCards().forEach(card => {
      const name = card.querySelector('h2')?.textContent?.toLowerCase() || '';
      const desc = card.querySelector('p')?.textContent?.toLowerCase() || '';
      const match = !q || name.includes(q) || desc.includes(q);
      card.style.display = match ? '' : 'none';
      if (match) visible++;
    });

    if (noResultsEl) noResultsEl.hidden = (visible > 0) || !q;
  };

  // live filter
  input.addEventListener('input', (e) => filter(e.target.value));
});
