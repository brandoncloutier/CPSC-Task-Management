import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById("projectContainer");

    // Used Chatgpt and GeeksforGeeks to help me with this part
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("id");

    if (!projectId) {
        container.innerHTML = "<p> Project not found. </p>";
        return;
    }

    try {
        container.innerHTML = "<p> Loading project details...</p>";
        // Query the project from Supabase
        const { data: project, error } = await supabase
            .from("project")
            .select("project_id, name, description, duedate")
            .eq("project_id", projectId)
            .single();
        
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
    } catch (error) {
        console.error("Error loading project details:", error.message);
        const msg = error?.message || String(error);
        container.innerHTML = `<p style="color: red;">Failed to load project details: ${msg}</p>`;
    }
});