async function encryptPassword(password, salt) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

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

// Add event listener for submission of the rating, account creation, and sign in forms
function addEventListeners() {
    // Listen for rating submission
    document.getElementById('ratingForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const fileInput = document.getElementById('foodPicture');
        const file = fileInput.files[0];

        // If a picture was submitted, process it
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
        event.preventDefault();

        const formData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
        };

        // Email validation
        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(formData.email)) {
            alert('Please enter a valid email address.');
            return;
        }

        // Password match validation
        if (document.getElementById('newPassword').value !== document.getElementById('newPasswordAgain').value) {
            alert('The passwords do not match.');
            return;
        }

        // Simple client-side password strength validation
        if (document.getElementById('newPassword').value.length < 8) {
            alert('Password must be at least 8 characters long.');
            return;
        }

        // TODO: Salt the password before sending it to the server
        (async function() {
            const salt = crypto.getRandomValues(new Uint8Array(16)).join('');
            const encryptedPassword = await encryptPassword(document.getElementById('newPassword').value, salt);
    
            formData['salt'] = salt;
            formData['password'] = encryptedPassword;
    
            // Pass the form data to the server
            fetch('http://localhost:3001/api/create-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })
            .then(response => response.json())
            .then(data => {
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
        })();
    });

    // Listen for sign in
    document.getElementById('signInForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = {
            email: document.getElementById('loginEmail').value,
            password: document.getElementById('loginPassword').value,
        };

        // Get the salt from the server for the account that is trying to be accessed
        fetch(`http://localhost:3001/api/get-salt/${formData.email}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Salt the password before sending it to the server
                (async function() {
                    const encryptedPassword = await encryptPassword(formData.password, data.salt);
                    formData['password'] = encryptedPassword;
                    attemptSignIn(formData)
                })();
            } else {
                alert('Failed to sign in: ' + data.message);
            }
        })
    });
}

function attemptSignIn(formData) { 
    // Pass the form data to the server
    fetch('http://localhost:3001/api/sign-in', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // User is successfully validated (email and password match)

            // Store information about the user in local storage
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', data.username);
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
}