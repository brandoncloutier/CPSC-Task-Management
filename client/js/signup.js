/*Ali, youtube tutorials were used for opening and closing functions of the MODAL. 
    "Build a Popup With JavaScript": https://www.youtube.com/watch?v=MBaw_6cPmAw&t=300s&ab_channel=WebDevSimplified
    "How to Make A Popup...": https://www.youtube.com/watch?v=AF6vGYIyV8M&ab_channel=GreatStack */

import { supabase } from "./supabaseClient.js";

document.addEventListener('DOMContentLoaded', () => {
    const openButtons = document.querySelectorAll('.signup-open-button')
    const closeButton = document.querySelector(".signup-close")
    const modalOverlay = document.getElementById('signup-modalOverlay')
    const signupContainer = document.getElementById('signupContainer')
    const signupForm = document.getElementById('signup-form')
    const EYE = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>';
    const EYEOFF = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-off-icon lucide-eye-off"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>';

    const signupOverlay = document.getElementById('signup-modalOverlay')
    signupOverlay.addEventListener("click", (e) => {
        const btn = e.target.closest('.toggle-password')
        if (!btn) return
        const inputId = btn.getAttribute('data-target')
        const input = document.getElementById(inputId)
        if (!input) return
        const showing = input.type === 'password'
        input.type = showing ? 'text' : 'password'
        btn.innerHTML = showing ? EYE : EYEOFF
        btn.dataset.showing = String(showing)
        btn.setAttribute('aria-pressed', String(showing))
        btn.setAttribute('aria-label', showing ? 'Hide password' : 'Show password')
    })

    function openModal() {
        modalOverlay.style.display = 'flex'
        signupContainer.style.display = 'block'
        document.body.style.overflow = 'hidden'
    }

    function closeModal () {
        modalOverlay.style.display = 'none'
        signupContainer.style.display = 'none'
        document.body.style.overflow = 'auto'
    }

    window.openSignupModal = openModal
    window.closeSignupModal = closeModal

    openButtons.forEach(button => {
        button?.addEventListener("click", (e) => {
            e.preventDefault()
            openModal()
        })
    })

    closeButton?.addEventListener("click", (e) => {
        e.preventDefault()
        closeModal()
    })

    // make the username for the user table... if no first name, use part of their email before the @.
    // removes special characters, too.
    function makeUsername(email, firstName) {
        const base = (firstName && firstName.trim()) || (email?.split('@')[0] ?? 'user');
        return base.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 24);
    }

    // insert or update the profile row in the "user" table.
    async function upsertProfile({id, email, firstName}) {
        const username = makeUsername(email, firstName);
        const { error} = await supabase
            .from('user')
            .upsert(
                {
                    supabase_uid: id,
                    username,
                    email,
                    name: firstName || null // first name will be optional... some people won't provide their full name.
                },
                { onConflict: 'supabase_uid' }
            );
        // otherwise, throw error if fails
        if (error) throw error;
    }

    signupForm.addEventListener("submit", async (event) => {
        event.preventDefault()

        const firstName = document.getElementById('firstName').value.trim()
        const email = document.getElementById('signupEmail').value.trim()
        const password = document.getElementById('signupPassword').value
        const confirmPassword = document.getElementById('confirmPassword').value

        if (!email || !password) {
            alert("Please enter an email and password.")
            return;
        }

        if (password !== confirmPassword) {
            alert("The passwords don't match")
            return;
        }

        try {
            // attempt to sign up the user...
            let { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { first_name: firstName || null } }
            });

            if (error && /already registered/.test(error.message)) {
                alert("This email is already registered. Please log in instead!");
                closeSignupModal(); // so the user is already signed up, close signup modal
                openLoginModal(); // and open login modal for them.
                return;
            } else if (error) {
                throw error;
            }

            // make sure we have user data
            let user = data.user;
            if (!user) {
                const res = await supabase.auth.getUser(); // get logged in user
                user = res.data.user;
            }
            if (!user) throw new Error("No user returned after auth.");
            //alert("Successfully Signed Up!")

            // upsert profile row into table
            await upsertProfile({ id: user.id, email: user.email, firstName});

            alert("Account ready!");
        } catch (error) {
            console.error(error);
            alert(`Error with signup process: ${error.message}`);
        }
// guys, make sure to keep this two parantheses at the end.
    });
});
