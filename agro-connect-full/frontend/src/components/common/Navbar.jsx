import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import { Sprout, Menu, X, ShoppingCart, LayoutDashboard, LogOut, User, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const dashPath = user?.role === 'farmer' ? '/farmer' : user?.role === 'admin' ? '/admin' : user?.role === 'hotel' ? '/hotel' : '/buyer';
  const showCart = ['buyer', 'hotel'].includes(user?.role);

  const navLinks = [
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'How It Works', href: '/how-it-works' },
  ];

  const handleLogout = () => { logout(); navigate('/'); setDropOpen(false); };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-forest-600 rounded-xl flex items-center justify-center group-hover:bg-forest-700 transition-colors">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-gray-900 dark:text-white text-lg">
              Agro<span className="text-forest-600">-Connect</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(l => (
              <Link key={l.href} to={l.href}
                className={`text-sm font-medium transition-colors hover:text-forest-600 ${location.pathname === l.href ? 'text-forest-600' : 'text-gray-600 dark:text-gray-400'}`}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {user ? (
              <>
                {/* Cart icon */}
                {showCart && (
                  <Link to="/cart" className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <ShoppingCart className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-forest-600 text-white text-xs rounded-full flex items-center justify-center font-bold">{itemCount > 9 ? '9+' : itemCount}</span>
                    )}
                  </Link>
                )}

                {/* User dropdown */}
                <div className="relative">
                  <button onClick={() => setDropOpen(!dropOpen)}
                    className="flex items-center gap-2 bg-forest-50 dark:bg-gray-700 hover:bg-forest-100 dark:hover:bg-gray-600 rounded-xl px-3 py-2 transition-colors">
                    <div className="w-7 h-7 bg-forest-600 rounded-full flex items-center justify-center overflow-hidden">
                      {user.profileImage
                        ? <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                        : <span className="text-white text-xs font-bold">{user.name?.charAt(0).toUpperCase()}</span>}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[100px] truncate">{user.name}</span>
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>

                  {dropOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                      </div>
                      {[
                        { to: dashPath, icon: LayoutDashboard, label: 'Dashboard' },
                        { to: '/profile', icon: User, label: 'Profile Settings' },
                      ].map(({ to, icon: Icon, label }) => (
                        <Link key={to} to={to} onClick={() => setDropOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-forest-50 dark:hover:bg-gray-700 hover:text-forest-700 transition-colors">
                          <Icon className="w-4 h-4" />{label}
                        </Link>
                      ))}
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-forest-600 transition-colors">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-2">Get Started</Link>
              </>
            )}

            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5 dark:text-white" /> : <Menu className="w-5 h-5 dark:text-white" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 dark:border-gray-800 space-y-1">
            {navLinks.map(l => (
              <Link key={l.href} to={l.href} onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-forest-50 dark:hover:bg-gray-700 hover:text-forest-700 rounded-lg">
                {l.label}
              </Link>
            ))}
            {user && <Link to={dashPath} onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-forest-700 dark:text-forest-400 hover:bg-forest-50 dark:hover:bg-gray-700 rounded-lg">Dashboard</Link>}
          </div>
        )}
      </div>
    </nav>
  );
}
