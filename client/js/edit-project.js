import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
    // get the project ID...
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');

    if (!projectId) {
        alert('No project ID provided');
        window.location.href = './projects.html';
        return;
    }

    // Set up the back button...
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', (event) => {
            event.preventDefault();
            // goes back to project details getting the project ID from URL params
            window.location.href = `./project-details.html?id=${projectId}`;
        });
    }

    // Fetch existing project data...
    try {
        const { data: project, error } = await supabase
            .from('project')
            .select("project_id, name, description, duedate")
            .eq("project_id", projectId)
            .single(); // for one project...
        if (error) {
            throw error;
        }
        if (!project) {
            alert('Project not found');
            window.location.href = './projects.html';
            return;
        }

        // fill in the form fields with existing data...
        document.getElementById("projName").value = project.name || "";
        document.getElementById("projDesc").value = project.description || "";
        // we have to format the date to YYYY-MM-DD for input type="date"
        if (project.duedate) {
            const dueDate = new Date(project.duedate);
            const formatDate = dueDate.toISOString().split('T')[0];
            document.getElementById("projDue").value = formatDate;
        }

    } catch (error) {
        console.error('Error fetching project data:', error);
        alert('Failed to load project data');
        window.location.href = './projects.html';
    }

    // form submission (getting the new values that the user put in and then updating the project)
    const form = document.getElementById('editProjectForm');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document.getElementById("projName").value.trim();
        const description = document.getElementById("projDesc").value.trim() || null;
        const duedate = document.getElementById("projDue").value || null;

        try {
            const { error } = await supabase
                .from('project')
                .update({
                    name,
                    description,
                    duedate,
                    updated_at: new Date().toISOString()
                })
                .eq('project_id', projectId);
            if (error) {
                throw error;
            }
            alert('Project updated successfully!');
            window.location.href = `./project-details.html?id=${projectId}`;

        } catch (error) {
            console.error('Error updating project:', error);
            alert(`Could not update project: ${error.message}`);
        }
    });
});
