import { createSlice } from '@reduxjs/toolkit'
const serviceSlice = createSlice({ name: 'services', initialState: { list: [], loading: false }, reducers: {} })
export default serviceSlice.reducer
