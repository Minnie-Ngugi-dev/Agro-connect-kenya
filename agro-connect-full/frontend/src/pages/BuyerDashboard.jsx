import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/common/Spinner.jsx';
import ReceiptModal from '../components/common/ReceiptModal.jsx';
import toast from 'react-hot-toast';
import { ShoppingBag, CreditCard, TrendingUp, Receipt } from 'lucide-react';

const ST={pending:'bg-yellow-100 text-yellow-700',confirmed:'bg-blue-100 text-blue-700',processing:'bg-indigo-100 text-indigo-700',shipped:'bg-purple-100 text-purple-700',delivered:'bg-green-100 text-green-700',cancelled:'bg-red-100 text-red-700'};
const PT={unpaid:'bg-gray-100 text-gray-600',pending:'bg-yellow-100 text-yellow-700',paid:'bg-green-100 text-green-700',failed:'bg-red-100 text-red-700',refunded:'bg-purple-100 text-purple-700'};
const CAT_IMG={Vegetables:'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=80&q=80',Fruits:'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=80&q=80',Cereals:'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=80&q=80',Legumes:'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=80&q=80',Tubers:'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=80&q=80',Dairy:'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=80&q=80',Poultry:'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=80&q=80',Other:'https://images.unsplash.com/photo-1471943311424-646960669fbc?w=80&q=80'};

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('');
  const [retrying, setRetrying]     = useState(null);
  const [receiptOrder, setReceiptOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try { const {data}=await api.get('/orders/my-orders',{params:filter?{status:filter}:{}}); setOrders(data.orders); }
    catch { toast.error('Failed to load'); } finally { setLoading(false); }
  };
  useEffect(()=>{ fetchOrders(); },[filter]);

  const retryPayment = async (order) => {
    const phone = prompt('Enter M-Pesa number:\n0712345678 | +254712345678 | 712345678');
    if (!phone) return;
    setRetrying(order._id);
    try { await api.post('/payments/stk-push',{orderId:order._id,phone}); toast.success('STK Push sent! Check your phone 📲'); }
    catch (err) { toast.error(err.response?.data?.message||'Payment failed'); }
    finally { setRetrying(null); }
  };

  const viewReceipt = async (order) => {
    try {
      const { data } = await api.get(`/payments/receipt-data/${order._id}`);
      setReceiptOrder(data.order);
    } catch { toast.error('Could not load receipt'); }
  };

  const totalSpent = orders.filter(o=>o.paymentStatus==='paid').reduce((s,o)=>s+o.totalPrice,0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {receiptOrder && <ReceiptModal order={receiptOrder} onClose={()=>setReceiptOrder(null)}/>}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
              {user?.profileImage?<img src={user.profileImage} alt="" className="w-full h-full object-cover"/>:<span className="text-blue-700 dark:text-blue-400 font-bold text-xl">{user?.name?.[0]?.toUpperCase()}</span>}
            </div>
            <div><h1 className="font-display text-xl font-bold text-gray-900 dark:text-white">Hello, {user?.name} 🛒</h1><p className="text-sm text-gray-500 dark:text-gray-400">Buyer Dashboard</p></div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[{l:'Total Orders',v:orders.length,Icon:ShoppingBag,c:'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'},{l:'Paid Orders',v:orders.filter(o=>o.paymentStatus==='paid').length,Icon:CreditCard,c:'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'},{l:'Total Spent (KSh)',v:totalSpent.toLocaleString(),Icon:TrendingUp,c:'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'}].map(({l,v,Icon,c})=>(
              <div key={l} className={`${c} rounded-xl p-4 flex items-center gap-3`}><Icon className="w-6 h-6 opacity-70 flex-shrink-0"/><div><div className="text-xl font-bold font-display">{v}</div><div className="text-xs opacity-70">{l}</div></div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h2 className="font-display font-semibold text-lg text-gray-800 dark:text-white">My Orders</h2>
          <div className="flex items-center gap-3">
            <select className="input text-sm w-auto" value={filter} onChange={e=>setFilter(e.target.value)}>
              {['','pending','confirmed','processing','shipped','delivered','cancelled'].map(s=><option key={s} value={s}>{s===''?'All statuses':s}</option>)}
            </select>
            <Link to="/marketplace" className="btn-primary text-sm py-2">+ Shop More</Link>
          </div>
        </div>
        {loading ? <Spinner size="lg" className="py-16"/> : orders.length===0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <span className="text-6xl">🛒</span><h3 className="font-display font-semibold text-gray-700 dark:text-gray-300 mt-4 text-lg">No orders yet</h3>
            <Link to="/marketplace" className="mt-5 inline-block btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                <tr>{['Product','Farmer','Qty','Total','Status','Payment','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {orders.map(o=>(
                  <tr key={o._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-3"><div className="flex items-center gap-3">
                      <img src={o.product?.images?.[0]||CAT_IMG[o.product?.category]||CAT_IMG.Other} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0" onError={e=>{e.target.src=CAT_IMG[o.product?.category]||CAT_IMG.Other;}}/>
                      <div><div className="font-medium text-gray-900 dark:text-white max-w-[110px] truncate">{o.product?.name||'Product'}</div><div className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'})}</div></div>
                    </div></td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400"><div>{o.farmer?.name}</div><div className="text-xs text-gray-400">{o.farmer?.phone}</div></td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{o.quantity} {o.product?.unit}</td>
                    <td className="px-4 py-3 font-semibold text-forest-700 dark:text-forest-400">KSh {o.totalPrice?.toLocaleString()}</td>
                    <td className="px-4 py-3"><span className={`badge text-xs ${ST[o.status]||'bg-gray-100 text-gray-600'}`}>{o.status}</span></td>
                    <td className="px-4 py-3"><span className={`badge text-xs ${PT[o.paymentStatus]||'bg-gray-100 text-gray-600'}`}>{o.paymentStatus}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {(o.paymentStatus==='unpaid'||o.paymentStatus==='failed')&&o.status!=='cancelled'&&(
                          <button onClick={()=>retryPayment(o)} disabled={retrying===o._id}
                            className="flex items-center gap-1 text-xs font-medium bg-forest-600 hover:bg-forest-700 text-white px-2.5 py-1.5 rounded-lg transition-colors">
                            {retrying===o._id?<Spinner size="sm" className="inline"/>:<><CreditCard className="w-3.5 h-3.5"/>Pay</>}
                          </button>
                        )}
                        {o.paymentStatus==='paid'&&(
                          <button onClick={()=>viewReceipt(o)} className="flex items-center gap-1 text-xs font-medium bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 px-2.5 py-1.5 rounded-lg transition-colors">
                            <Receipt className="w-3.5 h-3.5"/>Receipt
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
