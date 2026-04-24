import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authService from '../../services/authService'

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try { return await authService.register(data) }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Registration failed') }
})

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try { return await authService.login(data) }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Login failed') }
})

export const loadUser = createAsyncThunk('auth/loadUser', async (_, { rejectWithValue }) => {
  // Skip entirely if there's no token — avoids a guaranteed 401 on every page load
  // for unauthenticated users, which previously fed the reload loop via the interceptor.
  if (!localStorage.getItem('token')) return rejectWithValue(null)
  try { return await authService.getMe() }
  catch { return rejectWithValue(null) }
})

export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout()
})

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: localStorage.getItem('token'), loading: false, error: null },
  reducers: {
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (s) => { s.loading = true; s.error = null })
      .addCase(register.fulfilled, (s, a) => {
        s.loading = false; s.user = a.payload.user; s.token = a.payload.token
        localStorage.setItem('token', a.payload.token)
      })
      .addCase(register.rejected, (s, a) => { s.loading = false; s.error = a.payload })
      .addCase(login.pending, (s) => { s.loading = true; s.error = null })
      .addCase(login.fulfilled, (s, a) => {
        s.loading = false; s.user = a.payload.user; s.token = a.payload.token
        localStorage.setItem('token', a.payload.token)
      })
      .addCase(login.rejected, (s, a) => { s.loading = false; s.error = a.payload })
      .addCase(loadUser.fulfilled, (s, a) => { s.user = a.payload })
      .addCase(loadUser.rejected, (s) => { s.user = null; s.token = null; localStorage.removeItem('token') })
      .addCase(logout.fulfilled, (s) => { s.user = null; s.token = null; localStorage.removeItem('token') })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer
