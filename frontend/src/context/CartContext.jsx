import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart]   = useState({ items: [] });
  const [total, setTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const sync = (data) => {
    setCart(data.cart);
    setTotal(data.total || 0);
    setItemCount(data.itemCount || 0);
  };

  const fetchCart = useCallback(async () => {
    if (!user || !['buyer','hotel'].includes(user.role)) return;
    try { sync((await api.get('/cart')).data); } catch { /* silent */ }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addItem = async (productId, quantity = 1) => {
    if (!user) { toast.error('Please login to add items'); return; }
    setLoading(true);
    try {
      sync((await api.post('/cart', { productId, quantity })).data);
      toast.success('Added to cart 🛒');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add');
    } finally { setLoading(false); }
  };

  const updateItem = async (productId, quantity) => {
    if (quantity < 1) return removeItem(productId);
    setLoading(true);
    try { sync((await api.post('/cart', { productId, quantity })).data); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const bulkAdd = async (items) => {
    setLoading(true);
    try {
      sync((await api.post('/cart/bulk', { items })).data);
      toast.success(`${items.length} item(s) added!`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const removeItem = async (productId) => {
    try { sync((await api.delete(`/cart/${productId}`)).data); }
    catch { toast.error('Failed to remove'); }
  };

  const clearCart = async () => {
    try { await api.delete('/cart'); setCart({ items: [] }); setTotal(0); setItemCount(0); }
    catch { toast.error('Failed to clear'); }
  };

  return (
    <CartContext.Provider value={{ cart, total, itemCount, loading, addItem, updateItem, bulkAdd, removeItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be within CartProvider');
  return ctx;
};
