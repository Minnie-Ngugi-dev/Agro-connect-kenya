import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import Spinner from '../components/common/Spinner.jsx';
import toast from 'react-hot-toast';
import { MapPin, Scale, Phone, ArrowLeft, ShoppingCart, CreditCard, User, Star, Eye, Plus, Minus } from 'lucide-react';

const CAT_IMG = {Vegetables:'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80',Fruits:'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&q=80',Cereals:'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80',Legumes:'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=600&q=80',Tubers:'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&q=80',Dairy:'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80',Poultry:'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&q=80',Other:'https://images.unsplash.com/photo-1471943311424-646960669fbc?w=600&q=80'};

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty]         = useState(1);
  const [county, setCounty]   = useState('');
  const [town, setTown]       = useState('');
  const [notes, setNotes]     = useState('');
  const [ordering, setOrdering] = useState(false);
  const [payPhone, setPayPhone] = useState('');
  const [paying, setPaying]     = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [step, setStep] = useState('order'); // order | payment | done

  useEffect(() => {
    api.get(`/products/${id}`).then(({data}) => setProduct(data.product)).catch(() => toast.error('Not found')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner size="lg" className="py-32" />;
  if (!product) return <div className="text-center py-32 dark:text-white">Product not found. <Link to="/marketplace" className="text-forest-600 underline">Go back</Link></div>;

  const total = product.pricePerUnit * qty;

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (user.role === 'farmer') return toast.error('Farmers cannot place orders');
    setOrdering(true);
    try {
      const { data } = await api.post('/orders', { productId: product._id, quantity: qty, deliveryAddress: { county, town }, notes });
      setPendingOrderId(data.order._id);
      setPayPhone(user.phone || '');
      setStep('payment');
      toast.success('Order placed! Proceed to pay via M-Pesa.');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setOrdering(false); }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setPaying(true);
    try {
      await api.post('/payments/stk-push', { orderId: pendingOrderId, phone: payPhone });
      setStep('done');
      toast.success('STK Push sent! Enter your M-Pesa PIN.');
    } catch (err) { toast.error(err.response?.data?.message || 'Payment failed'); }
    finally { setPaying(false); }
  };

  const handleAddToCart = () => { addItem(product._id, qty); };

  const img = product.images?.[0] || CAT_IMG[product.category] || CAT_IMG.Other;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/marketplace" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-forest-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left */}
          <div className="lg:col-span-3 space-y-5">
            <div className="card overflow-hidden">
              <div className="relative h-72 bg-gradient-to-br from-forest-50 to-forest-100 dark:from-gray-700 dark:to-gray-600">
                <img src={img} alt={product.name} className="w-full h-full object-cover" onError={e=>{e.target.src=CAT_IMG.Other;}} />
                {product.isFeatured && <div className="absolute top-3 left-3 flex items-center gap-1 bg-earth-400 text-white text-xs font-semibold px-3 py-1 rounded-full"><Star className="w-3 h-3"/>Featured</div>}
              </div>
            </div>
            <div className="card p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="badge bg-forest-100 dark:bg-forest-900/30 text-forest-700 dark:text-forest-400 text-xs mb-2">{product.category}</span>
                  <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400"><Eye className="w-3 h-3"/>{product.views}</div>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-forest-700">KSh {product.pricePerUnit?.toLocaleString()}</span>
                <span className="text-gray-500 dark:text-gray-400 pb-1">/ {product.unit}</span>
              </div>
              {product.description && <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{product.description}</p>}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><Scale className="w-4 h-4 text-forest-500"/><span><b>{product.quantity}</b> {product.unit} available</span></div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><MapPin className="w-4 h-4 text-forest-500"/><span>{product.location?.county}, {product.location?.town}</span></div>
              </div>
              {product.tags?.length > 0 && <div className="flex flex-wrap gap-2">{product.tags.map(t=><span key={t} className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-3 py-1">#{t}</span>)}</div>}
            </div>
            <div className="card p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-forest-100 dark:bg-forest-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-forest-600"/>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 dark:text-white">{product.farmer?.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3"/>{product.farmer?.location?.county}</p>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"><Phone className="w-4 h-4"/><span className="hidden sm:block">{product.farmer?.phone}</span></div>
            </div>
          </div>

          {/* Right: order/payment */}
          <div className="lg:col-span-2">
            <div className="card p-6 sticky top-24">
              {step === 'order' && (
                <>
                  <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-5 flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-forest-600"/>Place Order</h2>
                  {!user && <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 mb-4 text-sm text-amber-800 dark:text-amber-300"><Link to="/login" className="font-semibold underline">Login</Link> to place an order.</div>}
                  <form onSubmit={handleOrder} className="space-y-4">
                    <div>
                      <label className="label">Quantity ({product.unit})</label>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={()=>setQty(q=>Math.max(1,q-1))} className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700"><Minus className="w-4 h-4"/></button>
                        <input type="number" min={1} max={product.quantity} className="input text-center flex-1" value={qty} onChange={e=>setQty(Math.max(1,Math.min(product.quantity,Number(e.target.value))))} required/>
                        <button type="button" onClick={()=>setQty(q=>Math.min(product.quantity,q+1))} className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700"><Plus className="w-4 h-4"/></button>
                      </div>
                    </div>
                    <div><label className="label">Delivery County *</label><input type="text" className="input" placeholder="e.g. Nairobi" value={county} onChange={e=>setCounty(e.target.value)} required/></div>
                    <div><label className="label">Town</label><input type="text" className="input" placeholder="e.g. Westlands" value={town} onChange={e=>setTown(e.target.value)}/></div>
                    <div><label className="label">Notes</label><textarea className="input resize-none" rows={2} placeholder="Special instructions..." value={notes} onChange={e=>setNotes(e.target.value)}/></div>
                    <div className="bg-forest-50 dark:bg-forest-900/20 rounded-xl p-4 space-y-1 text-sm">
                      <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>{qty} × KSh {product.pricePerUnit?.toLocaleString()}</span><span>KSh {total.toLocaleString()}</span></div>
                      <div className="flex justify-between font-bold text-gray-900 dark:text-white text-base pt-1 border-t border-forest-100 dark:border-forest-800"><span>Total</span><span className="text-forest-700 dark:text-forest-400">KSh {total.toLocaleString()}</span></div>
                    </div>
                    <button type="submit" disabled={ordering||!user||user.role==='farmer'} className="btn-primary w-full py-3 text-base">
                      {ordering ? <Spinner size="sm" className="inline"/> : 'Proceed to Payment'}
                    </button>
                    {user&&['buyer','hotel'].includes(user.role) && (
                      <button type="button" onClick={handleAddToCart} className="btn-secondary w-full py-2.5 text-sm flex items-center justify-center gap-2">
                        <ShoppingCart className="w-4 h-4"/> Add to Cart
                      </button>
                    )}
                  </form>
                </>
              )}
              {step === 'payment' && (
                <>
                  <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-2 flex items-center gap-2"><CreditCard className="w-5 h-5 text-forest-600"/>Pay via M-Pesa</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Enter your Safaricom number to receive the STK Push.</p>
                  <form onSubmit={handlePayment} className="space-y-4">
                    <div><label className="label">M-Pesa Number</label><input type="tel" className="input" placeholder="0712345678 or +254712345678" value={payPhone} onChange={e=>setPayPhone(e.target.value)} required/></div>
                    <div className="bg-forest-50 dark:bg-forest-900/20 rounded-xl p-4 text-sm flex justify-between font-bold text-gray-900 dark:text-white">
                      <span>Amount</span><span className="text-forest-700 dark:text-forest-400 text-lg">KSh {total.toLocaleString()}</span>
                    </div>
                    <button type="submit" disabled={paying} className="btn-primary w-full py-3 text-base">{paying ? <Spinner size="sm" className="inline"/> : '📲 Send STK Push'}</button>
                    <button type="button" onClick={()=>setStep('order')} className="w-full text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">← Back</button>
                  </form>
                </>
              )}
              {step === 'done' && (
                <div className="text-center py-6 space-y-4">
                  <div className="text-6xl">📲</div>
                  <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white">Check Your Phone!</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">An M-Pesa prompt was sent to <strong>{payPhone}</strong>. Enter your PIN to complete.</p>
                  <div className="bg-forest-50 dark:bg-forest-900/20 rounded-xl p-4 text-sm text-forest-700 dark:text-forest-400 font-medium">Your order will be confirmed once payment is received. 🌾</div>
                  <Link to="/buyer" className="btn-primary w-full block text-center py-3">View My Orders</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
