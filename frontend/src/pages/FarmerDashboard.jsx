import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/common/Spinner.jsx';
import toast from 'react-hot-toast';
import { Plus, Package, ShoppingBag, TrendingUp, Edit, Trash2, ToggleLeft, ToggleRight, Eye, BarChart2 } from 'lucide-react';

const CATS = ['Fruits','Vegetables','Cereals','Legumes','Tubers','Dairy','Poultry','Other'];
const UNITS = ['kg','g','tonnes','bags','crates','pieces','litres','bunches'];
const COUNTIES = ['Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Nyeri','Meru','Machakos','Kakamega','Kisii','Kiambu','Muranga','Embu','Other'];
const CAT_IMG = {Vegetables:'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=80&q=80',Fruits:'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=80&q=80',Cereals:'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=80&q=80',Legumes:'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=80&q=80',Tubers:'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=80&q=80',Dairy:'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=80&q=80',Poultry:'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=80&q=80',Other:'https://images.unsplash.com/photo-1471943311424-646960669fbc?w=80&q=80'};
const ST_COLOR = {pending:'bg-yellow-100 text-yellow-700',confirmed:'bg-blue-100 text-blue-700',processing:'bg-indigo-100 text-indigo-700',shipped:'bg-purple-100 text-purple-700',delivered:'bg-green-100 text-green-700',cancelled:'bg-red-100 text-red-700'};

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('listings');
  const [listings, setListings] = useState([]);
  const [orders, setOrders]     = useState([]);
  const [loadingL, setLoadingL] = useState(true);
  const [loadingO, setLoadingO] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editP, setEditP]       = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const empty = {name:'',category:'Vegetables',description:'',quantity:'',unit:'kg',pricePerUnit:'',county:'Nairobi',town:'',tags:''};
  const [form, setForm] = useState(empty);

  const fetchL = async () => { setLoadingL(true); try { const {data}=await api.get('/products/my-listings'); setListings(data.products); } catch { toast.error('Failed'); } finally { setLoadingL(false); } };
  const fetchO = async () => { setLoadingO(true); try { const {data}=await api.get('/orders/farmer-orders'); setOrders(data.orders); } catch { toast.error('Failed'); } finally { setLoadingO(false); } };
  useEffect(()=>{ fetchL(); },[]);
  useEffect(()=>{ if(tab==='orders') fetchO(); },[tab]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const payload = { ...form, quantity:Number(form.quantity), pricePerUnit:Number(form.pricePerUnit), tags:form.tags?form.tags.split(',').map(t=>t.trim().toLowerCase()):[], location:{county:form.county,town:form.town} };
      if (editP) { await api.put(`/products/${editP._id}`,payload); toast.success('Updated!'); }
      else { await api.post('/products',payload); toast.success('Listed!'); }
      setShowForm(false); setEditP(null); setForm(empty); fetchL();
    } catch (err) { toast.error(err.response?.data?.message||'Failed'); }
    finally { setSubmitting(false); }
  };

  const openEdit = (p) => { setEditP(p); setForm({name:p.name,category:p.category,description:p.description||'',quantity:p.quantity,unit:p.unit,pricePerUnit:p.pricePerUnit,county:p.location?.county||'',town:p.location?.town||'',tags:p.tags?.join(', ')||''}); setShowForm(true); };
  const del = async (id) => { if(!confirm('Delete?')) return; try { await api.delete(`/products/${id}`); toast.success('Deleted'); setListings(listings.filter(p=>p._id!==id)); } catch { toast.error('Failed'); } };
  const toggleAvail = async (p) => { try { await api.put(`/products/${p._id}`,{isAvailable:!p.isAvailable}); setListings(listings.map(l=>l._id===p._id?{...l,isAvailable:!l.isAvailable}:l)); } catch { toast.error('Failed'); } };
  const updateStatus = async (oid,status) => { try { await api.put(`/orders/${oid}/status`,{status}); setOrders(orders.map(o=>o._id===oid?{...o,status}:o)); toast.success('Updated'); } catch { toast.error('Failed'); } };

  const revenue = orders.filter(o=>o.paymentStatus==='paid').reduce((s,o)=>s+o.totalPrice,0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-forest-100 dark:bg-forest-900/30 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
              {user?.profileImage ? <img src={user.profileImage} alt="" className="w-full h-full object-cover"/> : <span className="text-forest-700 dark:text-forest-400 font-bold text-xl">{user?.name?.[0]?.toUpperCase()}</span>}
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-gray-900 dark:text-white">Welcome, {user?.name} 🌾</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Farmer Dashboard</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[{l:'Active Listings',v:listings.filter(p=>p.isAvailable).length,Icon:Package,c:'bg-forest-50 dark:bg-forest-900/20 text-forest-700 dark:text-forest-400'},{l:'Total Orders',v:orders.length,Icon:ShoppingBag,c:'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'},{l:'Revenue (KSh)',v:revenue.toLocaleString(),Icon:TrendingUp,c:'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'}].map(({l,v,Icon,c})=>(
              <div key={l} className={`${c} rounded-xl p-4 flex items-center gap-3`}><Icon className="w-6 h-6 opacity-70 flex-shrink-0"/><div><div className="text-xl font-bold font-display">{v}</div><div className="text-xs opacity-70">{l}</div></div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 rounded-xl w-fit mb-6">
          {['listings','orders','analytics'].map(t=><button key={t} onClick={()=>setTab(t)} className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab===t?'bg-forest-600 text-white':'text-gray-600 dark:text-gray-400 hover:text-forest-600'}`}>{t}</button>)}
        </div>

        {tab==='listings' && <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg text-gray-800 dark:text-white">My Listings ({listings.length})</h2>
            <button onClick={()=>{setShowForm(true);setEditP(null);setForm(empty);}} className="btn-primary flex items-center gap-2 text-sm py-2"><Plus className="w-4 h-4"/>Add Produce</button>
          </div>
          {showForm && (
            <div className="bg-white dark:bg-gray-800 border-2 border-forest-200 dark:border-forest-700 rounded-2xl p-6 mb-6 shadow-sm">
              <h3 className="font-display font-bold text-gray-900 dark:text-white mb-5">{editP?'✏️ Edit Listing':'➕ New Listing'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="label">Product Name *</label><input className="input" placeholder="e.g. Organic Tomatoes" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></div>
                  <div><label className="label">Category *</label><select className="input" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
                  <div><label className="label">Quantity *</label><input type="number" min="0" className="input" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} required/></div>
                  <div><label className="label">Unit *</label><select className="input" value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})}>{UNITS.map(u=><option key={u}>{u}</option>)}</select></div>
                  <div><label className="label">Price per Unit (KSh) *</label><input type="number" min="0" className="input" value={form.pricePerUnit} onChange={e=>setForm({...form,pricePerUnit:e.target.value})} required/></div>
                  <div><label className="label">County *</label><select className="input" value={form.county} onChange={e=>setForm({...form,county:e.target.value})}>{COUNTIES.map(c=><option key={c}>{c}</option>)}</select></div>
                  <div><label className="label">Town</label><input className="input" placeholder="e.g. Ruiru" value={form.town} onChange={e=>setForm({...form,town:e.target.value})}/></div>
                  <div><label className="label">Tags (comma-separated)</label><input className="input" placeholder="organic, fresh" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})}/></div>
                  <div className="sm:col-span-2"><label className="label">Description</label><textarea className="input resize-none" rows={2} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button type="submit" disabled={submitting} className="btn-primary">{submitting?<Spinner size="sm" className="inline"/>:editP?'Save Changes':'List Product'}</button>
                  <button type="button" onClick={()=>setShowForm(false)} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          )}
          {loadingL ? <Spinner size="lg" className="py-16"/> : listings.length===0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"><span className="text-5xl">🌱</span><p className="mt-4 text-gray-500 dark:text-gray-400">No listings yet.</p></div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                  <tr>{['Product','Category','Price','Stock','Location','Status','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {listings.map(p=>(
                    <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-3"><div className="flex items-center gap-3"><img src={p.images?.[0]||CAT_IMG[p.category]||CAT_IMG.Other} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" onError={e=>{e.target.src=CAT_IMG[p.category]||CAT_IMG.Other;}}/><span className="font-medium text-gray-900 dark:text-white max-w-[120px] truncate">{p.name}</span></div></td>
                      <td className="px-4 py-3"><span className="badge bg-forest-100 dark:bg-forest-900/30 text-forest-700 dark:text-forest-400 text-xs">{p.category}</span></td>
                      <td className="px-4 py-3 font-semibold text-forest-700 dark:text-forest-400">KSh {p.pricePerUnit?.toLocaleString()}/{p.unit}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.quantity} {p.unit}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{p.location?.county}</td>
                      <td className="px-4 py-3"><span className={`badge text-xs ${p.isAvailable?'bg-green-100 text-green-700':'bg-red-100 text-red-600'}`}>{p.isAvailable?'Active':'Paused'}</span></td>
                      <td className="px-4 py-3"><div className="flex items-center gap-1">
                        <Link to={`/marketplace/${p._id}`} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><Eye className="w-4 h-4"/></Link>
                        <button onClick={()=>openEdit(p)} className="p-1.5 rounded-lg hover:bg-forest-50 dark:hover:bg-forest-900/20 text-gray-400 hover:text-forest-600"><Edit className="w-4 h-4"/></button>
                        <button onClick={()=>toggleAvail(p)} className={`p-1.5 rounded-lg ${p.isAvailable?'text-green-500':'text-gray-400'}`}>{p.isAvailable?<ToggleRight className="w-4 h-4"/>:<ToggleLeft className="w-4 h-4"/>}</button>
                        <button onClick={()=>del(p._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>}

        {tab==='orders' && <>
          <h2 className="font-display font-semibold text-lg text-gray-800 dark:text-white mb-4">Received Orders ({orders.length})</h2>
          {loadingO ? <Spinner size="lg" className="py-16"/> : orders.length===0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"><span className="text-5xl">📦</span><p className="mt-4 text-gray-500 dark:text-gray-400">No orders yet.</p></div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                  <tr>{['Product','Buyer','Qty','Total','Payment','Status','Update'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {orders.map(o=>(
                    <tr key={o._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white max-w-[120px] truncate">{o.product?.name}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400"><div>{o.buyer?.name}</div><div className="text-xs text-gray-400">{o.buyer?.phone}</div></td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{o.quantity} {o.product?.unit}</td>
                      <td className="px-4 py-3 font-semibold text-forest-700 dark:text-forest-400">KSh {o.totalPrice?.toLocaleString()}</td>
                      <td className="px-4 py-3"><span className={`badge text-xs ${o.paymentStatus==='paid'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>{o.paymentStatus}</span></td>
                      <td className="px-4 py-3"><span className={`badge text-xs ${ST_COLOR[o.status]||'bg-gray-100 text-gray-600'}`}>{o.status}</span></td>
                      <td className="px-4 py-3">{o.status!=='delivered'&&o.status!=='cancelled'&&<select value={o.status} onChange={e=>updateStatus(o._id,e.target.value)} className="input text-xs py-1 w-auto min-w-[110px]">{['pending','confirmed','processing','shipped','delivered','cancelled'].map(s=><option key={s} value={s}>{s}</option>)}</select>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>}

        {tab==='analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-display font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-forest-600"/>Sales Summary</h3>
              <div className="space-y-4">
                {[{l:'Total Listings',v:listings.length},{l:'Active Listings',v:listings.filter(p=>p.isAvailable).length},{l:'Total Orders',v:orders.length},{l:'Paid Orders',v:orders.filter(o=>o.paymentStatus==='paid').length},{l:'Total Revenue',v:`KSh ${revenue.toLocaleString()}`}].map(({l,v})=>(
                  <div key={l} className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{l}</span><span className="font-bold text-gray-900 dark:text-white">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-display font-semibold text-gray-800 dark:text-white mb-4">Listings by Category</h3>
              {CATS.map(cat=>{ const count=listings.filter(l=>l.category===cat).length; return count>0&&(<div key={cat} className="flex items-center gap-3 mb-3"><img src={CAT_IMG[cat]} alt={cat} className="w-6 h-6 rounded-full object-cover flex-shrink-0"/><span className="text-sm text-gray-600 dark:text-gray-400 flex-1">{cat}</span><div className="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-forest-500 rounded-full" style={{width:`${(count/listings.length)*100}%`}}/></div><span className="text-sm font-bold text-gray-900 dark:text-white w-6">{count}</span></div>); })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
