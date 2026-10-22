import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import productService from '../../services/productService'

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try { return await productService.getWishlist() }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (productId, { rejectWithValue }) => {
  try { return await productService.toggleWishlist(productId) }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (s, a) => { s.items = a.payload })
      .addCase(toggleWishlist.fulfilled, (s, a) => { s.items = a.payload })
  },
})

export default wishlistSlice.reducer
