import api from './axiosInstance'

export const getAllServicesApi  = (params) => api.get('/services', { params })
export const getServiceByIdApi  = (id)     => api.get(`/services/${id}`)
export const createServiceApi   = (data)   => api.post('/services', data)
export const updateServiceApi   = (id, data) => api.put(`/services/${id}`, data)
export const deleteServiceApi   = (id)     => api.delete(`/services/${id}`)
export const getMyServicesApi   = ()       => api.get('/services/mine')