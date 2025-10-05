document.addEventListener('DOMContentLoaded', function() {
    const loginLinks = document.querySelectorAll('#showLogin')
    const signupLinks = document.querySelectorAll('#showSignup')
    // const loginLinks = document.querySelectorAll('.login-open-button');
    // const signupLinks = document.querySelectorAll('.signup-open-button');
    // const loginModal = document.getElementById('showLogin');
    // const signupModal = document.getElementById('showSignup');

    //Show login and hide signup box
    function goLogin(e) {
        e?.preventDefault();
        window.closeSignupModal?.();
        window.closeForgotModal?.();
        window.openLoginModal?.();
    }

    function goSignup(e) {
        e?.preventDefault();
        window.closeLoginModal?.();
        window.closeForgotModal?.();
        window.openSignupModal?.();
    }

    loginLinks.forEach(a => {
        a.addEventListener('click', goLogin);
    });
    signupLinks.forEach(a => {
        a.addEventListener('click', goSignup);
    });

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });



    // loginOverlay.addEventListener('click', function (e) {
    //     if (e.target === modalOverlay) {
    //         window.closeLoginModal?.();
    //     }
    // });

    // signupOverlay.addEventListener('click', function(e) {
    //     if (e.target === modalOverlay) {
    //         window.closeSignupModal?.();
    //     }
    // });

    document.addEventListener('keydown', function(e) {
        if (e.key !== 'Escape') return;

        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
            if (modal.style.display === 'flex') {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });
});