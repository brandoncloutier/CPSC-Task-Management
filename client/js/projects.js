import {supabase} from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById("projectsContainer");

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
            container.innerHTML = "<p><italicize>No projects found. Please create one to get started.</italicize></p>";
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
