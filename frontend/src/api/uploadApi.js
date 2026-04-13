import api from './axiosInstance'

export const uploadServiceImageApi = (formData) =>
  api.post('/services', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const uploadAvatarApi = (formData) =>
  api.put('/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })