const API_URL = "http://localhost:5111/api/cars";

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

export const getCars = async () => {
    const response = await fetch(API_URL);
    logStatus(response, "Read");

    if (!response.ok) {
        const errorMsg = await getResponseMessage(response);
        throw new Error(errorMsg || `Error fetching cars: ${formatStatus(response)}`);
    }
    return await response.json();
};

export const createCar = async (carData) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(carData)
    });
    logStatus(response, "Create");

    if (!response.ok) {
        const errorMsg = await getResponseMessage(response);
        throw new Error(errorMsg || `Error creating car: ${formatStatus(response)}`);
    }
    return await response.json();
};

export const updateCar = async (id, carData) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(carData)
    });
    logStatus(response, "Update");

    if (!response.ok) {
        const errorMsg = await getResponseMessage(response);
        throw new Error(errorMsg || `Error updating car: ${formatStatus(response)}`);
    }
    return true;
};

export const deleteCar = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    logStatus(response, "Delete");

    if (!response.ok) {
        const errorMsg = await getResponseMessage(response);
        throw new Error(errorMsg || `Error deleting car: ${formatStatus(response)}`);
    }
    return await getResponseMessage(response);
};