import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Package, Search, CreditCard, Truck, CheckCircle, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

const FARMER_STEPS = [
  {n:1,icon:UserPlus,color:'bg-forest-100 text-forest-700',t:'Register as a Farmer',d:"Create your free account, select 'Farmer' as your role, and fill in your county."},
  {n:2,icon:Package,color:'bg-blue-100 text-blue-700',t:'List Your Produce',d:'Go to Farmer Dashboard → Add Produce. Enter the crop name, category, quantity, unit, and your price.'},
  {n:3,icon:CheckCircle,color:'bg-purple-100 text-purple-700',t:'Receive Orders',d:'When a buyer places an order you\'ll see it in your Orders tab. Review and confirm.'},
  {n:4,icon:CreditCard,color:'bg-amber-100 text-amber-700',t:'Get Paid via M-Pesa',d:'Buyer pays via M-Pesa STK Push. Once Safaricom confirms, your order is marked Paid instantly.'},
  {n:5,icon:Truck,color:'bg-rose-100 text-rose-700',t:'Arrange Delivery',d:'Coordinate with the buyer using the contact details. Update order status as it progresses.'},
];

const BUYER_STEPS = [
  {n:1,icon:UserPlus,color:'bg-forest-100 text-forest-700',t:'Register as a Buyer',d:"Create a free account and select 'Buyer'. Add your delivery county to see nearby farmers."},
  {n:2,icon:Search,color:'bg-blue-100 text-blue-700',t:'Browse Fresh Produce',d:'Visit the Marketplace. Search by crop name or filter by category, county, and price range.'},
  {n:3,icon:Package,color:'bg-purple-100 text-purple-700',t:'Place an Order',d:'Click a product, choose quantity and delivery address. Add multiple items to your cart and checkout together.'},
  {n:4,icon:CreditCard,color:'bg-amber-100 text-amber-700',t:'Pay via M-Pesa',d:'Enter your Safaricom number in any format (0712..., +254712..., 712...). Receive STK Push and enter your PIN.'},
  {n:5,icon:Truck,color:'bg-rose-100 text-rose-700',t:'Receive Your Order',d:'Track order status in your Buyer Dashboard. Download a PDF receipt once payment is confirmed.'},
];

const FAQS = [
  {q:'Is Agro-Connect Kenya free to use?',a:'Registration is 100% free. A 2–3% commission applies on completed transactions.'},
  {q:'What phone number formats does M-Pesa accept?',a:'Any Kenyan Safaricom format: 0712345678, +254712345678, 254712345678, or 712345678. We normalize automatically.'},
  {q:'What if my M-Pesa payment fails?',a:'Your order stays "unpaid". Retry from the Buyer Dashboard by clicking "Pay Now" on the order.'},
  {q:'Can hotels and restaurants order in bulk?',a:'Yes! Register with the Hotel/Restaurant role to access bulk ordering with automatic 5% discount.'},
  {q:'How do I track my order?',a:'Buyer Dashboard → My Orders. Live status: Pending → Confirmed → Processing → Shipped → Delivered.'},
  {q:'Can farmers list any crop type?',a:'Absolutely. Products are not predefined — list any crop across 8 categories: Vegetables, Fruits, Cereals, Legumes, Tubers, Dairy, Poultry, and Other.'},
];

function Step({ n, icon: Icon, color, t, d, isLast }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}><Icon className="w-6 h-6"/></div>
        {!isLast && <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 my-2 min-h-[32px]"/>}
      </div>
      <div className="pb-8">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Step {n}</div>
        <h3 className="font-display font-bold text-gray-900 dark:text-white text-lg">{t}</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1 leading-relaxed text-sm">{d}</p>
      </div>
    </div>
  );
}

function Faq({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button onClick={()=>setOpen(!open)} className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        <span className="font-semibold text-gray-800 dark:text-white text-sm pr-4">{q}</span>
        {open ? <ChevronUp className="w-5 h-5 text-forest-600 flex-shrink-0"/> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0"/>}
      </button>
      {open && <div className="px-4 pb-4"><p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{a}</p></div>}
    </div>
  );
}

export default function HowItWorksPage() {
  const [role, setRole] = useState('farmer');
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <div className="bg-gradient-to-br from-forest-800 to-forest-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-4xl font-bold mb-4">How Agro-Connect Kenya Works</h1>
          <p className="text-forest-100 text-lg max-w-2xl mx-auto">A transparent marketplace that removes middlemen and puts fair prices in the hands of farmers and buyers.</p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link to="/register?role=farmer" className="flex items-center gap-2 bg-white text-forest-700 font-bold px-6 py-3 rounded-xl hover:bg-forest-50 transition-colors">🌾 Join as Farmer <ArrowRight className="w-4 h-4"/></Link>
            <Link to="/register?role=buyer" className="flex items-center gap-2 bg-forest-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-forest-400 transition-colors">🛒 Join as Buyer <ArrowRight className="w-4 h-4"/></Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Role toggle */}
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-4">Step-by-Step Guide</h2>
          <div className="inline-flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 rounded-xl">
            {[{v:'farmer',e:'🌾',l:"I'm a Farmer"},{v:'buyer',e:'🛒',l:"I'm a Buyer"}].map(r=>(
              <button key={r.v} onClick={()=>setRole(r.v)} className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${role===r.v?'bg-forest-600 text-white':'text-gray-600 dark:text-gray-400 hover:text-forest-600'}`}>
                {r.e} {r.l}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Steps */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm">
            {(role==='farmer'?FARMER_STEPS:BUYER_STEPS).map((s,i,a)=><Step key={s.n} {...s} isLast={i===a.length-1}/>)}
          </div>
          {/* Benefits + M-Pesa flow */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h3 className="font-display font-bold text-gray-900 dark:text-white mb-4">✅ Key Benefits for {role==='farmer'?'Farmers':'Buyers'}</h3>
              <ul className="space-y-3">
                {(role==='farmer'
                  ?['Sell directly — keep 97% of earnings','No middlemen taking your profit','Reach buyers across 18 Kenyan counties','Get paid instantly via M-Pesa','List any crop — fully flexible','Track all orders and revenue in one place']
                  :['Buy directly from certified farmers','Fair, transparent prices — no markup','Filter by county, category, or price','Pay securely with M-Pesa','Download PDF receipts','Track orders from placement to delivery']
                ).map(b=>(
                  <li key={b} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-forest-500 flex-shrink-0 mt-0.5"/>{b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-forest-50 dark:bg-forest-900/20 border border-forest-200 dark:border-forest-800 rounded-2xl p-6">
              <h3 className="font-display font-bold text-forest-800 dark:text-forest-300 mb-4">💳 M-Pesa Payment Flow</h3>
              <div className="space-y-3">
                {["Buyer clicks 'Pay' and enters their Safaricom number","Safaricom sends an STK Push prompt to their phone","Buyer enters their M-Pesa PIN","Safaricom confirms the transaction","Order status updates to 'Paid' in real time","Both farmer and buyer receive confirmation"].map((s,i)=>(
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-forest-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i+1}</span>
                    <span className="text-sm text-forest-800 dark:text-forest-300">{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-r from-forest-700 to-forest-600 text-white rounded-2xl p-6 text-center">
              <p className="font-display font-bold text-lg mb-2">Ready to get started?</p>
              <p className="text-forest-200 text-sm mb-4">Join 2,400+ farmers already on the platform</p>
              <Link to={`/register?role=${role}`} className="inline-block bg-white text-forest-700 font-bold px-6 py-2.5 rounded-xl hover:bg-forest-50 transition-colors">Create Free Account →</Link>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-3">{FAQS.map(f=><Faq key={f.q} {...f}/>)}</div>
        </div>
      </div>
    </div>
  );
}
