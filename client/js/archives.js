import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
    // loads completed projects and tasks from functions down below
    await loadCompletedProjects();
    await loadCompletedTasks();
});

// load completed projects from database
async function loadCompletedProjects() {
    // finds container where completed projects will be shown to user
    // will target last archive-section which is the projects section
    const projContainer = document.querySelector('.archive-grid-projects');

    // get the completed projects from the "completedProjects" table.
    const { data: projects, error } = await supabase
        .from('completed_projects')
        .select("*")
        .order('completed_at', { ascending: false });
    if (error) {
        console.error('Error loading completed projects:', error);
        return;
    }

    projContainer.innerHTML = ''; // clears existing content within container...
    projects.forEach(project => { // loops through each completed project and creates card for it
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        // includes the project name, description, and date that it was completed.
        projectCard.innerHTML = `
            <header class="project-card-head">
                <h3 class = "project-name"> ${project.name} </h3>
            </header>

            <p class = "project-desc">${project.description || 'No description made.'}</p>
            <div class = "project-meta-row">
                <span class = "chip"> Completed on ${new Date(project.completed_at).toLocaleDateString()}</span>
            </div>
            <div class = "project-actions-row">
                <button class = "btn-text restore-btn" data-id="${project.completed_project_id}"> Restore </button>
            </div>
        
        `;
        console.log(projectCard.innerHTML)
        // append completed project card 
        projContainer.appendChild(projectCard);
    });
}

// loads completed tasks...
async function loadCompletedTasks() {
    // first we find the container where the completed tasks are gonna be displayed
    // targets the first archive section which should be tasks section.
    let tasksContainer = document.querySelector('.archive-grid-tasks');

    // get info from completed tasks table
    const { data: tasks, error } = await supabase
        .from('completed_tasks')
        .select("*")
        .order('completed_at', { ascending: false });

    if (error) {
        console.error('Error loading completed tasks: ', error);
        return;
    }
    
    tasksContainer.innerHTML = ''; // clear any existing content from tasks container
    tasks.forEach(task => { // loops through each task and creates card for it.
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        // includes the task name, description, and date that it was completed
        taskCard.innerHTML = `
            <h3 class = "task-name">${task.name}</h3>
            <p class = "task-desc">${task.description || 'No description.'}</p>
            <div class = "task-meta">
                ${task.status ? `<span class = "chip urgency-${task.status}"> Archived Status: ${task.status}</span>` : ''}
                ${task.sense_of_urgency ? `<span class = "chip urgency-${task.sense_of_urgency}"> Archived Urgency: ${task.sense_of_urgency}</span>` : ''}
                <span class="chip">Completed on ${new Date(task.completed_at).toLocaleDateString()}</span>
            </div>
            <div class = "task-actions-row">
                <button class = "btn-text restore-btn" data-id="${task.completed_task_id}"> Restore </button>
            </div>
        `;
        // append completed task card
        tasksContainer.appendChild(taskCard);
    });
}

// Search bar
document.getElementById('archiveSearch')?.addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  document.querySelectorAll('.task-card, .project-card').forEach(c => {
    c.style.display = c.innerText.toLowerCase().includes(q) ? '' : 'none';
  });
});
