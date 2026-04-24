import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import orderService from '../../services/orderService'

export const placeOrder = createAsyncThunk('orders/place', async (data, { rejectWithValue }) => {
  try { return await orderService.placeOrder(data) }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const fetchOrders = createAsyncThunk('orders/fetchAll', async (_, { rejectWithValue }) => {
  try { return await orderService.getOrders() }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const fetchOrderById = createAsyncThunk('orders/fetchOne', async (id, { rejectWithValue }) => {
  try { return await orderService.getOrderById(id) }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const requestReturn = createAsyncThunk('orders/return', async (data, { rejectWithValue }) => {
  try { return await orderService.requestReturn(data) }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

const orderSlice = createSlice({
  name: 'orders',
  initialState: { list: [], current: null, loading: false, error: null, placed: null },
  reducers: { clearPlaced: (s) => { s.placed = null } },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (s) => { s.loading = true })
      .addCase(placeOrder.fulfilled, (s, a) => { s.loading = false; s.placed = a.payload })
      .addCase(placeOrder.rejected, (s, a) => { s.loading = false; s.error = a.payload })
      .addCase(fetchOrders.fulfilled, (s, a) => { s.list = a.payload })
      .addCase(fetchOrderById.pending, (s) => { s.loading = true; s.current = null })
      .addCase(fetchOrderById.fulfilled, (s, a) => { s.loading = false; s.current = a.payload })
  },
})

export const { clearPlaced } = orderSlice.actions
export default orderSlice.reducer
