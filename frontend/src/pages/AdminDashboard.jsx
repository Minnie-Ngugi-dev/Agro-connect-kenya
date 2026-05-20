import { useState, useEffect } from 'react';
import api from '../utils/api.js';
import Spinner from '../components/common/Spinner.jsx';
import toast from 'react-hot-toast';
import { Users, Package, ShoppingBag, DollarSign, UserCheck, UserX, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers]         = useState([]);
  const [loadingA, setLoadingA]   = useState(true);
  const [loadingU, setLoadingU]   = useState(false);
  const [tab, setTab]             = useState('overview');
  const [search, setSearch]       = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(()=>{
    api.get('/admin/analytics').then(({data})=>setAnalytics(data.analytics)).catch(()=>toast.error('Failed')).finally(()=>setLoadingA(false));
  },[]);

  const fetchUsers = async () => {
    setLoadingU(true);
    try { const {data}=await api.get('/admin/users',{params:{search,role:roleFilter}}); setUsers(data.users); }
    catch { toast.error('Failed'); } finally { setLoadingU(false); }
  };
  useEffect(()=>{ if(tab==='users') fetchUsers(); },[tab,search,roleFilter]);

  const toggleUser = async (uid) => {
    try { const {data}=await api.put(`/admin/users/${uid}/toggle`); setUsers(users.map(u=>u._id===uid?{...u,isActive:data.user.isActive}:u)); toast.success(data.message); }
    catch { toast.error('Failed'); }
  };

  const Stat = ({l,v,Icon,c}) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${c}`}><Icon className="w-6 h-6"/></div>
      <div><div className="text-2xl font-bold font-display text-gray-900 dark:text-white">{v}</div><div className="text-sm text-gray-500 dark:text-gray-400">{l}</div></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gray-900 dark:bg-gray-950 text-white py-6 px-4 border-b border-gray-800">
        <div className="max-w-6xl mx-auto flex items-start justify-between gap-4 flex-wrap">
          <div><h1 className="font-display text-xl font-bold">⚙️ Admin Dashboard</h1><p className="text-gray-400 text-sm mt-0.5">Agro-Connect Kenya Management</p></div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-xs">
            <div className="font-bold text-green-400 mb-1">🔑 Default Admin</div>
            <div className="text-gray-300">Phone: <span className="text-green-400 font-mono">+254700000001</span></div>
            <div className="text-gray-300">Pass: <span className="text-green-400 font-mono">admin123</span></div>
            <div className="text-gray-500 mt-1">Run: node backend/scripts/seedProducts.js</div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 rounded-xl w-fit mb-6">
          {['overview','users'].map(t=><button key={t} onClick={()=>setTab(t)} className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab===t?'bg-gray-900 text-white':'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>{t}</button>)}
        </div>

        {tab==='overview' && (loadingA?<Spinner size="lg" className="py-16"/>:analytics&&(
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Stat l="Total Users" v={analytics.totalUsers} Icon={Users} c="bg-blue-100 text-blue-600"/>
              <Stat l="Products" v={analytics.totalProducts} Icon={Package} c="bg-green-100 text-green-600"/>
              <Stat l="Orders" v={analytics.totalOrders} Icon={ShoppingBag} c="bg-purple-100 text-purple-600"/>
              <Stat l="Revenue (KSh)" v={analytics.totalRevenue?.toLocaleString()} Icon={DollarSign} c="bg-amber-100 text-amber-600"/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                <h3 className="font-display font-semibold text-gray-800 dark:text-white mb-5 flex items-center gap-2"><Users className="w-4 h-4"/>User Roles</h3>
                {analytics.roleBreakdown?.map(({_id,count})=>(
                  <div key={_id} className="flex items-center gap-3 mb-4">
                    <span className="capitalize text-sm font-medium text-gray-700 dark:text-gray-300 w-16">{_id}</span>
                    <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-forest-500 rounded-full" style={{width:`${(count/analytics.totalUsers)*100}%`}}/></div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white w-8 text-right">{count}</span>
                  </div>
                ))}
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                <h3 className="font-display font-semibold text-gray-800 dark:text-white mb-5 flex items-center gap-2"><BarChart3 className="w-4 h-4"/>Products by Category</h3>
                {analytics.categoryStats?.slice(0,6).map(({_id,count})=>(
                  <div key={_id} className="flex items-center gap-3 mb-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-20 truncate">{_id}</span>
                    <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-amber-500 rounded-full" style={{width:`${(count/analytics.totalProducts)*100}%`}}/></div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white w-8 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
              <h3 className="font-display font-semibold text-gray-800 dark:text-white mb-4">Recent Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-100 dark:border-gray-700">{['Product','Buyer','Amount','Status','Date'].map(h=><th key={h} className="pb-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                    {analytics.recentOrders?.map(o=>(
                      <tr key={o._id}>
                        <td className="py-3 font-medium text-gray-900 dark:text-white">{o.product?.name}</td>
                        <td className="py-3 text-gray-600 dark:text-gray-400">{o.buyer?.name}</td>
                        <td className="py-3 text-gray-900 dark:text-white font-medium">KSh {o.totalPrice?.toLocaleString()}</td>
                        <td className="py-3"><span className={`badge text-xs ${o.status==='delivered'?'bg-green-100 text-green-700':o.status==='cancelled'?'bg-red-100 text-red-700':'bg-yellow-100 text-yellow-700'}`}>{o.status}</span></td>
                        <td className="py-3 text-gray-400">{new Date(o.createdAt).toLocaleDateString('en-KE',{day:'numeric',month:'short'})}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}

        {tab==='users' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <input type="text" placeholder="Search name or phone..." className="input flex-1 max-w-xs text-sm" value={search} onChange={e=>setSearch(e.target.value)}/>
              <select className="input text-sm w-auto" value={roleFilter} onChange={e=>setRoleFilter(e.target.value)}><option value="">All roles</option>{['farmer','buyer','admin','hotel'].map(r=><option key={r} value={r}>{r}</option>)}</select>
            </div>
            {loadingU?<Spinner size="lg" className="py-16"/>:(
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                    <tr>{['Name','Phone','Role','County','Joined','Status','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                    {users.map(u=>(
                      <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{u.name}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono text-xs">{u.phone}</td>
                        <td className="px-4 py-3"><span className={`badge text-xs capitalize ${u.role==='admin'?'bg-purple-100 text-purple-700':u.role==='farmer'?'bg-forest-100 text-forest-700':u.role==='hotel'?'bg-amber-100 text-amber-700':'bg-blue-100 text-blue-700'}`}>{u.role}</span></td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{u.location?.county||'—'}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString('en-KE',{day:'numeric',month:'short',year:'numeric'})}</td>
                        <td className="px-4 py-3"><span className={`badge text-xs ${u.isActive?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{u.isActive?'Active':'Inactive'}</span></td>
                        <td className="px-4 py-3"><button onClick={()=>toggleUser(u._id)} className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${u.isActive?'bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100':'bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100'}`}>
                          {u.isActive?<><UserX className="w-3.5 h-3.5"/>Deactivate</>:<><UserCheck className="w-3.5 h-3.5"/>Activate</>}
                        </button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
