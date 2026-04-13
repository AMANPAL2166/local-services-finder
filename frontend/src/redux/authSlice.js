import { createSlice } from '@reduxjs/toolkit'

const getSavedUser = () => {
  try {
    const data = localStorage.getItem('servifind_user')
    return data ? JSON.parse(data) : null
  } catch { return null }
}

const saved = getSavedUser()

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:            saved?.user            || null,
    token:           saved?.token           || null,
    isAuthenticated: !!saved?.token,
  },
  reducers: {
    setUser: (state, action) => {
      const { user, token } = action.payload
      state.user            = user
      state.token           = token
      state.isAuthenticated = true
      localStorage.setItem('servifind_user', JSON.stringify({ user, token }))
    },
    logout: (state) => {
      state.user            = null
      state.token           = null
      state.isAuthenticated = false
      localStorage.removeItem('servifind_user')
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
      const saved = getSavedUser()
      localStorage.setItem('servifind_user', JSON.stringify({ ...saved, user: state.user }))
    },
  },
})

export const { setUser, logout, updateUser } = authSlice.actions
export default authSlice.reducer