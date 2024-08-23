document.addEventListener('DOMContentLoaded', function() {
    // Ensure modals are loaded before executing modal-related code
    function waitForModals() {
        if (document.getElementById('signInModal')) {
            addEventListeners();
        } else {
            setTimeout(waitForModals, 100); // Check again after 100ms
        }
    }

    waitForModals();
});

function addEventListeners() {
    // Handle form submission for the ratings form
    document.getElementById('ratingForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const fileInput = document.getElementById('foodPicture');
        const file = fileInput.files[0];

        // If a file was uploaded, wait for it to be processed
        if (file) {
            processFile(file)
                .then(imageInfo => {
                    const formData = { 
                        locationId: document.getElementById('hiddenLocationId').value,
                        foodQuality: document.getElementById('foodQuality').value,
                        foodAmount: document.getElementById('foodAmount').value,
                        serviceQuality: document.getElementById('serviceQuality').value,
                        timeTaken: parseInt(document.getElementById('timeTaken').value) || 0,
                        extraComments: document.getElementById('extraComments').value,
                        foodImageType: imageInfo.foodImageType, 
                        foodImageName: imageInfo.foodImageName,
                        foodImageBytes: imageInfo.foodImageBytes,
                        userId: localStorage.getItem('user_id'),
                    };
                    console.log(formData);
                    console.log(JSON.stringify(formData));

                    // Submit the form data
                    submitRating(formData);

                    // Update the average rating
                    updateAverageRating(formData);
                })
                .catch(error => console.error('Error:', error));
        }
        else {
            const formData = { 
                locationId: document.getElementById('hiddenLocationId').value,
                foodQuality: document.getElementById('foodQuality').value,
                foodAmount: document.getElementById('foodAmount').value,
                serviceQuality: document.getElementById('serviceQuality').value,
                timeTaken: parseInt(document.getElementById('timeTaken').value) || 0,
                extraComments: document.getElementById('extraComments').value,
                userId: localStorage.getItem('user_id'),
            };
            console.log(formData);
            console.log(JSON.stringify(formData));

            // Submit the form data
            submitRating(formData);

            // Update the average rating
            updateAverageRating(formData);
        }

        // Reset the file input to clear the image
        document.getElementById('foodPicture').value = '';
    });

    // Listen for account creation
    document.getElementById('accountCreationForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting the traditional way

        const formData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            password: document.getElementById('newPassword').value,
            confirmPassword: document.getElementById('newPasswordAgain').value,
        };

        // Email validation
        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email pattern
        if (!emailPattern.test(formData.email)) {
            alert('Please enter a valid email address.');
            return; // Stop the function if the email is invalid
        }

        // Password match validation
        if (formData.password !== formData.confirmPassword) {
            alert('The passwords do not match.');
            return; // Stop the function if the passwords do not match
        }

        // Simple client-side validation example (should be more comprehensive)
        if (formData.password.length < 8) {
            alert('Password must be at least 8 characters long.');
            return;
        }

        fetch('http://localhost:3001/api/create-account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.success) {
                // Close the modal and reset the form
                document.getElementById('accountCreationModal').style.display = 'none';
                document.getElementById('mapOverlay').style.display = 'none';
                document.getElementById('accountCreationForm').reset();
                alert('Account created successfully!');
            } else {
                alert('Failed to create account: ' + data.message);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });

    // Listen for sign in form submission
    document.getElementById('signInForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting the traditional way

        const formData = {
            email: document.getElementById('loginEmail').value,
            password: document.getElementById('loginPassword').value,
        };
        
        fetch('http://localhost:3001/api/sign-in', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.success) {
                // User is successfully validated

                // Store information about the user in local storage
                // Store the login state
                localStorage.setItem('isLoggedIn', 'true');
                // Store username
                localStorage.setItem('username', data.username);
                // Store user_id
                localStorage.setItem('user_id', data.user_id);

                // Close the modal, hide the overlay, reset the form
                document.getElementById('signInModal').style.display = 'none';
                document.getElementById('mapOverlay').style.display = 'none';
                document.getElementById('signInForm').reset();
                
                // Update the user icon
                updateUserIcon();
            } else {
                alert('Failed to sign in: ' + data.message);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });
}