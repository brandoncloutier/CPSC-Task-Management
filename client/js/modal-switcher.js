document.addEventListener('DOMContentLoaded', function() {
    const loginModal = document.getElementById('login-modalOverlay');
    const signupModal = document.getElementById('signup-modalOverlay');
// document.addEventListener('DOMContentLoaded', function()
    // Show login and hide signup box
    window.showLoginModal = function() {
        signupModal.style.display = 'none';
        loginModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    // Show signup and hide login box
    window.showSignupModal = function() {
        signupModal.style.display = 'flex';
        loginModal.style.display = 'none';
        document.body.style.overflow = 'hidden';
    };
    // show signup
    document.getElementById('showSignup')?.addEventListener('click', function(e) {
        e.preventDefault();
        window.showSignupModal();
    });

    // show login
    document.getElementById('showLogin')?.addEventListener('click', function(e) {
        e.preventDefault();
        window.showLoginModal();
    });

});