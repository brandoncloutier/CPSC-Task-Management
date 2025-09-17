/*Ali, youtube tutorials were used for opening and closing functions of the MODAL. 
            "Build a Popup With JavaScript": https://www.youtube.com/watch?v=MBaw_6cPmAw&t=300s&ab_channel=WebDevSimplified
            "How to Make A Popup...": https://www.youtube.com/watch?v=AF6vGYIyV8M&ab_channel=GreatStack */
document.addEventListener('DOMContentLoaded', function () {
    const openButton = document.querySelector('.login-open-button');
    const closeButton = document.querySelector('.login-close');
    const modalOverlay = document.getElementById('login-modalOverlay');
    const loginContainer = document.getElementById('loginContainer');
    const loginForm = document.getElementById('login-form');

    function openModal() {
        modalOverlay.style.display = 'flex';
        loginContainer.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modalOverlay.style.display = 'none';
        loginContainer.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    window.openLoginModal = openModal;
    window.closeLoginModal = closeModal;

    openButton?.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
    });

    closeButton?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
    });


    const form = document.querySelector('#login-form');
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        /* brandon, j, we start implementing the login functionality here. Whoever wants to do this ? */
        alert('login functionality we will do later');
        closeModal();
    });

});