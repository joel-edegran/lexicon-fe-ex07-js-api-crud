import './style.css'

const API_URL       = "http://localhost:5111/api/cars";

const loadBtn       = document.querySelector('#load-btn');
const list          = document.querySelector('#list');
const form          = document.querySelector('#form');
const carIdInput    = document.querySelector('#car-id');
const formTitle     = document.querySelector('#form-title');
const submitBtn     = document.querySelector('#submit-btn');
const cancelBtn     = document.querySelector('#cancel-btn');

// Functions

const renderCar = (car) => {
    const item = document.createElement('li');
    item.className = 'list-item card';
    item.dataset.id = car.id;
    item.innerHTML = `
        <div>
            <strong>${car.brand} ${car.model}</strong> (${car.year}) <br>
            <span style="font-size: 0.9rem; color: #777;">Färg: ${car.color}</span>
        </div>
        <div class="btn-group">
            <button class="outline" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" onclick="prepareEdit(${JSON.stringify(car).replace(/"/g, '&quot;')})">Redigera</button>
            <button class="outline contrast" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" onclick="deleteCar(${car.id})">Ta bort</button>
        </div>
    `;
    list.appendChild(item);
}

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

        if (!response.ok) {
            throw new Error(`Error creating car: ${response.status}`);
        }

        const car = await response.json();
        
        if (!isCarsLoaded) {
            // If the list of cars hasn't been loaded yet, fetch and render all cars
            await fetchCars();
        } else {
            // If the list of cars is already loaded, just render the new car
            renderCar(car);
        }
        
        form.reset();

        console.log("Status:", response.status);
        console.log("Response:", car);

    } catch (error) {
        console.error("Error:", error);
        alert("Could not add car.");
    }
    
};

// Read
const fetchCars = async () => {
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`Error fetching cars: ${response.status}`);
        }

        const cars = await response.json();
        
        list.innerHTML = "";

        if (cars.length === 0) {
            list.innerHTML = `<li class="list-item card"><p>Det finns inga bilar i databasen.</p></li>`;
            return;
        }

        cars.forEach(car => renderCar(car));

        isCarsLoaded = true;

        console.log("Status:", response.status);
        console.log("Data from database:", cars);

    } catch (error) {
        console.error("Error:", error);
        alert("Could not fetch cars.");
    }
};

// Update


// Delete


// Event
loadBtn.addEventListener('click', fetchCars);
form.addEventListener('submit', addCar);