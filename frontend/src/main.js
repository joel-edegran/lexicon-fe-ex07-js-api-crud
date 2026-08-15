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
            throw new Error(`Fel vid skapande: ${response.status}`);
        }

        const car = await response.json();
        renderCar(car);
        
        form.reset();

    } catch (error) {
        console.error("Fel:", error);
        alert("Kunde inte skapa bilen.");
    }
    
};

// Read
const fetchCars = async () => {
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`Fel vid hämtning: ${response.status}`);
        }

        const cars = await response.json();
        
        // Töm listan innan vi ritar ut på nytt
        list.innerHTML = "";

        if (cars.length === 0) {
            list.innerHTML = `<li class="list-item card"><p>Det finns inga bilar i databasen.</p></li>`;
            return;
        }

        // Loopa igenom bilarna och bygg HTML för varje kort
        cars.forEach(car => renderCar(car));

    } catch (error) {
        console.error("Fel:", error);
        alert(`<li class="list-item card"><p style="color: red;">Kunde inte hämta bilar. Körs ditt API på ${API_URL}?</p></li>`);
    }
};

// Update


// Delete


// Event
loadBtn.addEventListener('click', fetchCars);
form.addEventListener('submit', addCar);