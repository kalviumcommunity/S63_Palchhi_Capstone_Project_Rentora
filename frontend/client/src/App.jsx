import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Logout from './pages/Logout';
import About from './pages/About';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './utils/ProtectedRoute';
import Contact from './pages/ContactNew';
import AllContacts from './pages/AllContacts';
import FeedbackPage from './pages/feedback';
import Faq from './pages/Faq';
import AddListing from './pages/AddListing';
import MyListings from './pages/MyListings';
import PropertyShowcase from './pages/PropertyShowcase';
import PropertiesPage from './pages/PropertiesPage';
import ChatPage from './pages/ChatPage';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

import WishlistPage from './components/wishlist/WishlistPage';
import NotificationsPage from './components/notifications/NotificationsPage';
import EditListing from './pages/EditListing';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <AuthProvider>
        <BrowserRouter>
          <div className="app-container">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} /> 
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/logout" element={<Logout />} />

                <Route path="/contact" element={<Contact />} />
                <Route path="/all-contacts" element={<AllContacts />} /> 
                <Route path="/feedback" element={<FeedbackPage />} /> 
                <Route path="/faq" element={<Faq />} /> 
                <Route path="/property/:id" element={<PropertyShowcase />} />
                <Route path="/properties" element={<PropertiesPage />} />
                
                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/add-listing" element={<AddListing />} />
                  <Route path="/edit-listing/:id" element={<EditListing />} />
                  <Route path="/my-listings" element={<MyListings />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/chats" element={<ChatPage />} />
                  <Route path="/chat/:chatId" element={<ChatPage />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                </Route>

                {/* Fallback Route */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
