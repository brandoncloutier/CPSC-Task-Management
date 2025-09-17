/*Ali, youtube tutorials were used for opening and closing functions of the MODAL. 
    "Build a Popup With JavaScript": https://www.youtube.com/watch?v=MBaw_6cPmAw&t=300s&ab_channel=WebDevSimplified
    "How to Make A Popup...": https://www.youtube.com/watch?v=AF6vGYIyV8M&ab_channel=GreatStack */
document.addEventListener('DOMContentLoaded', function () {
    const openButton = document.querySelector('.signup-open-button');
    const closeButton = document.querySelector('.signup-close');
    const modalOverlay = document.getElementById('signup-modalOverlay');
    const signupContainer = document.getElementById('signupContainer');
    const signupForm = document.getElementById('signup-form');

    function openModal() {
        modalOverlay.style.display = 'flex';
        signupContainer.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modalOverlay.style.display = 'none';
        signupContainer.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    openButton.addEventListener('click', openModal);
    closeButton.addEventListener('click', closeModal);

    modalOverlay.addEventListener('click', function (event) {
        if (event.target === modalOverlay) {
            closeModal();
        }
    });
    // Used Deepseek for the code below that triggers the closeModal() function when the user clicks the "escape" button.
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && modalOverlay.style.display === 'flex') {
            closeModal();
        }
    });
    const form = document.querySelector('#signup-form');
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        /* brandon, j, we start implementing the login functionality here. Whoever wants to do this ? */
        alert('signup functionality we will do later');
        closeModal();
    });
});