const waitForModals = () => {
    // Ensure modals are loaded before executing modal-related code
    if (document.getElementById('signInModal')) {
        onUpdate();
    } else {
        setTimeout(waitForModals, 100); // Check again after 100ms
    }
}

// Update the slider labels as the slider is moved
const updateSliderLabel = (sliderId, labelId) => {
    const slider = document.getElementById(sliderId);
    const label = document.getElementById(labelId);
    label.textContent = (slider.value / 2).toFixed(1);
    
    slider.addEventListener('input', function() {
        label.textContent = (this.value / 2).toFixed(1);
    });
};

// Maintain login status and home location
const onUpdate = () => {
    // Update the sliders 
    updateSliderLabel('foodQuality', 'foodQualityValue');
    updateSliderLabel('foodAmount', 'foodAmountValue');
    updateSliderLabel('serviceQuality', 'serviceQualityValue');

    // If there is a user logged in
    if (checkUserLogin()) {
        // Update the user icon to reflect login status
        updateUserIcon();

        // Get the home location name from local storage
        var homeLocationName = localStorage.getItem('homeLocationName');

        // If the home location name is in local storage
        if (homeLocationName) {
            document.getElementById('homeLocationName').textContent = homeLocationName;
        }

        // If not in local storage, check the database
        else {
            // Send the user id to the server to get the home location id
            var homeLocationId;
            fetch(`http://localhost:3001/api/home-location/${localStorage.getItem('user_id')}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        homeLocationId = data.locationId;
                        setHomeLocation(homeLocationId);
                    }
                })
                .catch(error => console.error('Error:', error));
        }
    } 
}

// Listen for updates to the sliders and login status
document.addEventListener('DOMContentLoaded', waitForModals)