import axios from 'axios'

const api = axios.create({
  baseURL: 'https://servifind-backend-x3ze.onrender.com/api/v1',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  try {
    const data   = localStorage.getItem('servifind_user')
    const parsed = data ? JSON.parse(data) : null
    if (parsed?.token) {
      config.headers.Authorization = `Bearer ${parsed.token}`
    }
  } catch {}
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('servifind_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api