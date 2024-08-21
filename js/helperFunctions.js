// Reset the sliders to their default values
function resetSliders() {
    document.getElementById('foodQuality').value = 0;
    document.getElementById('foodAmount').value = 0;
    document.getElementById('serviceQuality').value = 0;

    // Update the displayed slider values if you have dynamic labels
    document.getElementById('foodQualityValue').textContent = '0';
    document.getElementById('foodAmountValue').textContent = '0';
    document.getElementById('serviceQualityValue').textContent = '0';

    // Optionally, reset the extra comments section
    document.getElementById('extraComments').value = '';
}

function openLocationModal() {
    // Show the modal
    document.getElementById('locationModal').style.display = 'block';

    // Show the overlay (to prevent map interactions when the modal is open)
    document.getElementById('mapOverlay').style.display = 'block';
}

function closeLocationModal() {
    // Hide the modal
    document.getElementById('locationModal').style.display = 'none';

    // Hide the overlay (to allow for interactions with the map again)
    document.getElementById('mapOverlay').style.display = 'none';
}

// Functions for the rating modal
function openRatingModal() {
    // The overlay will still be up from the location and rating modals

    // Check to see if the user is logged in
    if (!checkUserLogin()) {
        // Close the location modal 
        closeLocationModal();

        // Open the sign in modal
        openSignInModal();
        return;
    }

    // Show the rating modal
    document.getElementById('ratingModal').style.display = 'block';
}

function closeRatingModal() {
    // The overlay will still be up from the location modal

    // Hide the rating modal
    document.getElementById('ratingModal').style.display = 'none';
}

function viewReviewsModalLocation() {
    const locationId = document.getElementById('hiddenLocationId').value;
    console.log(locationId);
    fetch(`http://localhost:3001/api/ratings/${locationId}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            displayRatings(data);

            // Show the view ratings modal
            document.getElementById('viewRatingsModal').style.display = 'block';
        })
        .catch(error => console.error('Error:', error));
}

function viewReviewsModalUser() {
    const userId = localStorage.getItem('user_id');
    fetch(`http://localhost:3001/api/user-reviews/${userId}`)
        .then(response => response.json())
        .then(data => {
            displayRatings(data);

            // Show the view ratings modal
            document.getElementById('viewRatingsModal').style.display = 'block';
        })
        .catch(error => console.error('Error:', error));
}

function closeViewReviewsModal() {
    // The overlay will still be up from the location modal

    // Hide the rating modal
    document.getElementById('viewRatingsModal').style.display = 'none';
}

function displayRatings(ratings) {
    const ratingsContainer = document.getElementById('ratingsContainer');
    ratingsContainer.innerHTML = ''; // Clear previous ratings
    ratings.forEach(rating => {
        // Create elements for review details and location name
        const reviewDiv = document.createElement('div');
        reviewDiv.classList.add('review');

        const locationNameP = document.createElement('button');
        locationNameP.textContent = `Location: ${rating.location_name}`;
        locationNameP.onclick = () => fetchAndZoomToLocation(rating.location_id);
        locationNameP.classList.add('location-name-viewReviews');

        const qualityP = document.createElement('p');
        qualityP.textContent = `Quality: ${rating.food_quality / 2}/5`;
        qualityP.classList.add('location-quality-viewReviews');

        const amountP = document.createElement('p');
        amountP.textContent = `Amount: ${rating.food_amount / 2}/5`;
        amountP.classList.add('location-food-viewReviews');

        const serviceP = document.createElement('p');
        serviceP.textContent = `Service: ${rating.service_quality / 2}/5`;
        serviceP.classList.add('location-service-viewReviews');

        const commentP = document.createElement('p');
        commentP.textContent = `Comment: ${rating.extra_comments}`;
        commentP.classList.add('location-comments-viewReviews');

        const imageP = document.createElement('img');
        imageP.src = `data:${rating.image_type};base64,${rating.image_data}`;
        imageP.classList.add('location-image-viewReviews');

        // Append the new elements to the reviewDiv
        reviewDiv.appendChild(locationNameP);
        reviewDiv.appendChild(qualityP);
        reviewDiv.appendChild(amountP);
        reviewDiv.appendChild(serviceP);
        reviewDiv.appendChild(commentP);
        reviewDiv.appendChild(imageP);

        // Append the reviewDiv to the reviewsContainer
        ratingsContainer.appendChild(reviewDiv);
    });
}

function openSignInModal() {
    // Show the overlay (to prevent map interactions when the modal is open)
    document.getElementById('mapOverlay').style.display = 'block';

    // Display the sign in modal
    document.getElementById('signInModal').style.display = 'block';
}

function closeSignInModal() {
    // Show the overlay (to prevent map interactions when the modal is open)
    document.getElementById('mapOverlay').style.display = 'none';

    // Hide the sign in modal
    document.getElementById('signInModal').style.display = 'none';
}

function openAccountCreationModal() {
    // Show the overlay (to prevent map interactions when the modal is open)
    document.getElementById('mapOverlay').style.display = 'block';

    // Display the account creation modal
    document.getElementById('accountCreationModal').style.display = 'block';
}

function closeAccountCreationModal() {
    // Hide the overlay
    document.getElementById('mapOverlay').style.display = 'none';

    // Hide the account creation modal
    document.getElementById('accountCreationModal').style.display = 'none';
}

function closeAccountInfoSidebar() {
    // Hide the overlay
    // document.getElementById('mapOverlay').style.display = 'none';

    // Remove the sidebar
    document.getElementById('userSidebar').classList.remove('open');
}

function switchToSignUp(event) {
    if (event) {
        event.preventDefault();
    }
    closeSignInModal(); // Close the Sign In Modal
    openAccountCreationModal(); // Open the Account Creation Modal
}

function switchToSignIn(event) {
    if (event) {
        event.preventDefault();
    }
    closeAccountCreationModal(); // Open the Account Creation Modal
    openSignInModal(); // Close the Sign In Modal
}

function logoutUser() {
    // Remove the user token from localStorage
    localStorage.clear();

    // Close the user info sidebar
    closeAccountInfoSidebar();

    // Refresh the page to update the UI (this needed to be adjusted to do this without refreshing the page)
    // window.location.reload();
    updateUserIcon();
}

// Function to check if the user is logged in
function checkUserLogin() {
    // Example check for user token in localStorage
    return localStorage.getItem('isLoggedIn') !== null;
}

// Function to change the icon and set up the new click behavior
function updateUserIcon() {
    const userIcon = document.getElementById('createAccountIcon');
    const userName = localStorage.getItem('username'); // Assuming the username is stored in localStorage

    if (userName) {
        // User is logged in, change the icon to a user profile icon
        userIcon.innerHTML = '<img src="../images/user.png" alt="User Profile" style="width: 50px; height: 50px;">'; // <a href="https://www.flaticon.com/free-icons/user" title="user icons">User icons created by Freepik - Flaticon</a>

        // Change the onclick behavior to show the username
        userIcon.onclick = function() {
            // Update the sidebar content
            document.getElementById('usernameDisplay').textContent = "Username: " + `${userName}`;
            // document.getElementById('homeLocation').textContent = "Home Location: " + homeLocation;
            // document.getElementById('recentReview').textContent = "Recent Review: " + recentReview;

            // Show the sidebar
            document.getElementById('userSidebar').classList.add('open');
        };
        // console.log('User is logged in');
    } else {
        // User is not logged in, change the icon back to the default create account icon
        userIcon.innerHTML = '<img src="../images/add-user.png" alt="Create Account" style="width: 50px; height: 50px;">'

        // Optionally, update the onclick behavior for the create account icon
        userIcon.onclick = function() {
            openSignInModal();
        };
        // console.log('User is logged out');
    }
}

// Example using a generic map object
function zoomToLocation(location) {
    // Check if a home location was found in local storage
    if (location) {
        // Parse the stored location back into an object
        var locationObj = JSON.parse(location);
        lat = locationObj.lat;
        lng = locationObj.lng;

        // Use the coordinates to set the map's view
        map.setView([lat, lng], 18);
    }
    // If there is no home location
    else {
        alert('No location found');
    }
}

// Function to set the home location
function setHomeLocation(locationId) {
    if (!checkUserLogin()) {
        // Close the location modal 
        closeLocationModal();

        // Open the sign in modal
        openSignInModal();
        return;
    }

    // Grab the location ID from the hidden input
    if (!locationId) {
        locationId = document.getElementById('hiddenLocationId').value;
    }

    // Get the coordinates for the location from the API
    fetch(`http://localhost:3001/api/location/${locationId}`)
        .then(response => response.json())
        .then(data => {
            // Check if the API call was successful
            if (data.success) {
                // Retrieve the latitude and longitude from the response
                const lat = data.values.latitude;
                const lng = data.values.longitude;

                // Set the local storage variable for the home location
                var coordinates = { lat: lat, lng: lng };
                localStorage.setItem('homeLocationCoords', JSON.stringify(coordinates));
                localStorage.setItem('homeLocationName', data.values.name);
                document.getElementById('homeLocationName').textContent = data.values.name;
            } else {
                // Handle the case when the API call fails
                alert('Failed to retrieve location coordinates.');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    
    // Add the new home location to the database
    fetch('http://localhost:3001/api/set-home-location', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            locationId: locationId,
            userId: localStorage.getItem('user_id'),
        }),
    })
}

// Function to go from locationId to locationCoordinates
function locationCords(locationId) {
    return new Promise((resolve, reject) => {
        fetch(`http://localhost:3001/api/location/${locationId}`)
            .then(response => response.json())
            .then(data => {
                // Check if the API call was successful
                if (data.success) {
                    // Return the coordinates
                    resolve(JSON.stringify({ lat: data.values.latitude, lng: data.values.longitude }));
                } else {
                    // Handle the case when the API call fails
                    reject('Failed to retrieve location coordinates.');
                }
            })
            .catch((error) => {
                reject(error);
            });
    });
}

// Async function to handle the ratings zoom
function fetchAndZoomToLocation(locationId) {
    locationCords(locationId)
        .then(location => {
            zoomToLocation(location);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Submit a rating to the database
function submitRating(formData) {
    fetch('http://localhost:3001/api/submit-rating', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
    .then(response => response.json())
    .then(data => {
        // Reset the slider values
        resetSliders();
        // Close the ratings modal
        document.getElementById('ratingModal').style.display = 'none';
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

// Update the average rating for a location
function updateAverageRating(formData) {
    fetch(`http://localhost:3001/api/average-rating/${formData.locationId}`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Get the updated value from the database to display
                fetch(`http://localhost:3001/api/average-rating/${formData.locationId}`, {
                    method: 'GET',
                    headers: {
                    'Content-Type': 'application/json',
                    },
                })
                    .then(response => response.json())
                    .then(data => {
                        // Update the rating in the location modal
                        // document.getElementById('locationRating').textContent = 'Rating: ' + parseFloat(data.average_rating).toFixed(2);

                        // Update the stars in the location modal (data.average_rating is out of 10 so have to / 2 to get out of 5)
                        document.querySelector('.stars .percent').style.width = `${(data.average_rating / 2) * 20}%`; // 20% per star
                    })
                    .catch(error => console.error('Error:', error));
            }
        })
        .catch(error => console.error('Error:', error));
}

// Async function for processing the image file
async function processFile(file) {
    return new Promise((resolve, reject) => {
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const base64String = reader.result.replace("data:", "").replace(/^.+,/, "");
                resolve({
                    foodImageBytes: base64String,
                    foodImageType: file.type,
                    foodImageName: file.name,
                });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        } else {
            resolve({});
        }
    });
}