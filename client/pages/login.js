
const openModalButtons = document.querySelectorAll('[data-modal-target]')
const closeModalButtons = document.querySelectorAll('[data-close-button]')
const overlay = document.getElementById('overlay')

openModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        e.preventDefault();
        const modal = document.querySelector(button.dataset.modalTarget)
        openModal(container)
    })
})

closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modal = button.closest('.container')
        closeModal(container)
    })
})


function openModal(container) {
    if (container == null) return
    container.classList.add('active')
    overlay.classList.add('active')
}

function closeModal(container) {
    if (container == null) return
    container.classList.remove('active')
    overlay.classList.remove('active')
}
