import { supabase } from './supabaseClient.js';

// updates the navigation bar to show user's name/info if logged/signed in
export async function updateNavigationBar() {
    const { data: { user} } = await supabase.auth.getUser();
    const navContainer = document.querySelector('.nav__links');

    if (!navContainer) {
        return;
    }

    if (user) {
        // if user is logged in, get their profile info/data...
        const { data: profile} = await supabase
            .from('user')
            .select('name, username')
            .eq('supabase_uid', user.id)
            .single();

        const displayName = profile?.name || profile?.username || user.email?.split('@')[0] || 'Account';
    
        // replace nav with name of user
        navContainer.innerHTML = `
            <li><a href="./projects.html">Projects</a></li>
            <li class = "user-dropdown">
                <a href = "#" class = "nav-link">${displayName} &#x25BC;</a>
                <div class = "user-dropdown-content">
                    <a href = "#" class = "dropdown-item" id = "accountDetails"> Account Details </a>
                    <a href = "#" class = "dropdown-item" id ="logoutButton"> Log Out </a>
                </div>
            </li>
        `;

        setupUserDropdown(); // set up event listeners for dropdown items
    } else {
        // if no user, check if we're on home page and then show login/signup links
        
        const isHome = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');

        if (isHome) {
            navContainer.innerHTML = `
                <li><a href="./projects.html">Projects</a></li>
                <li><a href="#"> About</a></li>
                <li><a href = "#" class = "login-open-button"> Login </a></li>
                <li><a href = "#" class = "signup-open-button"> Signup </a></li>
            `;
        } else {
            navContainer.innerHTML = `
                <li><a href="./projects.html">Projects</a></li>
                <li><a href = "#" class = "login-open-button"> Login </a></li>
            `;
        }
        attachAuthModalListeners(); // re-attach login/signup modal listeners
    }
        
}

// function for user dropdown toggle 
function setupUserDropdown() {
    const dropdownBtn = document.querySelector('.user-dropdown .nav-link');
    const dropdownContent = document.querySelector('.user-dropdown-content');

    if (dropdownBtn && dropdownContent) {
        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownContent.classList.toggle('show');
        });

        // close dropdown if clicking outside
        document.addEventListener('click', () => {
            dropdownContent.classList.remove('show');
        });

        // account details
        const accountDetails = document.getElementById('accountDetails');
        if (accountDetails) {
            accountDetails.addEventListener('click', (e) => {
                e.preventDefault();
                dropdownContent.classList.remove('show');
                alert('Account details functionality coming soon!');
            });
        }
        // logout button
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', async (e) => {
                e.preventDefault(); 
                dropdownContent.classList.remove('show');
                alert('Log out functionality coming soon!');
            });
        }
    }
}

function attachAuthModalListeners() {
    const loginButtons = document.querySelectorAll('.login-open-button');
    const signupButtons = document.querySelectorAll('.signup-open-button');

    loginButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            window.openLoginModal?.();
        });
    });
    signupButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            window.openSignupModal?.();
        });
    });
}

// updateNavigationBar on page load...
document.addEventListener('DOMContentLoaded',  async () => {
   await updateNavigationBar();
});