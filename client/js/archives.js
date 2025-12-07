import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
    // loads completed projects and tasks from functions down below
    await loadCompletedTasks();
    await loadCompletedProjects();
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

    // get all the project IDs from tasks
    const projectIds = [...new Set(tasks.map(task => task.project_id))];

    // get project details from ACTIVE projects table first
    const { data: projects, error: projectsError } = await supabase
      .from('project')
      .select('project_id, name') // fetching the project name
      .in('project_id', projectIds);

    if (projectsError) {
      console.error('Error loading projects: ', projectsError);
    }

    // also try to get project details from completed projects table
    const { data: completedProjects, error: completedError} = await supabase
      .from('completed_projects')
      .select('project_id, name')
      .in('project_id', projectIds);

    if (completedError) {
      console.error('Error loading completed projects: ', completedError);
    }

    // create a map of project_id to the project name
    const projMap = {};
    // we add active projects (projects that are in progress) first
    if (projects) {
      projects.forEach(project => {
        projMap[project.project_id] = project.name;
      });
    }
    // then add completed projects in case active projects doesn't work
    if (completedProjects) {
      completedProjects.forEach(project => {
        projMap[project.project_id] = project.name;
      })
    }
    
    tasksContainer.innerHTML = ''; // clear any existing content from tasks container
    tasks.forEach(task => { // loops through each task and creates card for it.
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        // get project name from map/default
        const projectName = projMap[task.project_id] || `Project #${task.project_id}`;

        // includes the task name, description, and date that it was completed
        taskCard.innerHTML = `
            <h3 class = "task-name">${task.name}</h3>
            <p class = "task-desc">${task.description || 'No description.'}</p>
            <div class = "task-meta">
                <span class="chip project-chip clickable-project" 
                  data-project-id="${task.project_id}">
                  📁 ${projectName}
                </span>
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

document.addEventListener('click', async(e) => {
  const projChip = e.target.closest('.clickable-project');
  if (projChip) {
    const projectId = projChip.dataset.projectId;
    const projectName = projChip.dataset.projectName;

    // check if the project is active (not marked as completed)
    const {data:activeProject} = await supabase
      .from('project')
      .select('project_id')
      .eq('project_id', projectId)
      .single();

    if (activeProject) {
      window.location.href = `./project-details.html?id=${projectId}`;
    } else {
      alert(`"This project has been marked as completed and is currently archived. Restore it first to view it's details!`);
    }
  }
});

// Restore a completed task back into the task table
async function restoreTask(completedTaskId) {
  // Fetch the completed task
  const { data: task, error: fetchError } = await supabase
    .from('completed_tasks')
    .select('*')
    .eq('completed_task_id', completedTaskId)
    .single();

  if (fetchError || !task) {
    console.error('Error fetching completed task:', fetchError);
    throw fetchError || new Error('Task not found');
  }

  // Insert into the task table
  const { error: insertError } = await supabase
    .from('task')
    .insert({
      project_id: task.project_id,
      supabase_uid: task.supabase_uid,
      name: task.name,
      description: task.description,
      sense_of_urgency: task.sense_of_urgency,
      status: task.status,
      due_at: task.due_date
    });

  if (insertError) {
    console.error('Error inserting restored task:', insertError);
    throw insertError;
  }

  // Delete task from completed_tasks table
  const { error: deleteError } = await supabase
    .from('completed_tasks')
    .delete()
    .eq('completed_task_id', completedTaskId);

  if (deleteError) {
    console.error('Error deleting from completed_tasks:', deleteError);
    throw deleteError;
  }
}

// Restore a completed project back into the project table
async function restoreProject(completedProjectId) {
  // Get the current logged in user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('Error getting current user:', authError);
    throw authError || new Error('Not logged in');
  }

  // Get user_id from the user table
  const { data: userRow, error: userRowError } = await supabase
    .from('user')
    .select('user_id')
    .eq('supabase_uid', user.id)
    .single();

  if (userRowError || !userRow) {
    console.error('Error getting user_id from user table:', userRowError);
    throw userRowError || new Error('User profile not found');
  }

  const userId = userRow.user_id;

  // Fetch the completed project
  const { data: project, error: fetchError } = await supabase
    .from('completed_projects')
    .select('*')
    .eq('completed_project_id', completedProjectId)
    .single();

  if (fetchError || !project) {
    console.error('Error fetching completed project:', fetchError);
    throw fetchError || new Error('Project not found');
  }

  // Insert into project table 
  const { error: insertError } = await supabase.from('project').insert({
    project_id: project.project_id, 
    user_id: userId,
    supabase_uid: project.supabase_uid,
    name: project.name,
    description: project.description,
    duedate: project.duedate, 
  });

  if (insertError) {
    console.error(
      'Error inserting restored project:',
      insertError.message,
      insertError.details,
      insertError
    );
    throw insertError;
  }

  // Delete from completed_projects
  const { error: deleteError } = await supabase
    .from('completed_projects')
    .delete()
    .eq('completed_project_id', completedProjectId);

  if (deleteError) {
    console.error('Error deleting from completed_projects:', deleteError);
    throw deleteError;
  }
}


// Event listener for restore button 
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.restore-btn');
  if (!btn) return;

  const card = btn.closest('.task-card, .project-card');
  if (!card) return;

  const id = btn.dataset.id;

  const confirmRestore = window.confirm('Restore this item? It will move back to your projects/tasks list.');
  if (!confirmRestore) return;

  btn.disabled = true;
  btn.textContent = 'Restoring...';

  try {
    if (card.classList.contains('task-card')) {
      await restoreTask(id);
    } else if (card.classList.contains('project-card')) {
      await restoreProject(id);
    }

    // If successful, remove card 
    card.remove();
  } catch (err) {
    console.error('Error restoring item:', err);
    btn.disabled = false;
    btn.textContent = 'Restore';
    alert('Could not restore item. Please try again.');
  }
});

// Search bar
document.getElementById('archiveSearch')?.addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  document.querySelectorAll('.task-card, .project-card').forEach(c => {
    c.style.display = c.innerText.toLowerCase().includes(q) ? '' : 'none';
  });
});