import './style.css'

// 1. Inställningar (Anpassad till din HTTPS-port från Visual Studio)
const API_URL = "https://localhost:5111/api/cars";

// 2. DOM-referenser
const loadBtn = document.querySelector('#load-btn');
const carList = document.querySelector('#car-list');
const carForm = document.querySelector('#car-form');
const carIdInput = document.querySelector('#car-id');
const formTitle = document.querySelector('#form-title');
const submitBtn = document.querySelector('#submit-btn');
const cancelBtn = document.querySelector('#cancel-btn');

// ==========================================
// 🟢 READ (GET) - Hämta och visa alla bilar
// ==========================================
const fetchCars = async () => {
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`Fel vid hämtning: ${response.status}`);
        }

        const cars = await response.json();
        
        // Töm listan innan vi ritar ut på nytt
        carList.innerHTML = "";

        if (cars.length === 0) {
            carList.innerHTML = "<p>Det finns inga bilar i databasen.</p>";
            return;
        }

        // Loopa igenom bilarna och bygg HTML för varje kort
        cars.forEach(car => {
            const card = document.createElement('div');
            card.className = 'car-card';
            card.innerHTML = `
                <div>
                    <strong>${car.brand} ${car.model}</strong> (${car.year}) <br>
                    <span style="font-size: 0.9rem; color: #777;">Färg: ${car.color}</span>
                </div>
                <div class="btn-group">
                    <button class="outline" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" onclick="prepareEdit(${JSON.stringify(car).replace(/"/g, '&quot;')})">Redigera</button>
                    <button class="outline contrast" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" onclick="deleteCar(${car.id})">Ta bort</button>
                </div>
            `;
            carList.appendChild(card);
        });

    } catch (error) {
        console.error("Fel:", error);
        carList.innerHTML = `<p style="color: red;">Kunde inte hämta bilar. Körs ditt API på ${API_URL}?</p>`;
    }
};

// Event listener för ladda-knappen
loadBtn.addEventListener('click', fetchCars);