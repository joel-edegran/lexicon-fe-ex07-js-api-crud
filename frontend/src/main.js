import './style.css'

const API_URL       = "http://localhost:5111/api/cars";

const loadBtn       = document.querySelector('#load-btn');
const carList       = document.querySelector('#car-list');
const form          = document.querySelector('#form');
const carIdInput    = document.querySelector('#car-id');
const formTitle     = document.querySelector('#form-title');
const submitBtn     = document.querySelector('#submit-btn');
const cancelBtn     = document.querySelector('#cancel-btn');

// State flag
let isCarsLoaded    = false;

// Functions


// Helper functions

// Helper function to render a car item in the list
const renderCar = (car) => {
    const carListItem = document.createElement('li');
    carListItem.className = 'car-list-item card';
    carListItem.dataset.id = car.id;
    carListItem.innerHTML = `
        <div>
            <strong>${car.brand} ${car.model}</strong> (${car.year}) <br>
            <span style="font-size: 0.9rem; color: #777;">Färg: ${car.color}</span>
        </div>
        <div class="btn-group">
            <button class="outline" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" onclick="prepareEdit(${JSON.stringify(car).replace(/"/g, '&quot;')})">Redigera</button>
            <button class="delete-btn outline contrast" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Ta bort</button>
        </div>
    `;
    carList.appendChild(carListItem);
}

// Helper function to format response status
const formatStatus = (response) => `${response.status} (${response.statusText})`;

// Helper function to log HTTP response status
const logStatus = (response, label = '') => {
    const prefix = label ? `[${label}] ` : '';
    console.log(`${prefix}Status: ${formatStatus(response)}`);
};

// Create
const addCar = async (event) => {
    event.preventDefault();

    const carData = {
        brand: form.brand.value,
        model: form.model.value,
        year: parseInt(form.year.value),
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
            renderCar(car);
            console.log("Adding car to list from response:", car);
        }
        
        form.reset();

    } catch (error) {
        console.error("Error:", error);
        alert("Could not add car.");
    }
    
};

// Read
const fetchCars = async () => {
    try {
        const response = await fetch(API_URL);
        logStatus(response, "Read");
        
        if (!response.ok) {
            throw new Error(`Error fetching cars: ${formatStatus(response)}`);
        }

        const cars = await response.json();
        console.log("Data from database:", cars);
        
        carList.innerHTML = "";

        if (cars.length === 0) {
            carList.innerHTML = `<li class="car-list-item card"><p>Det finns inga bilar i databasen.</p></li>`;
            return;
        }

        cars.forEach(car => renderCar(car));

        isCarsLoaded = true;

    } catch (error) {
        console.error("Error:", error);
        alert("Could not fetch cars.");
    }
};

// Update


// Delete
const deleteCar = async (id) => {
    if (!confirm("Är du säker på att du vill ta bort bilen?")) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        logStatus(response, "Delete");

        if (!response.ok) {
            throw new Error(`Error deleting car: ${formatStatus(response)}`);
        }

        // Remove the car from the UI
        const carListItem = document.querySelector(`[data-id="${id}"]`);
        if (carListItem) {
            carListItem.remove();
            console.log(`Successfully removed car with ID ${id} from DOM.`);
        }

    } catch (error) {
        console.error("Error:", error);
        alert("Could not delete car.");
    }
};

// Event
loadBtn.addEventListener('click', fetchCars);
form.addEventListener('submit', addCar);
carList.addEventListener('click', (event) => {
    const deleteBtn = event.target.closest('.delete-btn');
    if (deleteBtn) {
        const carListItem = deleteBtn.closest('.car-list-item');
        const carId = carListItem?.dataset.id;
        if (carId) {
            deleteCar(carId);
        }
    }
});
