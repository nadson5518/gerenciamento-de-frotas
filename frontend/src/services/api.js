const API_URL = import.meta.env.VITE_API_URL;

function buildUrl(path) {
  return `${API_URL}${path}`;
}

async function request(path, options = {}) {
  const response = await fetch(buildUrl(path), options);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Falha na requisição (${response.status}).`;

    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export function fetchVehicles() {
  return request('/api/veiculos');
}

export function fetchMaintenances() {
  return request('/api/manutencoes');
}

export function createVehicle(payload) {
  return request('/api/veiculos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

export function createMaintenance(payload) {
  return request('/api/manutencoes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

export function updateVehicle(id, payload) {
  return request(`/api/veiculos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}
