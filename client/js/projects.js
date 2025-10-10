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
            container.innerHTML = "<p>No projects found. Please create one to get started.</p>";
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
                `;
                container.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading projects:", error.message);
        const msg = error?.message || String(error);
        // if we can't load projects, show them the error message.
        container.innerHTML = `<p style ="color: red;"> Failed to load projects: ${msg}</p>`;
    }
});