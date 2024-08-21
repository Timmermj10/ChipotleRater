// Listen for updates to the sliders and update the span values
document.addEventListener('DOMContentLoaded', function() {
    // Ensure modals are loaded before executing modal-related code
    function waitForModals() {
        if (document.getElementById('signInModal')) {
            finishDom();
        } else {
            setTimeout(waitForModals, 100); // Check again after 100ms
        }
    }

    waitForModals(); 
});

function finishDom() {
    const updateSliderLabel = (sliderId, labelId) => {
        const slider = document.getElementById(sliderId);
        const label = document.getElementById(labelId);
        label.textContent = (slider.value / 2).toFixed(1);
        
        slider.addEventListener('input', function() {
            label.textContent = (this.value / 2).toFixed(1);
        });
    };

    updateSliderLabel('foodQuality', 'foodQualityValue');
    updateSliderLabel('foodAmount', 'foodAmountValue');
    updateSliderLabel('serviceQuality', 'serviceQualityValue');

    // If there is a user logged in
    if (checkUserLogin()) {
        updateUserIcon();

        // Update the home location name
        var homeLocationName = localStorage.getItem('homeLocationName');

        // If the home location name is in local storage
        if (homeLocationName) {
            document.getElementById('homeLocationName').textContent = homeLocationName;
        }

        // If not in local storage, check the database
        else {
            // Get the home location
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