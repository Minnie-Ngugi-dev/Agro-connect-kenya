import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
import Spinner from '../components/common/Spinner.jsx';
import ReceiptModal from '../components/common/ReceiptModal.jsx';
import { Building2, ShoppingBag, Package, TrendingUp, Plus, Minus, Receipt, CreditCard } from 'lucide-react';

const CATS = ['Vegetables','Fruits','Cereals','Legumes','Tubers','Dairy','Poultry','Other'];

export default function HotelDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('order');
  const [products, setProducts] = useState([]);
  const [orders, setOrders]     = useState([]);
  const [loadingP, setLoadingP] = useState(false);
  const [loadingO, setLoadingO] = useState(false);
  const [placing,  setPlacing]  = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [delivery, setDelivery] = useState({ county:'', town:'', notes:'', frequency:'once' });
  const [catFilter, setCatFilter] = useState('');
  const [receiptOrder, setReceiptOrder] = useState(null);

  const fetchProducts = async () => { setLoadingP(true); try { const {data}=await api.get('/products',{params:{limit:60,category:catFilter||undefined}}); setProducts(data.products); } catch { toast.error('Failed'); } finally { setLoadingP(false); } };
  const fetchOrders   = async () => { setLoadingO(true); try { const {data}=await api.get('/hotel/orders'); setOrders(data.orders); } catch { toast.error('Failed'); } finally { setLoadingO(false); } };

  useEffect(()=>{ fetchProducts(); },[catFilter]);
  useEffect(()=>{ if(tab==='orders') fetchOrders(); },[tab]);

  const setQty = (pid, qty) => { if(qty<=0){const n={...cartItems};delete n[pid];setCartItems(n);}else{setCartItems(c=>({...c,[pid]:qty}));} };
  const totalSelected = Object.values(cartItems).reduce((s,q)=>s+q,0);
  const cartTotal = products.filter(p=>cartItems[p._id]).reduce((s,p)=>s+Math.round(p.pricePerUnit*0.95)*cartItems[p._id],0);

  const handleBulkOrder = async () => {
    if(!Object.keys(cartItems).length) return toast.error('Select at least one product');
    if(!delivery.county) return toast.error('Delivery county required');
    const items = Object.entries(cartItems).map(([productId,quantity])=>({productId,quantity}));
    setPlacing(true);
    try {
      const {data}=await api.post('/hotel/bulk-order',{items,deliveryAddress:{county:delivery.county,town:delivery.town},notes:delivery.notes,deliveryFrequency:delivery.frequency});
      toast.success(data.message); setCartItems({}); fetchOrders(); setTab('orders');
    } catch (err) { toast.error(err.response?.data?.message||'Order failed'); }
    finally { setPlacing(false); }
  };

  const viewReceipt = async (order) => {
    try { const {data}=await api.get(`/payments/receipt-data/${order._id}`); setReceiptOrder(data.order); }
    catch { toast.error('Could not load receipt'); }
  };

  const retryPayment = async (order) => {
    const phone = prompt('Enter M-Pesa number:'); if(!phone) return;
    try { await api.post('/payments/stk-push',{orderId:order._id,phone}); toast.success('STK Push sent!'); }
    catch (err) { toast.error(err.response?.data?.message||'Failed'); }
  };

  const spent = orders.filter(o=>o.paymentStatus==='paid').reduce((s,o)=>s+o.totalPrice,0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {receiptOrder&&<ReceiptModal order={receiptOrder} onClose={()=>setReceiptOrder(null)}/>}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <Building2 className="w-7 h-7 text-amber-600 dark:text-amber-400"/>
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-gray-900 dark:text-white">{user?.hotelDetails?.businessName||user?.name} 🏨</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user?.hotelDetails?.businessType||'Hotel'} — Bulk Ordering Dashboard</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[{l:'Total Orders',v:orders.length,Icon:ShoppingBag,c:'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'},{l:'Items Selected',v:totalSelected,Icon:Package,c:'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'},{l:'Total Spent (KSh)',v:spent.toLocaleString(),Icon:TrendingUp,c:'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'}].map(({l,v,Icon,c})=>(
              <div key={l} className={`${c} rounded-xl p-4 flex items-center gap-3`}><Icon className="w-6 h-6 opacity-70 flex-shrink-0"/><div><div className="text-xl font-bold font-display">{v}</div><div className="text-xs opacity-70">{l}</div></div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">🏷️</span>
          <div><p className="font-bold text-amber-800 dark:text-amber-300">5% Bulk Discount Applied Automatically</p><p className="text-sm text-amber-600 dark:text-amber-400">All hotel orders receive a 5% discount on listed prices.</p></div>
        </div>
        <div className="flex gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 rounded-xl w-fit mb-6">
          {[{v:'order',l:'🛒 Bulk Order'},{v:'orders',l:'📋 Order History'}].map(t=><button key={t.v} onClick={()=>setTab(t.v)} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab===t.v?'bg-amber-500 text-white':'text-gray-600 dark:text-gray-400 hover:text-amber-600'}`}>{t.l}</button>)}
        </div>

        {tab==='order'&&(
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <h2 className="font-display font-semibold text-lg text-gray-800 dark:text-white">Select Products</h2>
                <select className="input text-sm w-auto" value={catFilter} onChange={e=>setCatFilter(e.target.value)}><option value="">All Categories</option>{CATS.map(c=><option key={c}>{c}</option>)}</select>
              </div>
              {loadingP?<Spinner size="lg" className="py-16"/>:(
                <div className="space-y-2">
                  {products.map(p=>{
                    const disc=Math.round(p.pricePerUnit*0.95); const qty=cartItems[p._id]||0;
                    return(
                      <div key={p._id} className={`bg-white dark:bg-gray-800 rounded-xl border ${qty>0?'border-amber-400':'border-gray-200 dark:border-gray-700'} p-3 flex items-center gap-3 transition-all`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap"><span className="font-semibold text-sm text-gray-900 dark:text-white truncate">{p.name}</span><span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs">{p.category}</span></div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-forest-600 font-bold text-sm">KSh {disc.toLocaleString()}/{p.unit}</span>
                            <span className="text-gray-400 line-through text-xs">KSh {p.pricePerUnit.toLocaleString()}</span>
                            <span className="text-gray-400 text-xs">{p.quantity} {p.unit} left</span>
                          </div>
                          <span className="text-gray-400 text-xs">{p.location?.county}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={()=>setQty(p._id,qty-1)} disabled={qty<=0} className="w-7 h-7 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-700"><Minus className="w-3 h-3"/></button>
                          <input type="number" min="0" max={p.quantity} className="w-14 text-center border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg py-1 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400" value={qty||''} placeholder="0" onChange={e=>setQty(p._id,Number(e.target.value))}/>
                          <button onClick={()=>setQty(p._id,qty+1)} disabled={qty>=p.quantity} className="w-7 h-7 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-700"><Plus className="w-3 h-3"/></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                <h2 className="font-display font-bold text-gray-900 dark:text-white mb-4">Bulk Order Summary</h2>
                {!Object.keys(cartItems).length?<p className="text-gray-400 text-sm text-center py-4">No items selected</p>:(
                  <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                    {products.filter(p=>cartItems[p._id]).map(p=>(
                      <div key={p._id} className="flex justify-between text-sm">
                        <span className="truncate text-gray-600 dark:text-gray-400 max-w-[140px]">{p.name} × {cartItems[p._id]}</span>
                        <span className="font-medium dark:text-white">KSh {(Math.round(p.pricePerUnit*0.95)*cartItems[p._id]).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-bold text-gray-900 dark:text-white">
                  <span>Total (5% off)</span><span className="text-amber-600">KSh {cartTotal.toLocaleString()}</span>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Delivery</h3>
                <div><label className="label">County *</label><input className="input" placeholder="Delivery county" value={delivery.county} onChange={e=>setDelivery({...delivery,county:e.target.value})}/></div>
                <div><label className="label">Town</label><input className="input" placeholder="Delivery town" value={delivery.town} onChange={e=>setDelivery({...delivery,town:e.target.value})}/></div>
                <div><label className="label">Frequency</label><select className="input" value={delivery.frequency} onChange={e=>setDelivery({...delivery,frequency:e.target.value})}><option value="once">One-time</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></div>
                <div><label className="label">Notes</label><textarea className="input resize-none" rows={2} value={delivery.notes} onChange={e=>setDelivery({...delivery,notes:e.target.value})}/></div>
              </div>
              <button onClick={handleBulkOrder} disabled={placing||!Object.keys(cartItems).length} className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-2xl transition-colors disabled:opacity-50">
                {placing?<Spinner size="sm" className="inline"/>:<><Package className="w-5 h-5"/>Place Bulk Order ({totalSelected} items)</>}
              </button>
            </div>
          </div>
        )}

        {tab==='orders'&&(
          <>
            <h2 className="font-display font-semibold text-lg text-gray-800 dark:text-white mb-4">Order History</h2>
            {loadingO?<Spinner size="lg" className="py-16"/>:orders.length===0?(
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"><span className="text-5xl">📦</span><p className="mt-4 text-gray-500 dark:text-gray-400">No orders yet.</p></div>
            ):(
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                    <tr>{['Order ID','Farmer','Total','Payment','Status','Date','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                    {orders.map(o=>(
                      <tr key={o._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">#{o._id.slice(-8).toUpperCase()}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{o.farmer?.name}</td>
                        <td className="px-4 py-3 font-bold text-forest-700 dark:text-forest-400">KSh {o.totalPrice?.toLocaleString()}</td>
                        <td className="px-4 py-3"><span className={`badge text-xs ${o.paymentStatus==='paid'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>{o.paymentStatus}</span></td>
                        <td className="px-4 py-3"><span className={`badge text-xs ${o.status==='delivered'?'bg-green-100 text-green-700':o.status==='cancelled'?'bg-red-100 text-red-700':'bg-blue-100 text-blue-700'}`}>{o.status}</span></td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'})}</td>
                        <td className="px-4 py-3"><div className="flex items-center gap-1">
                          {o.paymentStatus==='paid'&&<button onClick={()=>viewReceipt(o)} className="flex items-center gap-1 text-xs bg-gray-100 dark:bg-gray-600 px-2 py-1.5 rounded-lg text-gray-700 dark:text-gray-200"><Receipt className="w-3.5 h-3.5"/>Receipt</button>}
                          {(o.paymentStatus==='unpaid'||o.paymentStatus==='failed')&&<button onClick={()=>retryPayment(o)} className="flex items-center gap-1 text-xs bg-amber-500 text-white px-2 py-1.5 rounded-lg"><CreditCard className="w-3.5 h-3.5"/>Pay</button>}
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
