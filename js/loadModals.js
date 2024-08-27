// Load modals.html content and insert into the modals-container div
function loadModals() {
    fetch('../html/modals.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('modals-container').innerHTML = data;
        })
        .catch(error => console.error('Error loading modals:', error));
}

// Load the modals when the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', loadModals);