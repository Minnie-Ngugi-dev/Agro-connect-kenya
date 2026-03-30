import { Link } from 'react-router-dom';
import { Sprout, ArrowRight, CheckCircle } from 'lucide-react';

const CATS = [
  {e:'🍅',l:'Vegetables'},{e:'🍓',l:'Fruits'},{e:'🌽',l:'Cereals'},{e:'🫘',l:'Legumes'},
  {e:'🥔',l:'Tubers'},{e:'🥛',l:'Dairy'},{e:'🐔',l:'Poultry'},{e:'🍯',l:'Other'},
];
const FEATURES = [
  {icon:'🔗',t:'Zero Middlemen',d:'Farmers list directly. Buyers purchase directly. No brokers taking 40–60% of the profit.'},
  {icon:'💳',t:'M-Pesa Payments',d:'Instant STK Push. Accepts any format: 0712..., +254712..., or 712... — all supported.'},
  {icon:'📍',t:'County-Wide Reach',d:'Filter by county, category, or price. Connect with farmers across 18 Kenyan counties.'},
  {icon:'📱',t:'Mobile-First',d:'Built for farmers on the go. Works on any device, any screen size, any connection speed.'},
];
const STATS = [{v:'2,400+',l:'Active Farmers'},{v:'240+',l:'Products Listed'},{v:'18',l:'Counties Covered'},{v:'KSh 48M+',l:'Transactions'}];

export default function LandingPage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-forest-900 via-forest-800 to-forest-700 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4z'/%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-forest-600/50 border border-forest-500/50 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-earth-400 rounded-full animate-pulse" /> Kenya's #1 Agri-Marketplace
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Farm Fresh, <span className="text-earth-400">Direct</span> to You
            </h1>
            <p className="text-forest-200 text-lg md:text-xl mb-10 leading-relaxed">
              Agro-Connect bridges Kenyan farmers and buyers. List produce, discover fresh crops, and pay instantly with M-Pesa.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/marketplace" className="flex items-center gap-2 bg-earth-400 hover:bg-earth-500 text-gray-900 font-bold px-7 py-3.5 rounded-2xl transition-all active:scale-95">
                Browse Marketplace <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/register" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-7 py-3.5 rounded-2xl transition-all active:scale-95">
                <Sprout className="w-5 h-5" /> Join as Farmer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="bg-forest-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-forest-700">
            {STATS.map(s => (
              <div key={s.l} className="py-6 px-6 text-center">
                <div className="text-2xl md:text-3xl font-bold text-earth-400 font-display">{s.v}</div>
                <div className="text-forest-300 text-sm mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="page-header mb-2">Browse by Category</h2>
          <p className="text-gray-500 dark:text-gray-400">Fresh produce across all crop types</p>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {CATS.map(c => (
            <Link key={c.l} to={`/marketplace?category=${c.l}`}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-forest-50 dark:hover:bg-gray-800 border border-transparent hover:border-forest-100 dark:hover:border-gray-700 transition-all group">
              <span className="text-3xl group-hover:scale-110 transition-transform">{c.e}</span>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center">{c.l}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="page-header mb-2">Why Agro-Connect?</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">Built specifically for Kenyan farmers and buyers.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(f => (
              <div key={f.t} className="card p-6 hover:shadow-md transition-shadow dark:hover:shadow-gray-700">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-2">{f.t}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <h2 className="page-header text-3xl md:text-4xl mb-4">Ready to grow your <span className="text-forest-600">income?</span></h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Join thousands of Kenyan farmers already selling on Agro-Connect.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/register?role=farmer" className="btn-primary text-base px-8 py-3.5 rounded-2xl">🌾 Start Selling</Link>
          <Link to="/register?role=buyer" className="btn-secondary text-base px-8 py-3.5 rounded-2xl">🛒 Start Buying</Link>
          <Link to="/register?role=hotel" className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3.5 rounded-2xl transition-all active:scale-95">🏨 Hotel/Restaurant</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-forest-900 text-forest-300 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2"><Sprout className="w-5 h-5 text-forest-400" /><span className="font-display font-bold text-white">Agro-Connect Kenya</span></div>
          <p className="text-sm">© {new Date().getFullYear()} Agro-Connect Kenya. Empowering smallholder farmers. 🇰🇪</p>
          <div className="flex gap-4 text-sm">
            <Link to="/marketplace" className="hover:text-white transition-colors">Marketplace</Link>
            <Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
