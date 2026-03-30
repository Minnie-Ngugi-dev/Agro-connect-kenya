import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Sprout, Eye, EyeOff, Phone, Lock } from 'lucide-react';
import Spinner from '../components/common/Spinner.jsx';

const COUNTIES = ['Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Nyeri','Meru','Machakos','Kakamega','Kisii','Kiambu','Muranga','Embu','Other'];

export function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;
  const [form, setForm] = useState({ phone: '', password: '' });
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(form.phone, form.password);
      const dest = from || (user.role === 'farmer' ? '/farmer' : user.role === 'admin' ? '/admin' : user.role === 'hotel' ? '/hotel' : '/buyer');
      navigate(dest, { replace: true });
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-forest-600 rounded-xl flex items-center justify-center"><Sprout className="w-6 h-6 text-white" /></div>
            <span className="font-display font-bold text-xl text-gray-900 dark:text-white">Agro<span className="text-forest-600">-Connect</span></span>
          </Link>
          <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Welcome back</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Sign in to your account</p>
        </div>
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="tel" placeholder="0712345678" className="input pl-10" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPw ? 'text' : 'password'} placeholder="Your password" className="input pl-10 pr-10" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? <Spinner size="sm" className="inline" /> : 'Sign In'}
            </button>
          </form>
          {/* Demo credentials */}
          <div className="mt-4 p-3 bg-forest-50 dark:bg-gray-700 rounded-xl text-xs text-gray-600 dark:text-gray-300">
            <p className="font-semibold mb-1">Demo Accounts (run seed first):</p>
            <p>🌾 Farmer: +254712345001 / farmer123</p>
            <p>🛒 Buyer:  +254712000001 / buyer123</p>
            <p>🏨 Hotel:  +254712000002 / hotel123</p>
            <p>⚙️ Admin:  +254700000001 / admin123</p>
          </div>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            No account? <Link to="/register" className="text-forest-600 font-semibold hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const defaultRole = new URLSearchParams(location.search).get('role') || 'buyer';
  const [form, setForm] = useState({ name: '', phone: '', password: '', confirm: '', role: defaultRole, county: '', town: '', businessName: '' });
  const [showPw, setShowPw] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return alert('Passwords do not match');
    try {
      const payload = {
        name: form.name, phone: form.phone, password: form.password, role: form.role,
        location: { county: form.county, town: form.town },
        ...(form.role === 'hotel' ? { hotelDetails: { businessName: form.businessName, businessType: 'hotel' } } : {}),
      };
      const user = await register(payload);
      navigate(user.role === 'farmer' ? '/farmer' : user.role === 'hotel' ? '/hotel' : '/buyer', { replace: true });
    } catch {}
  };

  const roles = [{ v: 'buyer', e: '🛒', l: 'Buyer' }, { v: 'farmer', e: '🌾', l: 'Farmer' }, { v: 'hotel', e: '🏨', l: 'Hotel/Restaurant' }];

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-forest-600 rounded-xl flex items-center justify-center"><Sprout className="w-6 h-6 text-white" /></div>
            <span className="font-display font-bold text-xl text-gray-900 dark:text-white">Agro<span className="text-forest-600">-Connect</span></span>
          </Link>
          <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Create your account</h1>
        </div>
        <div className="card p-8">
          {/* Role */}
          <div className="flex gap-2 mb-5">
            {roles.map(r => (
              <button key={r.v} type="button" onClick={() => set('role', r.v)}
                className={`flex-1 py-2.5 rounded-xl font-medium text-xs border-2 transition-all ${form.role === r.v ? 'border-forest-600 bg-forest-600 text-white' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-forest-300'}`}>
                {r.e} {r.l}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label">Full Name</label><input className="input" placeholder="Jane Wanjiku" value={form.name} onChange={e => set('name', e.target.value)} required /></div>
            {form.role === 'hotel' && <div><label className="label">Business Name</label><input className="input" placeholder="Sarova Hotel" value={form.businessName} onChange={e => set('businessName', e.target.value)} /></div>}
            <div><label className="label">Phone</label><input type="tel" className="input" placeholder="0712345678" value={form.phone} onChange={e => set('phone', e.target.value)} required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">County</label><select className="input" value={form.county} onChange={e => set('county', e.target.value)} required><option value="">Select</option>{COUNTIES.map(c => <option key={c}>{c}</option>)}</select></div>
              <div><label className="label">Town</label><input className="input" placeholder="e.g. Naivasha" value={form.town} onChange={e => set('town', e.target.value)} /></div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input pr-10" placeholder="Min 6 characters" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div><label className="label">Confirm Password</label><input type="password" className="input" placeholder="Repeat password" value={form.confirm} onChange={e => set('confirm', e.target.value)} required /></div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? <Spinner size="sm" className="inline" /> : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Have an account? <Link to="/login" className="text-forest-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
