document.addEventListener('DOMContentLoaded', function() {
    const loginLinks = document.querySelectorAll('.login-open-button');
    const signupLinks = document.querySelectorAll('.signup-open-button');
    const loginModal = document.getElementById('showLogin');
    const signupModal = document.getElementById('showSignup');
// document.addEventListener('DOMContentLoaded', function()
    // Show login and hide signup box
    function goLogin(e) {
        e?.preventDefault();
        window.closeSignupModal?.();
        window.openLoginModal?.();
    }

    function goSignup(e) {
        e?.preventDefault();
        window.closeLoginModal?.();
        window.openSignupModal?.();
    }

    loginLinks.forEach(a => {
        a.addEventListener('click', goLogin);
    });
    signupLinks.forEach(a => {
        a.addEventListener('click', goSignup);
    });

    showLogin?.addEventListener('click', goLogin);
    showSignup?.addEventListener('click', goSignup);

    loginOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) {
            window.closeLoginModal?.();
        }
    });

    signupOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            window.closeSignupModal?.();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key !== 'Escape') return;
        const loginOpen = document.getElementById('login-modalOverlay')?.style.display === 'flex';
        const signupOpen = document.getElementById('signup-modalOverlay')?.style.display === 'flex';
        if (loginOpen) {
            window.closeLoginModal?.();
        }

        if (signupOpen) {
            window.closeSignupModal?.();
        }
    });
});