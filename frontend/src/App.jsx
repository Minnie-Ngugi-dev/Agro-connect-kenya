import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import Navbar from './components/common/Navbar.jsx';
import ScrollToTop from './components/common/ScrollToTop.jsx';

import LandingPage from './pages/LandingPage.jsx';
import { LoginPage, RegisterPage } from './pages/AuthPages.jsx';
import MarketplacePage from './pages/MarketplacePage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import HowItWorksPage from './pages/HowItWorksPage.jsx';
import CartPage from './pages/CartPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import FarmerDashboard from './pages/FarmerDashboard.jsx';
import BuyerDashboard from './pages/BuyerDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import HotelDashboard from './pages/HotelDashboard.jsx';

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-200">
      <Navbar />
      <main className="flex-1">{children}</main>
      <ScrollToTop />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3500,
                style: {
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                },
                success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
                error:   { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
              }}
            />
            <Routes>
              {/* Auth — no persistent navbar */}
              <Route path="/login"    element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Public */}
              <Route path="/" element={<Layout><LandingPage /></Layout>} />
              <Route path="/marketplace" element={<Layout><MarketplacePage /></Layout>} />
              <Route path="/marketplace/:id" element={<Layout><ProductDetailPage /></Layout>} />
              <Route path="/how-it-works" element={<Layout><HowItWorksPage /></Layout>} />

              {/* Protected — any logged-in user */}
              <Route path="/profile" element={
                <ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>
              } />

              {/* Protected — buyer or hotel */}
              <Route path="/cart" element={
                <ProtectedRoute roles={['buyer','hotel']}>
                  <Layout><CartPage /></Layout>
                </ProtectedRoute>
              } />
              <Route path="/buyer" element={
                <ProtectedRoute roles={['buyer']}>
                  <Layout><BuyerDashboard /></Layout>
                </ProtectedRoute>
              } />

              {/* Protected — farmer */}
              <Route path="/farmer" element={
                <ProtectedRoute roles={['farmer']}>
                  <Layout><FarmerDashboard /></Layout>
                </ProtectedRoute>
              } />

              {/* Protected — hotel */}
              <Route path="/hotel" element={
                <ProtectedRoute roles={['hotel']}>
                  <Layout><HotelDashboard /></Layout>
                </ProtectedRoute>
              } />

              {/* Protected — admin */}
              <Route path="/admin" element={
                <ProtectedRoute roles={['admin']}>
                  <Layout><AdminDashboard /></Layout>
                </ProtectedRoute>
              } />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
