import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/common/Spinner.jsx';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
import { Trash2, Plus, Minus, ShoppingCart, Package, MapPin } from 'lucide-react';

const CAT_IMG = {Vegetables:'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=80&q=80',Fruits:'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=80&q=80',Cereals:'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=80&q=80',Legumes:'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=80&q=80',Tubers:'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=80&q=80',Dairy:'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=80&q=80',Poultry:'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=80&q=80',Other:'https://images.unsplash.com/photo-1471943311424-646960669fbc?w=80&q=80'};

export default function CartPage() {
  const { cart, total, itemCount, updateItem, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [county, setCounty]   = useState('');
  const [town, setTown]       = useState('');
  const [notes, setNotes]     = useState('');
  const [placing, setPlacing] = useState(false);

  const handleCheckout = async () => {
    if (!user) return navigate('/login');
    if (!county) return toast.error('Enter delivery county');
    if (!cart.items?.length) return toast.error('Cart is empty');
    setPlacing(true);
    try {
      const { data } = await api.post('/orders/cart', {
        cartItems: cart.items.map(i => ({ productId: i.product._id, quantity: i.quantity })),
        deliveryAddress: { county, town }, notes,
      });
      toast.success(`${data.orders.length} order(s) placed!`);
      await clearCart();
      navigate('/buyer');
    } catch (err) { toast.error(err.response?.data?.message || 'Checkout failed'); }
    finally { setPlacing(false); }
  };

  if (!cart.items?.length) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold text-gray-700 dark:text-gray-300">Your cart is empty</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Browse the marketplace to find fresh produce</p>
        <Link to="/marketplace" className="mt-6 inline-block btn-primary">Browse Products</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><ShoppingCart className="w-6 h-6 text-forest-600"/>Cart ({itemCount} items)</h1>
          <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 font-medium"><Trash2 className="w-4 h-4"/>Clear All</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {cart.items.map(({ product: p, quantity }) => (
              <div key={p._id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4">
                <img src={p.images?.[0]||CAT_IMG[p.category]||CAT_IMG.Other} alt={p.name} className="w-16 h-16 rounded-xl object-cover bg-gray-100 flex-shrink-0" onError={e=>{e.target.src=CAT_IMG[p.category]||CAT_IMG.Other;}}/>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{p.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{p.category} · <span className="flex items-center gap-1 inline-flex"><MapPin className="w-3 h-3"/>{p.location?.county}</span></p>
                  <p className="text-forest-600 font-bold mt-1">KSh {(p.pricePerUnit*quantity).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={()=>updateItem(p._id,quantity-1)} disabled={quantity<=1} className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-700"><Minus className="w-3.5 h-3.5"/></button>
                  <span className="w-8 text-center font-bold text-gray-900 dark:text-white">{quantity}</span>
                  <button onClick={()=>updateItem(p._id,quantity+1)} disabled={quantity>=p.quantity} className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-700"><Plus className="w-3.5 h-3.5"/></button>
                  <button onClick={()=>removeItem(p._id)} className="ml-2 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>
            ))}
          </div>
          {/* Summary */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <h2 className="font-display font-bold text-gray-900 dark:text-white mb-4">Order Summary</h2>
              {cart.items.map(({product:p,quantity})=>(
                <div key={p._id} className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span className="truncate max-w-[140px]">{p.name} ×{quantity}</span>
                  <span className="font-medium dark:text-white">KSh {(p.pricePerUnit*quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 dark:border-gray-700 mt-3 pt-3 flex justify-between font-bold text-gray-900 dark:text-white">
                <span>Total</span><span className="text-forest-600 text-lg">KSh {total.toLocaleString()}</span>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
              <h2 className="font-display font-bold text-gray-900 dark:text-white">Delivery</h2>
              <div><label className="label">County *</label><input className="input" placeholder="Delivery county" value={county} onChange={e=>setCounty(e.target.value)}/></div>
              <div><label className="label">Town</label><input className="input" placeholder="Town" value={town} onChange={e=>setTown(e.target.value)}/></div>
              <div><label className="label">Notes</label><textarea className="input resize-none" rows={2} placeholder="Instructions..." value={notes} onChange={e=>setNotes(e.target.value)}/></div>
            </div>
            <button onClick={handleCheckout} disabled={placing||!cart.items?.length} className="w-full flex items-center justify-center gap-2 btn-primary py-3.5 text-base">
              {placing ? <Spinner size="sm" className="inline"/> : <><Package className="w-5 h-5"/>Place Order ({itemCount} items)</>}
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">You'll be able to pay via M-Pesa after placing the order.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
