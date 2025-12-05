import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
    // loads completed projects and tasks from functions down below
    await loadCompletedProjectsAndTasks();
    // await loadCompletedTasks();
    // await loadCompletedProjects();
});

async function loadCompletedProjectsAndTasks() {
    // finds container where completed projects and tasks will be shown to user
    const projContainer = document.querySelector('.archive-grid-projects');
    const tasksContainer = document.querySelector('.archive-grid-tasks');

    if (tasksContainer) {
      tasksContainer.style.display = 'none';
      tasksContainer.parentElement.style.display = 'none';
    }

    // get the current user...
    const { data: {user} } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated.');
      return;
    }

    try {
      // get all completed projects
      const { data: projects, error: projectsError } = await supabase
        .from('completed_projects')
        .select("*")
        .eq('supabase_uid', user.id)
        .order('completed_at', { ascending: false});

        if (projectsError) {
          throw projectsError;
        }

        projContainer.innerHTML = ''; 

        if (!projects || projects.length == 0) {
          projContainer.innerHTML = '<p class= "no-data">No completed projects yet.</p>';
          return;
        }

        // get the completed tasks from each project
        for (const project of projects) {
          const { data: tasks, error: tasksError } = await supabase
            .from('completed_tasks') // from completed tasks table.
            .select("*")
            .eq('project_id', project.project_id)
            .eq('supabase_uid', user.id)
            .order('completed_at', { ascending: false});
            
          if (tasksError) {
            throw tasksError;
          }

          // build the tasks HTML
          let tasksHTML = '';
          if (tasks && tasks.length > 0) {
            tasksHTML = `
              <div class = "project-tasks">
                <h4>Completed Tasks:</h4>
                <div class="tasks-list">
                  ${tasks.map(task => `
                    <div class="archived-task" data-task-id="${task.completed_task_id}">
                    <div class = "task-header">
                      <strong class="task-title">${task.name}</strong>
                      ${task.sense_of_urgency ? `<span class="urgency-tag urgency-${task.sense_of_urgency.toLowerCase()}">${task.sense_of_urgency}</span>` : ''}
                </div>
                <div class="task-actions">
                    <button class = "btn-text restore-task-btn" data-id="${task.completed_task_id}">
                      Restore Task
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
            `;
          } else {
            tasksHTML = '<p class="no-tasks">No tasks were completed for this project.</p>';
          }
          // create the project card
          const projectCard = document.createElement('div');
          projectCard.className = 'project-card';
          projectCard.dataset.projectId = project.completed_project_id;

          projectCard.innerHTML = `
            <header class = "project-card-head">
              <h3 class = "project-name">${project.name}</h3>
            </header>
            <div class = "project-content">
              <p class="project-desc">${project.description || 'No description provided.'}</p>

              <div class="project-meta-row">
                <span class="chip">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx = "12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  Project completed on ${new Date(project.completed_at).toLocaleDateString()}
                </span>
                ${tasks && tasks.length > 0 ? 
                  `<span class="chip">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d = "M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                      ${tasks.length} completed task${tasks.length !== 1 ? 's' : ''}
                    </span>`
                    : ''
                }
            </div>

            ${tasksHTML}
          </div>
          <div class = "project-actions-row">
                <button class="btn-text restore-project-btn" data-id="${project.completed_project_id}">
                  Restore Project
                </button>
          </div>
          `;
          projContainer.appendChild(projectCard);
        }
    } catch (error) {
      console.error('Error loading projects with tasks:', error);
      projContainer.innerHTML = `<p class = "error-message">Error loading archive: ${error.message}</p>`;
    }
    setupSearch();
}

function setupSearch() {
  const searchInput = document.getElementById('archiveSearch');
  if (!searchInput) {
    return;
  }
  // event listener for when the user types inside the search box.
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim(); // convert search query to lower case and remove extra spaces (trim)

    document.querySelectorAll('.project-card').forEach(projectCard => { // search through each project card...
      const projectText = projectCard.textContent.toLowerCase(); // all text content inside project card including the tasks
      const projectName = projectCard.querySelector('.project-name')?.textContent?.toLowerCase() || ''; // gets just the name of the project, or empty string if the name can't be found.
      const projectDesc = projectCard.querySelector('.project-desc')?.textContent?.toLowerCase() || ''; // get project description
      // check to see if the project matches the search query (either entire text, name, or description works fine)
      const projectMatches = !query || projectText.includes(query) || projectName.includes(query) || projectDesc.includes(query);

      if (projectMatches) {
        projectCard.style.display = 'block'; // make sure project card is visible

        // now filter the tasks within the selected project
        if (query) {
          const taskElements = projectCard.querySelectorAll('.archived-task');
          let taskVisible = false;

          taskElements.forEach(task => { // loop through the tasks
            const taskText = task.textContent.toLowerCase();
            const taskName = task.querySelector('.task-title')?.textContent?.toLowerCase() || '';
            const taskDesc = task.querySelector('.task-description')?.textContent?.toLowerCase() || '';
            // so the task can be searched by it's text, name, or description...
            const taskMatches = taskText.includes(query) || taskName.includes(query) || taskDesc.includes(query); 

            task.style.display = taskMatches ? 'block' : 'none'; // show or hide the task if it matches
            if (taskMatches) {
              taskVisible = true; // if the task matches, then set taskVisible to true.
            }
          });

          const noTasks = projectCard.querySelector('.no-tasks'); // message to let user know when there are no tasks under the corresponding project
          if (noTasks) {
            noTasks.style.display = taskVisible ? 'none' : 'block'; // hide the message if tasks are visible, or show the message if no tasks can be found.
            }
          } else { // so show all of the tasks when nothing is typed into search bar
            projectCard.querySelectorAll('.archived-task').forEach(task => {
              task.style.display = 'block';
            });
          }
        } else {
          // if the projects text doesn't match the search, THEN start checking to see if any task matches.
          const taskElements = projectCard.querySelectorAll('.archived-task');
          let anyTaskMatches = false;

          taskElements.forEach(task => {
            const taskText = task.textContent.toLowerCase();
            const taskName = task.querySelector('.task-title')?.textContent?.toLowerCase() || '';
            const taskDesc = task.querySelector('.task-description')?.textContent?.toLowerCase() || '';

            if (taskText.includes(query) || taskName.includes(query) || taskDesc.includes(query)) {
              anyTaskMatches = true;
            }
          });
          // show the project card if at least one task matches the search query (since tasks are under projects)
          projectCard.style.display = anyTaskMatches ? 'block' : 'none';
          
          if (anyTaskMatches) {
            taskElements.forEach(task => {
              const taskText = task.textContent.toLowerCase();
              const taskName = task.querySelector('.task-title')?.textContent?.toLowerCase() || '';
              const taskDesc = task.querySelector('.task-description')?.textContent?.toLowerCase() || '';

              // check if this specific task matches
              const taskMatches = taskText.includes(query) || taskName.includes(query) || taskDesc.includes(query);

              task.style.display = taskMatches ? 'block' : 'none'; // show the matching tasks and hide the ones that don't match.
            });
          }
        }
    });
  });
}

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
  const projectBtn = e.target.closest('.restore-project-btn');
  if (projectBtn) {
    const projectId = projectBtn.dataset.id; // get the project id
    if (!projectId) {
      return;
    }

    const confirmRestore = window.confirm('Restore this project? It will move back to your projects list.');

    if (!confirmRestore) { // if user says no to restoring, then just return and dont restore
      return; 
    }

    projectBtn.disabled = true;
    projectBtn.textContent = 'Restoring...'; // if they say yes, then restore project

    try {
      await restoreProject(projectId); // call function to restore project (pass in the project ID)
      const projectCard = projectBtn.closest('.project-card');
      projectCard.remove(); // remove the project card from archives since it's now been restored.
    } catch (error) {
      console.error('Error restoring project:', error);
      projectBtn.disabled = false; // re-enable the button so user can try again
      projectBtn.textContent = 'Restore Project';
      alert('We could not restore your project. Please try again!');
    }
    return;
  }
  // now check for task restore button
  const taskBtn = e.target.closest('.restore-task-btn');
  if (taskBtn) {
    const taskId = taskBtn.dataset.id;
    if (!taskId) {
      return;
    }

    const confirmRestore = window.confirm('Restore this task? It will move back to your tasks list under the corresponding project.');
    if (!confirmRestore) {
      return;
    }

    taskBtn.disabled = true; // disable button
    taskBtn.textContent = 'Restoring...';

    try {
      await restoreTask(taskId); // now we call the restoreTask function.
      const taskElement = taskBtn.closest('.archived-task');
      taskElement.remove(); // now remove it from the archives page since it's been restored.

      // now we update the task count since we just removed the task from archives
      const projectCard = taskElement.closest('.project-card');
      const taskCountChip = projectCard.querySelector('.chip:nth-child(2)'); // second chip on project card
      if (taskCountChip) {
        const currentCount = parseInt(taskCountChip.textContent) || 0; // get the current count
        const newCount = currentCount - 1; // subtract one since a task has just been removed.

        if (newCount > 0) { // if we still have tasks left then update the chip count
          taskCountChip.innerHTML = `
            <svg width="16" height = "16" viewBox = "0 0 24 24" fill = "none" stroke="currentColor" stroke-width="2">
              <path d = "M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            ${newCount} completed task${newCount !== 1 ? 's': ''}
          `;
        } else {
          taskCountChip.remove(); // if its 0 or less, just remove the chip completely (no completed tasks)

          // check if any tasks are still left
          const tasksList = projectCard.querySelector('.tasks-list');
          const remainingTasks = tasksList.querySelectorAll('.archived-task');

          if (remainingTasks.length === 0) { // if no tasks are left.
            tasksList.innerHTML = '<p class="no-tasks">No tasks were completed for this project.</p>';
          }
        }
      }
    } catch (error) {
      console.error('Error restoring task:', error);
      taskBtn.disabled = false;
      taskBtn.textContent = 'Restore Task';
      alert('We could not restore the task. Please try again!');
    }
    return;
  }
});