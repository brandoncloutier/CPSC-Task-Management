import {supabase} from './supabaseClient.js';
import { updateNavigationBar } from './navigation.js';

document.addEventListener('DOMContentLoaded', async () => {
    await loadUserData();
    await loadUserStatistics();

    const accountForm = document.getElementById('accountForm');
    accountForm.addEventListener('submit', handleProfileUpdate);
});

async function loadUserData() {
    try {
        // get user profile from supabase...
        const { data: profile, error } = await supabase
            .from('user')
            .select('*')
            .eq('supabase_uid', (await supabase.auth.getUser()).data.user.id)
            .single();

        if (error) {
            throw error;
        }

        if (profile) {
            document.getElementById('name').value = profile.name || '';
            document.getElementById('email').value = profile.email || '';
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        alert('Failed to load user data.')
    }
}

async function loadUserStatistics() {
    try {
        const { data: { user }} = await supabase.auth.getUser();

        // get how many projects the user currently has created.
        const { count: projectCount, error: projectError } = await supabase
            .from('project')
            .select('*', { count: 'exact', head: true})
            .eq('supabase_uid', user.id);

        if (projectError) {
            throw projectError;
        }

        // get how many total tasks the user has.
        const { count: taskCount, error: taskError } = await supabase
            .from('task')
            .select('*', { count: 'exact', head: true})
            .eq('supabase_uid', user.id);
        
        if (taskError) {
            throw taskError;
        }

        // add in green checkmark button for projects so that user can mark entire project as completed.

        document.getElementById('totalProjects').textContent = projectCount || 0;
        document.getElementById('totalTasks').textContent = taskCount || 0;
    } catch (error) {
        console.error('Error loading project and task count:', error);
    }
}

async function handleProfileUpdate(event) {
    event.preventDefault();

    const saveBtn = document.getElementById('saveBtn');
    const originalText = saveBtn.textContent;

    try {
        saveBtn.textContent = 'Saving your changes!'
        saveBtn.disabled = true;

        const { data: { user }} = await supabase.auth.getUser();

        const newName = document.getElementById('name').value.trim() || null;
        const newEmail = document.getElementById('email').value.trim() || null;

        const updates = {
            // name and email are updated...
            name: newName,
            email: newEmail,
        };

        // update the profile in the user table
        const { error } = await supabase
            .from('user')
            .update(updates)
            .eq('supabase_uid', user.id);
        if (error) {
            throw error;
        }

        // update user's email in database if changed
        const currentUser = await supabase.auth.getUser();
        if (currentUser.data.user.email !== updates.email) {
            const { error: emailError } = await supabase.auth.updateUser({
                email: updates.email
            });
            if (emailError) {
                throw emailError;
            }
        }

        alert('Profile updated successfully.');
        await updateNavigationBar();
    } catch (error) {
        console.error('Error updating profile:', error);
        alert(`Failed to update: ${error.message}`);
    } finally {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
    }
}