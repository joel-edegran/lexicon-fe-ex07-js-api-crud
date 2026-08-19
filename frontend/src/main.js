// Imports & Configurations

import './style.css'

const API_URL = "http://localhost:5111/api/cars";

// DOM Elements

const loadBtn       = document.getElementById('load-btn');
const carList       = document.getElementById('car-list');
const formSection   = document.getElementById('form-section');
const form          = document.getElementById('form');
const carIdInput    = document.getElementById('car-id');
const formTitle     = document.getElementById('form-title');
const submitBtn     = document.getElementById('submit-btn');
const cancelBtn     = document.getElementById('cancel-btn');
const statusMessage = document.getElementById('status-message');
const carTemplate   = document.getElementById('car-item-template');

// Application State

let isCarsLoaded    = false;
let cars            = [];

// Helper Functions

// Helper function to format response status
const formatStatus = (response) => `${response.status} (${response.statusText})`;

// Helper function to log HTTP response status
const logStatus = (response, label = '') => {
    const prefix = label ? `[${label}] ` : '';
    console.log(`${prefix}Status: ${formatStatus(response)}`);
};

// Helper to parse backend response message (string text or JSON)
const getResponseMessage = async (response) => {
    try {
        const text = (await response.clone().text()).trim();
        if (!text) return null;

        const contentType = response.headers.get('content-type') || '';
        if (contentType?.includes('application/json')) {
            try {
                const data = JSON.parse(text);
                if (typeof data === 'string') return data;
                if (data && typeof data === 'object') {
                    return data?.message || data?.Message || data?.title || data?.detail || text;
                }
            } catch {
                return text;
            }
        }
        return text;
    } catch {
        return null;
    }
};

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

// Reset form and UI state after submission or cancellation
const resetForm = () => {
    form.reset();
    carIdInput.value = '';
    formTitle.textContent = "Lägg till ny bil";
    submitBtn.textContent = "Lägg till";
    cancelBtn.hidden = true;
};

// Helper function to populate car data into DOM elements
const populateCarElement = (element, car) => {
    element.querySelector('.car-title').textContent = `${car.brand} ${car.model}`;
    element.querySelector('.car-year').textContent = car.year;
    element.querySelector('.car-color').textContent = `Färg: ${car.color}`;
};

// Helper function to render a car item in the list
const renderCar = (car) => {
    const templateListItem = carTemplate.content.cloneNode(true);
    const carListItem = templateListItem.querySelector('.car-list-item');
    
    carListItem.dataset.id = car.id;
    populateCarElement(carListItem, car);

    carList.appendChild(carListItem);
}

// Event Handlers & Form Dispatchers

// Form submission dispatcher to handle both create and update operations
const handleFormSubmit = async (event) => {
    event.preventDefault();

    const carID = carIdInput.value;

    if (carID) {
        // Update existing car
        await updateCar(carID);
    } else {
        // Create new car
        await addCar();
    }
};

// Handler for form cancellation
const handleCancelClick = () => {
    clearMessage();
    resetForm();
};

// Handler for list action buttons (edit and delete)
const handleCarListClick = (event) => {
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
    carIdInput.value    = car.id;
    form.brand.value    = car.brand;
    form.model.value    = car.model;
    form.year.value     = car.year;
    form.color.value    = car.color;

    formTitle.textContent   = "Redigera bil";
    submitBtn.textContent   = "Spara ändringar";
    cancelBtn.hidden        = false;

    formSection.scrollIntoView({ behavior: 'smooth' });
};

// API / CRUD Functions

// Create
const addCar = async () => {
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
            const errorMsg = await getResponseMessage(response);
            throw new Error(errorMsg || `Error creating car: ${formatStatus(response)}`);
        }

        console.log("Create car:", carData);

        if (!isCarsLoaded) {
            // If the list of cars hasn't been loaded yet, fetch and render all cars
            await fetchCars();
        } else {
            // If the list of cars is already loaded, just render the new car
            const car = await response.json();

            if (!car || typeof car !== 'object') {
                throw new Error('Mottog ogiltig bildata från servern.');
            }

            cars.push(car); // Update the cached list of cars
            renderCar(car);
            console.log("Render car from response:", car);
        }
        
        resetForm();
        showMessage('Bilen har lagts till!', 'success');

    } catch (error) {
        console.error(error);
        showMessage(error.message || 'Could not add car.', 'danger');
    }
    
};

// Read
const fetchCars = async () => {
    clearMessage();

    try {
        const response = await fetch(API_URL);
        logStatus(response, "Read");
        
        if (!response.ok) {
            const errorMsg = await getResponseMessage(response);
            throw new Error(errorMsg || `Error fetching cars: ${formatStatus(response)}`);
        }
        
        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error('Mottog ogiltigt dataformat från servern.');
        }

        cars = data;
        isCarsLoaded = true;
        console.log("Fetch cars from database:", cars);

        carList.replaceChildren(); // Clear DOM elements
        
        if (cars.length === 0) {
            showMessage('Det finns inga bilar i databasen.', 'info');
            return;
        }

        cars.forEach(car => renderCar(car));

    } catch (error) {
        console.error(error);
        showMessage(error.message || 'Could not fetch cars.', 'danger');
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
            const errorMsg = await getResponseMessage(response);
            throw new Error(errorMsg || `Error updating car: ${formatStatus(response)}`);
        }

        // Build updated object directly from form data when API returns 204 No Content
        const updatedCar = {
            id: numericId,
            ...carData
        };

        // Update the car in the UI
        const carListItem = document.querySelector(`[data-id="${numericId}"]`);
        if (carListItem) {
            populateCarElement(carListItem, updatedCar);
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
        console.error(error);
        showMessage(error.message || 'Could not update car.', 'danger');
    }
};

// Delete
const deleteCar = async (id) => {
    clearMessage();
    const numericId = Number(id);

    if (!confirm("Är du säker på att du vill ta bort bilen?")) return;

    try {
        const response = await fetch(`${API_URL}/${numericId}`, { method: 'DELETE' });
        logStatus(response, "Delete");

        if (!response.ok) {
            const errorMsg = await getResponseMessage(response);
            throw new Error(errorMsg || `Error deleting car: ${formatStatus(response)}`);
        }

        const successData = await getResponseMessage(response);

        // Reset form if the car being deleted is currently loaded in the edit form
        if (Number(carIdInput.value) === numericId) {
            resetForm();
        }

        // Remove the car from the UI
        const carListItem = document.querySelector(`[data-id="${numericId}"]`);
        if (carListItem) {
            carListItem.remove();
            console.log(`Successfully removed car with ID ${numericId} from DOM.`);
        }

        // Update the cached list of cars
        cars = cars.filter(car => car.id !== numericId); 

        const statusText = successData || 'Bilen har tagits bort!';

        if (cars.length === 0) {
            showMessage(`${statusText} Det finns inga bilar i databasen.`, 'info');
        } else {
            showMessage(statusText, 'success');
        }

    } catch (error) {
        console.error(error);
        showMessage(error.message || 'Could not delete car.', 'danger');
    }
};

// Event Listeners

loadBtn.addEventListener('click', fetchCars);
form.addEventListener('submit', handleFormSubmit);
carList.addEventListener('click', handleCarListClick);
cancelBtn.addEventListener('click', handleCancelClick);

// Application Initialization

showMessage('Klicka på knappen för att ladda in bilar...', 'info');