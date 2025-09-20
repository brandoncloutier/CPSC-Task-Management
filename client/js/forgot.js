// forgot.js file
document.addEventListener('DOMContentLoaded', function () {
  const openButtons = document.querySelectorAll('.forgot-open-button, #showForgot');
  const closeButton = document.querySelector('.forgot-close');
  const modalOverlay = document.getElementById('forgot-modalOverlay');
  const forgotContainer = document.getElementById('forgotContainer');
  const form = document.getElementById('forgot-form');

  function openModal() {
    modalOverlay.style.display = 'flex';
    forgotContainer.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOverlay.style.display = 'none';
    forgotContainer.style.display = 'none';
    document.body.style.overflow = 'auto';
  }

  window.openForgotModal = openModal;
  window.closeForgotModal = closeModal;

  // Open from "Forgot your password?" link
  openButtons.forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      window.closeLoginModal?.();
      window.closeSignupModal?.();
      openModal();
    });
  });

  closeButton?.addEventListener('click', function (e) {
    e.preventDefault();
    closeModal();
  });

  modalOverlay.addEventListener('click', function (e) {
    if (e.target === modalOverlay) closeModal();
  });

  // ESC closes 
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modalOverlay.style.display === 'flex') {
      closeModal();
    }
  });

  // Submit (placeholder)
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('forgotEmail')?.value?.trim();
    if (!email) {
      alert('Please enter your email.');
      return;
    }
    alert('If this email exists, a reset link will be sent.');
    closeModal();
  });

  // "Log In" link inside Forgot 
  const backToLogin = document.getElementById('forgotShowLogin');
  backToLogin?.addEventListener('click', function (e) {
    e.preventDefault();
    closeModal();
    window.openLoginModal?.();
  });
});
