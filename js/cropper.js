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
    // Listen for an added picture
    document.getElementById('foodPicture').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('imageToCrop').src = e.target.result;
                document.getElementById('cropImageModal').style.display = 'block';

                // Destroy the existing cropper instance if it exists
                if (cropper) {
                    cropper.destroy();
                    cropper = null;
                }
                
                // Create the new cropper instance
                cropper = new Cropper(document.getElementById('imageToCrop'), {
                    aspectRatio: 1,
                    viewMode: 1,
                });
            };
            reader.readAsDataURL(file);
        }
    });

    // Listen for the crop button to be clicked
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

            // Clear the image source
            document.getElementById('imageToCrop').src = '';
        });
    });
}

// Function used to close the crop image modal and clean up the necessary elements
function closeCropImageModal() {
    // Update the foodPicture value and close the modal
    document.getElementById('foodPicture').value = '';
    document.getElementById('cropImageModal').style.display = 'none';

    // If there is a cropper instance, destroy it
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }

    // Clear the image source
    document.getElementById('imageToCrop').src = '';
}