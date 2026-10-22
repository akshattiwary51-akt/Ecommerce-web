import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';

// Layout & Common
import Layout from './components/layout/Layout';
import PrivateRoute from './components/common/PrivateRoute';

// Pages
import Home from './pages/Home/Home';
import Products from './pages/Products/Products';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import Orders from './pages/Orders/Orders';
import OrderDetail from './pages/Orders/OrderDetail';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Profile from './pages/Profile/Profile';

// Actions
import { loadUser, clearError } from './store/slices/authSlice';
import { fetchCart } from './store/slices/cartSlice';

export default function App() {
  const dispatch = useDispatch();
  
  // Get auth state to use as guards
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  // 1. Load User on Mount (with Guards)
  useEffect(() => {
    // Only fetch if we aren't already authenticated, not currently loading, and have no error
    if (!isAuthenticated && !loading && !error) {
      dispatch(loadUser());
    }
  }, [dispatch, isAuthenticated, loading, error]);

  // 2. Fetch Cart only when User is Authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="checkout" element={<Checkout />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}