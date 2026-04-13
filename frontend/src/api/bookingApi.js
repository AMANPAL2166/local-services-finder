import api from './axiosInstance'

export const createBookingApi       = (data) => api.post('/bookings', data)
export const getMyBookingsApi       = ()     => api.get('/bookings/my')
export const getProviderBookingsApi = ()     => api.get('/bookings/provider')
export const updateBookingStatusApi = (id, status) => api.put(`/bookings/${id}/status`, { status })