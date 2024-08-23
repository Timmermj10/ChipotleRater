// Initialize the cropper
let cropper;

// Listen for updates to the sliders and update the span values
document.addEventListener('DOMContentLoaded', function() {
    // Ensure modals are loaded before executing modal-related code
    function waitForModals() {
        if (document.getElementById('signInModal')) {
            finishCrop();
        } else {
            setTimeout(waitForModals, 100); // Check again after 100ms
        }
    }

    waitForModals(); 
});

function finishCrop() {
    document.getElementById('foodPicture').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('imageToCrop').src = e.target.result;
                document.getElementById('cropImageModal').style.display = 'block';
                cropper = new Cropper(document.getElementById('imageToCrop'), {
                    aspectRatio: 1,
                    viewMode: 1,
                });
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('cropButton').addEventListener('click', function() {
        const canvas = cropper.getCroppedCanvas();
        canvas.toBlob(function(blob) {
            const fileInput = document.getElementById('foodPicture');
            const file = new File([blob], 'croppedImage.png', { type: 'image/png' });

            // Create a new DataTransfer object and add the cropped file to it
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);

            // Update the file input with the new DataTransfer object
            fileInput.files = dataTransfer.files;

            // Hide the crop modal
            document.getElementById('cropImageModal').style.display = 'none';
        });
    });
}

function closeCropImageModal() {
    document.getElementById('cropImageModal').style.display = 'none';
    if (cropper) {
        cropper.destroy();
    }
}