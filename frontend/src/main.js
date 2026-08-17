import './style.css'

const API_URL       = "http://localhost:5111/api/cars";

const loadBtn       = document.getElementById('load-btn');
const carList       = document.getElementById('car-list');
const formSection   = document.getElementById('form-section');
const form          = document.getElementById('form');
const carIdInput    = document.getElementById('car-id');
const formTitle     = document.getElementById('form-title');
const submitBtn     = document.getElementById('submit-btn');
const cancelBtn     = document.getElementById('cancel-btn');
const statusMessage = document.getElementById('status-message');

// State
let isCarsLoaded    = false;
let cars            = [];

// Functions


// Helper functions

// Helper function to generate HTML template for a car item
const createCarHTML = (car) => `
    <div>
        <strong>${car.brand} ${car.model}</strong> (${car.year}) <br>
        <span style="font-size: 0.9rem; color: #777;">Färg: ${car.color}</span>
    </div>
    <div class="btn-group">
        <button data-action="edit" class="outline" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Redigera</button>
        <button data-action="delete" class="outline contrast" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Ta bort</button>
    </div>`;

// Helper function to render a car item in the list
const renderCar = (car) => {
    const carListItem = document.createElement('li');
    carListItem.className = 'car-list-item card';
    carListItem.dataset.id = car.id;
    carListItem.innerHTML = createCarHTML(car);
    carList.appendChild(carListItem);
}

// Helper function to format response status
const formatStatus = (response) => `${response.status} (${response.statusText})`;

// Helper function to log HTTP response status
const logStatus = (response, label = '') => {
    const prefix = label ? `[${label}] ` : '';
    console.log(`${prefix}Status: ${formatStatus(response)}`);
};

// Form submission dispatcher to handle both create and update operations
const handleFormSubmit = async (event) => {
    event.preventDefault();

    const carID = carIdInput.value;

    if (carID) {
        // Update existing car
        await updateCar(carID);
    } else {
        // Create new car
        await addCar(event);
    }
};

// Reset form and UI state after submission or cancellation
const resetForm = () => {
    form.reset();
    carIdInput.value = '';
    formTitle.textContent = "Lägg till ny bil";
    submitBtn.textContent = "Lägg till";
    cancelBtn.hidden = true;
}

// Helper functions for status messaging
const showMessage = (message, type = 'info') => {
    if (!statusMessage) return;

    statusMessage.textContent = message;
    statusMessage.className = `alert alert-${type}`;
    statusMessage.hidden = false;
};

const clearMessage = () => {
    if (!statusMessage) return;

    statusMessage.textContent = '';
    statusMessage.className = '';
    statusMessage.hidden = true;

};

// Create
const addCar = async (event) => {
    clearMessage();

    const carData = {
        brand: form.brand.value,
        model: form.model.value,
        year: parseInt(form.year.value, 10),
        color: form.color.value
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(carData)
        });

        logStatus(response, "Create");

        if (!response.ok) {
            throw new Error(`Error creating car: ${formatStatus(response)}`);
        }

        if (!isCarsLoaded) {
            // If the list of cars hasn't been loaded yet, fetch and render all cars
            await fetchCars();
        } else {
            // If the list of cars is already loaded, just render the new car
            const car = await response.json();
            cars.push(car); // Update the cached list of cars
            renderCar(car);
            console.log("Adding car to list from response:", car);
        }
        
        resetForm();
        showMessage('Bilen har lagts till!', 'success');

    } catch (error) {
        console.error("Error:", error);
        showMessage('Could not add car.', 'danger');
    }
    
};

// Read
const fetchCars = async () => {
    clearMessage();

    try {
        const response = await fetch(API_URL);
        logStatus(response, "Read");
        
        if (!response.ok) {
            throw new Error(`Error fetching cars: ${formatStatus(response)}`);
        }

        cars = await response.json();
        console.log("Data from database:", cars);
        
        carList.innerHTML = "";

        if (cars.length === 0) {
            showMessage('Det finns inga bilar i databasen.', 'info');
            return;
        }

        cars.forEach(car => renderCar(car));

        isCarsLoaded = true;

    } catch (error) {
        console.error("Error:", error);
        showMessage('Could not fetch cars.', 'danger');
    }
};

// Update
const updateCar = async (id) => {
    clearMessage();

    const numericId = Number(id);

    const carData = {
        brand: form.brand.value,
        model: form.model.value,
        year: parseInt(form.year.value, 10),
        color: form.color.value
    };

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(carData)
        });

        logStatus(response, "Update");

        if (!response.ok) {
            throw new Error(`Error updating car: ${formatStatus(response)}`);
        }

        // Build updated object directly from form data when API returns 204 No Content
        const updatedCar = {
            id: numericId,
            ...carData
        };
        console.log(updatedCar);

        // Update the car in the UI
        const carListItem = document.querySelector(`[data-id="${numericId}"]`);
        if (carListItem) {
            carListItem.innerHTML = createCarHTML(updatedCar);
            console.log(`Successfully updated car with ID ${numericId} in DOM.`);
        }

        // Update cache
        const index = cars.findIndex(car => car.id === numericId);
        if (index !== -1) {
            cars[index] = updatedCar;
        }

        resetForm();
        showMessage('Bilen har uppdaterats!', 'success');

    } catch (error) {
        console.error("Error:", error);
        showMessage('Could not update car.', 'danger');
    }
};

// Delete
const deleteCar = async (id) => {
    clearMessage();

    const numericId = Number(id);

    if (!confirm("Är du säker på att du vill ta bort bilen?")) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${numericId}`, {
            method: 'DELETE'
        });

        logStatus(response, "Delete");

        if (!response.ok) {
            throw new Error(`Error deleting car: ${formatStatus(response)}`);
        }

        // Remove the car from the UI
        const carListItem = document.querySelector(`[data-id="${numericId}"]`);
        if (carListItem) {
            carListItem.remove();
            console.log(`Successfully removed car with ID ${numericId} from DOM.`);
        }

        // Update the cached list of cars
        cars = cars.filter(car => car.id !== numericId); 

        if (cars.length === 0) {
            showMessage('Det finns inga bilar i databasen.', 'info');
        } else {
            showMessage('Bilen har tagits bort!', 'success');
        }

    } catch (error) {
        console.error("Error:", error);
        showMessage('Could not delete car.', 'danger');
    }
};

// Prepare form for editing
const prepareEdit = (id) => {
    const numericId = Number(id);

    console.log("Setting up edit form for car ID:", numericId);
    const car = cars.find(car => car.id === numericId);
    
    if (!car) {
        console.error(`Car with ID ${numericId} not found.`);
        return;
    }
    
    console.log("Car to edit:", car);
    carIdInput.value = car.id;
    form.brand.value = car.brand;
    form.model.value = car.model;
    form.year.value = car.year;
    form.color.value = car.color;

    formTitle.textContent = "Redigera bil";
    submitBtn.textContent = "Spara ändringar";
    cancelBtn.hidden = false;

    formSection.scrollIntoView({ behavior: 'smooth' });
};

// Event Listeners
loadBtn.addEventListener('click', fetchCars);
form.addEventListener('submit', handleFormSubmit);

carList.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    
    const action = button.dataset.action;
    const carListItem = button.closest('.car-list-item');
    const carId = carListItem?.dataset.id;

    if (!carId) return;

    if (action === 'delete') {
        deleteCar(carId);
    } else if (action === 'edit') {
        prepareEdit(carId);
    }
});

cancelBtn.addEventListener('click', () => {
    clearMessage();
    resetForm();
});

// Initial state
showMessage('Klicka på knappen för att ladda in bilar...', 'info');