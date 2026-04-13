import api from './axiosInstance'

export const registerApi = (data)  => api.post('/auth/register', data)
export const loginApi    = (data)  => api.post('/auth/login', data)
export const logoutApi   = ()      => api.post('/auth/logout')
export const getMeApi    = ()      => api.get('/auth/me')
export const updateProfileApi = (data) => api.put('/auth/profile', data)