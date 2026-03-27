// src/api.js
// Central place for all backend calls
// Swap BASE_URL here if the server port ever changes.

const BASE_URL = 'http://localhost:3000/api'

async function request(method, path, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body) options.body = JSON.stringify(body)

  const res = await fetch(`${BASE_URL}${path}`, options)
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong')
  }
  return data
}

export const api = {
  auth: {
    login:    (email, password)       => request('POST', '/auth/login',    { email, password }),
    register: (name, email, password) => request('POST', '/auth/register', { name, email, password }),
  },

  services: {
    list:   ()           => request('GET',    '/services'),
    get:    (id)         => request('GET',    `/services/${id}`),
    create: (data)       => request('POST',   '/services',    data),
    update: (id, data)   => request('PUT',    `/services/${id}`, data),
    delete: (id)         => request('DELETE', `/services/${id}`),
  },

  queue: {
    get:   (serviceId)             => request('GET',    `/queue/${serviceId}`),
    join:  (serviceId, userId, name) => request('POST',   `/queue/${serviceId}/join`,  { userId, name }),
    leave: (serviceId, userId)     => request('DELETE', `/queue/${serviceId}/leave`, { userId }),
    serve: (serviceId)             => request('POST',   `/queue/${serviceId}/serve`),
  },

  notifications: {
    list:  (userId) => request('GET',   `/notifications/${userId}`),
    read:  (id)     => request('PATCH', `/notifications/${id}/read`),
    clear: (userId) => request('DELETE',`/notifications/${userId}`),
  },

  history: {
    list: (userId) => request('GET', `/history/${userId}`),
  },
}