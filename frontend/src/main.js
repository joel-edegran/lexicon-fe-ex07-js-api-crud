import './style.css';
import * as api from './api.js';
import * as ui from './ui.js';

let isCarsLoaded = false;
let cars = [];

// Fetch and render cars
const handleFetchCars = async () => {
    ui.clearMessage();
    try {
        const data = await api.getCars();
        cars = data;
        isCarsLoaded = true;

        ui.clearCarList();

        if (cars.length === 0) {
            ui.showMessage('Det finns inga bilar i databasen.', 'info');
            return;
        }

        cars.forEach(car => ui.renderCar(car));
    } catch (error) {
        console.error(error);
        ui.showMessage(error.message || 'Could not fetch cars.', 'danger');
    }
};

// Form submit dispatcher
const handleFormSubmit = async (event) => {
    event.preventDefault();
    ui.clearMessage();

    const carId = ui.carIdInput.value;
    const carData = ui.getFormData();

    try {
        if (carId) {
            const numericId = Number(carId);
            await api.updateCar(numericId, carData);

            const updatedCar = { id: numericId, ...carData };
            const carListItem = document.querySelector(`[data-id="${numericId}"]`);
            if (carListItem) {
                ui.populateCarElement(carListItem, updatedCar);
            }

            const index = cars.findIndex(c => c.id === numericId);
            if (index !== -1) cars[index] = updatedCar;

            ui.resetForm();
            ui.showMessage('Bilen har uppdaterats!', 'success');
        } else {
            const createdCar = await api.createCar(carData);

            if (!isCarsLoaded) {
                await handleFetchCars();
            } else {
                cars.push(createdCar);
                ui.renderCar(createdCar);
            }

            ui.resetForm();
            ui.showMessage('Bilen har lagts till!', 'success');
        }
    } catch (error) {
        console.error(error);
        ui.showMessage(error.message || 'Operation failed.', 'danger');
    }
};

// Handle list clicks (edit/delete)
const handleCarListClick = async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const action = button.dataset.action;
    const carListItem = button.closest('.car-list-item');
    const numericId = Number(carListItem?.dataset.id);

    if (!numericId) return;

    if (action === 'edit') {
        const car = cars.find(c => c.id === numericId);
        if (car) ui.populateForm(car);
    } else if (action === 'delete') {
        if (!confirm("Är du säker på att du vill ta bort bilen?")) return;

        ui.clearMessage();
        try {
            const statusText = await api.deleteCar(numericId);

            if (Number(ui.carIdInput.value) === numericId) {
                ui.resetForm();
            }

            carListItem.remove();
            cars = cars.filter(c => c.id !== numericId);

            const message = statusText || 'Bilen har tagits bort!';
            ui.showMessage(cars.length === 0 ? `${message} Det finns inga bilar i databasen.` : message, cars.length === 0 ? 'info' : 'success');
        } catch (error) {
            console.error(error);
            ui.showMessage(error.message || 'Could not delete car.', 'danger');
        }
    }
};

// Event Listeners
ui.loadBtn.addEventListener('click', handleFetchCars);
ui.form.addEventListener('submit', handleFormSubmit);
ui.carList.addEventListener('click', handleCarListClick);
ui.cancelBtn.addEventListener('click', () => {
    ui.clearMessage();
    ui.resetForm();
});

// Initialization
ui.showMessage('Klicka på knappen för att ladda in bilar...', 'info');