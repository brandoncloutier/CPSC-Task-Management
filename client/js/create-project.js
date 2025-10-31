import { supabase } from '../js/supabaseClient.js';

// shortcut for query selection
const $ = (selector, root = document) => root.querySelector(selector);

document.addEventListener('DOMContentLoaded', async () => {
  const form = $('#createProjectForm');
  if (!form) return;

  // Match the numeric user_id from your "user" table to the supabase_uid (used ChatGPT)
  let user_id = null;
  const { data: row, error: lookupErr } = await supabase
    .from('user')
    .select('user_id')
    .eq('supabase_uid', user.id)
    .maybeSingle();

  if (lookupErr || !row) {
    alert('Could not find your profile. Please contact an admin.');
    return;
  }

  user_id = row.user_id;

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = $('#projName')?.value.trim();
    const description = $('#projDesc')?.value.trim() || null;
    const duedate = $('#projDue')?.value || null;


    // Insert the project to the "project" table
    const { error: insertErr } = await supabase.from('project').insert({
      name,
      description,
      duedate,
      supabase_uid: user.id,
      user_id,
    });

    if (insertErr) {
      console.error('Insert failed:', insertErr);
      alert(`Could not create project: ${insertErr.message}`);
      return;
    }

    // First display an alert of success message and then redirect to the projects page 
    alert('Project created successfully!');
    window.location.href = './projects.html';
  });
});
