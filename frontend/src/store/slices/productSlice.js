import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import productService from '../../services/productService'

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params, { rejectWithValue }) => {
  try { return await productService.getProducts(params) }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

export const fetchProductById = createAsyncThunk('products/fetchOne', async (id, { rejectWithValue }) => {
  try { return await productService.getProductById(id) }
  catch (err) { return rejectWithValue(err.response?.data?.message) }
})

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [], total: 0, pages: 1,
    current: null,
    loading: false, error: null,
    filters: { category: '', minPrice: '', maxPrice: '', rating: '', sort: 'newest', page: 1 },
  },
  reducers: {
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload, page: 1 }
    },
    setPage: (state, action) => { state.filters.page = action.payload },
    clearCurrent: (state) => { state.current = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (s) => { s.loading = true; s.error = null })
      .addCase(fetchProducts.fulfilled, (s, a) => {
        s.loading = false; s.items = a.payload.products
        s.total = a.payload.total; s.pages = a.payload.pages
      })
      .addCase(fetchProducts.rejected, (s, a) => { s.loading = false; s.error = a.payload })
      .addCase(fetchProductById.pending, (s) => { s.loading = true; s.current = null })
      .addCase(fetchProductById.fulfilled, (s, a) => { s.loading = false; s.current = a.payload })
      .addCase(fetchProductById.rejected, (s, a) => { s.loading = false; s.error = a.payload })
  },
})

export const { setFilter, setPage, clearCurrent } = productSlice.actions
export default productSlice.reducer
