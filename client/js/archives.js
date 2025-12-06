import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
    // loads completed projects and tasks from functions down below
    await loadCompletedProjectsAndTasks();
    // await loadCompletedTasks();
    // await loadCompletedProjects();
});

function setupSearch() {
  const searchInput = document.getElementById('archiveSearch');
  if (!searchInput) {
    return;
  }

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();

    document.querySelectorAll('.project-card').forEach(projectCard => {
      const projectText = projectCard.textContent.toLowerCase();
      const projectName = projectCard.querySelector('.project-name')?.textContent?.toLowerCase() || '';
      const projectDesc = projectCard.querySelector('.project-desc')?.textContent?.toLowerCase() || '';

      const projectMatches = !query || projectText.includes(query) || projectName.includes(query) || projectDesc.includes(query);

      if (projectMatches) {
        projectCard.style.display = 'block';

        if (query) {
          const taskElements = projectCard.querySelectorAll('.archived-task');
          let taskVisible = false;

          taskElements.forEach(task => {
            const taskText = task.textContent.toLowerCase();
            const taskName = task.querySelector('.task-title')?.textContent?.toLowerCase() || '';
            const taskDesc = task.querySelector('.task-description')?.textContent?.toLowerCase() || '';

            const taskMatches = taskText.includes(query) || taskName.includes(query) || taskDesc.includes(query);
            
            task.style.display = taskMatches ? 'block' : 'none';
            if (taskMatches) {
              taskVisible = true;
            }
          
          });
          const noTasks = projectCard.querySelector('.no-tasks');
          if (noTasks) {
            noTasks.style.display = taskVisible ? 'none' : 'block';
          }
        } else {
          projectCard.querySelectorAll('.archived-task').forEach(task => {
            task.style.display = 'block';
          });
        }
      } else {
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

        projectCard.style.display = anyTaskMatches ? 'block' : 'none';

        if (anyTaskMatches) {
          taskElements.forEach(task => {
            const taskText = task.textContent.toLowerCase();
            const taskName = task.querySelector('.task-title')?.textContent?.toLowerCase() || '';
            const taskDesc = task.querySelector('.task-description')?.textContent?.toLowerCase() || '';

            const taskMatches = taskText.includes(query) || taskName.includes(query) || taskDesc.includes(query);

            task.style.display = taskMatches ? 'block' : 'none';
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

// Restore a completed project and all its tasks  
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

  // get completed project details
  const { data: project, error: fetchError } = await supabase
    .from('completed_projects')
    .select('*')
    .eq('completed_project_id', completedProjectId)
    .single();

  if (fetchError || !project) {
    throw fetchError || new Error('Project not found');
  }

  // get all tasks for this completed project.
  const {data: projectTasks, error: tasksError} = await supabase
    .from('completed_tasks')
    .select('*')
    .eq('project_id', project.project_id)
    .eq('supabase_uid', user.id);

  if (tasksError) {
    console.error('Error fetching project tasks:', tasksError);
  }

  // get the user id
  const { data: userRow, error: userError} = await supabase
    .from('user')
    .select('user_id')
    .eq('supabase_uid', user.id)
    .single();

  if (userError || !userRow) {
    throw userError || new Error('User profile not found');
  }
  const userId = userRow.user_id;

  // start restoring project to project table
  try {
    const {error: insertProjectError} = await supabase.from('project').insert({
      project_id: project.project_id,
      supabase_uid: project.supabase_uid,
      name: project.name,
      description: project.description,
      duedate: project.duedate,
    });
    if (insertProjectError) {
      throw insertProjectError;
    }

    // restore all the tasks for this project if any exist...
    if (projectTasks && projectTasks.length > 0) {
      const tasksToRestore = projectTasks.map(task => ({
        project_id: task.project_id,
        supabase_uid: task.supabase_uid,
        name: task.name,
        description: task.description,
        sense_of_urgency: task.sense_of_urgency,
        status: task.status,
        due_at: task.due_date
      }));

      const { error: insertTasksError } = await supabase  
        .from('task')
        .insert(tasksToRestore); // restore the tasks
      
      if (insertTasksError) {
        throw insertTasksError;
      }

      // delete all the tasks from completed tasks table
      const { error: deleteTasksError} = await supabase
        .from('completed_tasks')
        .delete()
        .eq('project_id', project.project_id)
        .eq('supabase_uid', user.id);

      if (deleteTasksError) {
        throw deleteTasksError;
      }
    }

      // now finally just delete the project from completed projects table
      const {error: deleteProjectError}= await supabase
        .from('completed_projects')
        .delete()
        .eq('completed_project_id', completedProjectId);

      if (deleteProjectError) {
        throw deleteProjectError;
      }
    } catch (error) {
      console.error('Error in restoring project:', error);
      throw error;
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