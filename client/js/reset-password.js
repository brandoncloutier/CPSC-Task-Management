import { supabase } from "./supabaseClient.js";


// Helper function to parse the #hash part of the URL
function parseHash(str) {
  // Remove the # from the beginning if it exists, and make it usable by URLSearchParams
  const params = new URLSearchParams((str || "").replace(/^#/, ""));
  // Convert the URLSearchParams into a normal JS object for easy access
  return Object.fromEntries(params.entries());
}

// Helper function to check if there is a valid Supabase session
async function hasSession() {
  const { data: { session } } = await supabase.auth.getSession();
  
  return Boolean(session);
}


// This function tries to "establish" a valid session for the password reset flow.
async function establishSession() {

  if (await hasSession()) return true;

  // Grab the current URL and its hash section
  const url = new URL(location.href);
  const h = parseHash(location.hash || "");

  // The link has both access_token and refresh_token in the hash   
  if (h.access_token && h.refresh_token) {
    // Using the tokens to set the Supabase session
    const { error } = await supabase.auth.setSession({
      access_token: h.access_token,
      refresh_token: h.refresh_token,
    });

    // If successful, session is established
    if (!error && await hasSession()) {
      history.replaceState({}, "", url.pathname + url.search); // removes sensitive tokens from URL
      return true;
    }
  }

  return false;
}

// Below code runs after the page loads
document.addEventListener("DOMContentLoaded", async () => {
  
  const form = document.getElementById("resetForm");
  const btn  = document.getElementById("resetBtn");

  // Try to establish a session using the URL tokens
  const ok = await establishSession();
  if (!ok) {
    // If it failed, an alert is shown
    alert("Your reset link is invalid or expired. Please request a new one.");
    form.querySelectorAll("input, button").forEach(el => el.disabled = true);
    return;
  }

  // Handle form submission when the user clicks “Update password” */
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent the page from reloading
    btn.disabled = true; // Disable the button so they can’t spam it

    // Get both password fields
    const pw  = document.getElementById("newPassword").value.trim();
    const pw2 = document.getElementById("confirmPassword").value.trim();

    // Basic validation checks before calling Supabase
    if (pw.length < 8) {
      alert("Password must be at least 8 characters.");
      btn.disabled = false;
      return;
    }

    if (pw !== pw2) {
      alert("Passwords do not match.");
      btn.disabled = false;
      return;
    }

    try {
      // Re-check if the recovery session still exists
      if (!(await hasSession())) {
        alert("Session expired. Please request a new reset link.");
        btn.disabled = false;
        return;
      }

      // Update the user’s password using Supabase
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) {
        alert("Could not update password. Please request a new link.");
        btn.disabled = false;
        return;
      }

      // If successful, a successful alert is hown
      alert("Password updated successfully. You can now log in with your new password.");


    } catch {
      // If something goes wrong (network issue, etc.)
      alert("Something went wrong. Please try again.");
    } finally {
      // Re-enable the button regardless of what happened
      btn.disabled = false;
    }
  });
});
