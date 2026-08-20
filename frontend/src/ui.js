// DOM Elements
export const loadBtn = document.getElementById('load-btn');
export const carList = document.getElementById('car-list');
export const formSection = document.getElementById('form-section');
export const form = document.getElementById('form');
export const carIdInput = document.getElementById('car-id');
export const formTitle = document.getElementById('form-title');
export const submitBtn = document.getElementById('submit-btn');
export const cancelBtn = document.getElementById('cancel-btn');
const statusMessage = document.getElementById('status-message');
const carTemplate = document.getElementById('car-item-template');

export const showMessage = (message, type = 'info') => {
    if (!statusMessage) return;
    statusMessage.textContent = message;
    statusMessage.className = `alert alert-${type}`;
    statusMessage.hidden = false;
};

export const clearMessage = () => {
    if (!statusMessage) return;
    statusMessage.textContent = '';
    statusMessage.className = '';
    statusMessage.hidden = true;
};

export const resetForm = () => {
    form.reset();
    carIdInput.value = '';
    formTitle.textContent = "Lägg till ny bil";
    submitBtn.textContent = "Lägg till";
    cancelBtn.hidden = true;
};

export const getFormData = () => ({
    brand: form.brand.value,
    model: form.model.value,
    year: parseInt(form.year.value, 10),
    color: form.color.value
});

export const populateForm = (car) => {
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

export const populateCarElement = (element, car) => {
    element.querySelector('.car-title').textContent = `${car.brand} ${car.model}`;
    element.querySelector('.car-year').textContent = car.year;
    element.querySelector('.car-color').textContent = `Färg: ${car.color}`;
};

export const renderCar = (car) => {
    const templateListItem = carTemplate.content.cloneNode(true);
    const carListItem = templateListItem.querySelector('.car-list-item');
    
    carListItem.dataset.id = car.id;
    populateCarElement(carListItem, car);
    carList.appendChild(carListItem);
};

export const clearCarList = () => {
    carList.replaceChildren();
};