import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const searchDrugs = async (query) => {
  const response = await api.get(`/drugs?q=${encodeURIComponent(query)}`)
  return response.data
}

export const predict = async (data) => {
  const response = await api.post('/predict', data)
  return response.data
}

export const seedDatabase = async () => {
  const response = await api.post('/seed')
  return response.data
}

export const getHealth = async () => {
  const response = await api.get('/health')
  return response.data
}

export default api


