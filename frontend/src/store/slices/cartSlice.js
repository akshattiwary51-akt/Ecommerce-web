import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import cartService from '../../services/cartService'

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try { return await cartService.getCart() }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const addToCart = createAsyncThunk('cart/add', async (data, { rejectWithValue }) => {
  try { return await cartService.addItem(data) }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const updateCartItem = createAsyncThunk('cart/update', async ({ itemId, quantity }, { rejectWithValue }) => {
  try { return await cartService.updateItem(itemId, quantity) }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const removeCartItem = createAsyncThunk('cart/remove', async (itemId, { rejectWithValue }) => {
  try { return await cartService.removeItem(itemId) }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const clearCartItems = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try { return await cartService.clearCart() }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    const setLoading = (s) => { s.loading = true; s.error = null }
    const setItems = (s, a) => { s.loading = false; s.items = a.payload.items || [] }
    builder
      .addCase(fetchCart.pending, setLoading).addCase(fetchCart.fulfilled, setItems)
      .addCase(addToCart.pending, setLoading).addCase(addToCart.fulfilled, setItems)
      .addCase(updateCartItem.pending, setLoading).addCase(updateCartItem.fulfilled, setItems)
      .addCase(removeCartItem.pending, setLoading).addCase(removeCartItem.fulfilled, setItems)
      .addCase(clearCartItems.fulfilled, (s) => { s.items = [] })
      .addMatcher((a) => a.type.endsWith('/rejected') && a.type.startsWith('cart/'),
        (s, a) => { s.loading = false; s.error = a.payload })
  },
})

export default cartSlice.reducer
