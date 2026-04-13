import api from './axiosInstance'

export const createReviewApi      = (data)      => api.post('/reviews', data)
export const getServiceReviewsApi = (serviceId) => api.get(`/reviews/service/${serviceId}`)