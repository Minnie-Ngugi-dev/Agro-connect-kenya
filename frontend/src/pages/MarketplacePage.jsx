import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api.js';
import { useCart } from '../context/CartContext.jsx';
import Spinner from '../components/common/Spinner.jsx';
import { ChevronLeft, ChevronRight, Heart, ShoppingCart, MapPin, Eye, Plus } from 'lucide-react';

const CATS = ['Vegetables','Fruits','Cereals','Legumes','Tubers','Dairy','Poultry','Other'];
const COUNTIES = ['Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Nyeri','Meru','Machakos','Kakamega','Kisii','Kiambu','Muranga','Embu'];

const CAT_IMG = {
  Vegetables:'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&q=80',
  Fruits:'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=300&q=80',
  Cereals:'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&q=80',
  Legumes:'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=300&q=80',
  Tubers:'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&q=80',
  Dairy:'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&q=80',
  Poultry:'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=300&q=80',
  Other:'https://images.unsplash.com/photo-1471943311424-646960669fbc?w=300&q=80',
};
const PROD_IMG = {
  Vegetables:['https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80','https://images.unsplash.com/photo-1506484381205-f7945653044d?w=400&q=80','https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=400&q=80'],
  Fruits:['https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&q=80','https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80','https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80'],
  Cereals:['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80','https://images.unsplash.com/photo-1508747703725-719777637510?w=400&q=80','https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80'],
  Legumes:['https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=400&q=80','https://images.unsplash.com/photo-1602752079038-46f582f5c25b?w=400&q=80'],
  Tubers:['https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80','https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=400&q=80'],
  Dairy:['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80','https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=400&q=80'],
  Poultry:['https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&q=80','https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&q=80'],
  Other:['https://images.unsplash.com/photo-1471943311424-646960669fbc?w=400&q=80','https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&q=80'],
};
const getProdImg = (cat, name) => { const imgs = PROD_IMG[cat] || PROD_IMG.Other; return imgs[name.split('').reduce((a,c)=>a+c.charCodeAt(0),0) % imgs.length]; };

const SLIDES = [
  {bg:'from-forest-900 to-forest-700',badge:'100% Genuine Product Served',h1:'Tasty & Healthy',h2:'Organic Food',desc:'Fresh from Kenyan farms to your table — no middlemen, fair prices.',img:'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=500&q=80'},
  {bg:'from-emerald-800 to-teal-700',badge:'Season Fresh Picks',h1:'Farm Fresh',h2:'Direct to You',desc:'Sourced from certified smallholder farmers across Kenya.',img:'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80'},
  {bg:'from-lime-800 to-forest-700',badge:'Pay with M-Pesa',h1:'Easy & Secure',h2:'Payments',desc:'Instant STK Push. Any Safaricom number format accepted.',img:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&q=80'},
];

function Countdown() {
  const [t, setT] = useState({d:7,h:12,m:30,s:0});
  useEffect(()=>{const id=setInterval(()=>setT(p=>{if(p.s>0)return{...p,s:p.s-1};if(p.m>0)return{...p,m:p.m-1,s:59};if(p.h>0)return{...p,h:p.h-1,m:59,s:59};if(p.d>0)return{d:p.d-1,h:23,m:59,s:59};return p;}),1000);return()=>clearInterval(id);},[]);
  return <div className="flex gap-2">{[{v:t.d,l:'Days'},{v:t.h,l:'Hrs'},{v:t.m,l:'Mins'},{v:t.s,l:'Secs'}].map(({v,l})=><div key={l} className="text-center"><div className="bg-forest-600 text-white font-bold text-xl w-14 h-10 flex items-center justify-center rounded">{String(v).padStart(2,'0')}</div><div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{l}</div></div>)}</div>;
}

function PCard({ p }) {
  const { addItem } = useCart();
  const [w, setW] = useState(false);
  const img = p.images?.[0] || getProdImg(p.category, p.name);
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden group hover:shadow-lg transition-all">
      <div className="relative h-44 overflow-hidden">
        <img src={img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={e=>{e.target.src=CAT_IMG[p.category]||CAT_IMG.Other;}} />
        {p.isFeatured && <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded">FEATURED</div>}
        <button onClick={()=>setW(!w)} className="absolute top-2 right-2 w-8 h-8 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow">
          <Heart className={`w-4 h-4 ${w?'fill-red-500 text-red-500':'text-gray-400'}`} />
        </button>
        <div className="absolute bottom-0 left-0 right-0 bg-forest-600 text-white text-xs text-center py-1.5 translate-y-full group-hover:translate-y-0 transition-transform duration-200 font-semibold flex items-center justify-center gap-1">
          <Link to={`/marketplace/${p._id}`} className="flex items-center gap-1"><ShoppingCart className="w-3.5 h-3.5"/>Order Now</Link>
        </div>
      </div>
      <div className="p-3">
        <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">{p.category}</div>
        <h3 className="font-semibold text-gray-800 dark:text-white text-sm truncate">
          <Link to={`/marketplace/${p._id}`} className="hover:text-forest-600 transition-colors">{p.name}</Link>
        </h3>
        <div className="flex items-center gap-1 mt-1 text-xs text-gray-400"><MapPin className="w-3 h-3"/>{p.location?.county}</div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-forest-600 font-bold">KSh {p.pricePerUnit?.toLocaleString()}</span>
          <span className="text-gray-400 line-through text-xs">KSh {Math.round(p.pricePerUnit*1.25).toLocaleString()}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-400 flex items-center gap-1"><Eye className="w-3 h-3"/>{p.views||0}</span>
          <button onClick={()=>addItem(p._id,1)} className="flex items-center gap-1 text-xs bg-forest-50 dark:bg-forest-900/30 hover:bg-forest-100 text-forest-700 dark:text-forest-400 font-medium px-2 py-1 rounded-lg transition-colors">
            <Plus className="w-3 h-3"/>Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [heroIdx, setHeroIdx]   = useState(0);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(1);
  const [searchInput, setSearchInput] = useState(searchParams.get('search')||'');
  const [filters, setFilters] = useState({search:searchParams.get('search')||'',category:searchParams.get('category')||'',county:'',page:1});

  const fetchProducts = useCallback(async()=>{
    setLoading(true);
    try{const{data}=await api.get('/products',{params:{...Object.fromEntries(Object.entries(filters).filter(([,v])=>v!=='')),limit:20}});setProducts(data.products);setTotal(data.total);setPages(data.pages);}
    catch{setProducts([]);}finally{setLoading(false);}
  },[filters]);

  useEffect(()=>{fetchProducts();},[fetchProducts]);
  useEffect(()=>{api.get('/products',{params:{limit:4,sort:'-views'}}).then(({data})=>setFeatured(data.products)).catch(()=>{});},[]);
  useEffect(()=>{const id=setInterval(()=>setHeroIdx(i=>(i+1)%SLIDES.length),5000);return()=>clearInterval(id);},[]);

  const af=(k,v)=>setFilters(f=>({...f,[k]:v,page:1}));
  const clearAll=()=>{setFilters({search:'',category:'',county:'',page:1});setSearchInput('');};
  const isF=!!(filters.search||filters.category||filters.county);
  const sl=SLIDES[heroIdx];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Announcement */}
      <div className="bg-forest-700 text-white text-center text-xs py-2 font-medium">
        🎉 GET 20% OFF ALL ORDERS THIS WEEK! &nbsp;<button onClick={clearAll} className="underline font-bold">SHOP NOW</button>
      </div>
      {/* Search */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-3 px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <form onSubmit={e=>{e.preventDefault();af('search',searchInput);}} className="flex flex-1 max-w-2xl">
            <select className="border border-r-0 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-l-lg px-3 py-2 text-sm focus:outline-none" value={filters.category} onChange={e=>af('category',e.target.value)}>
              <option value="">All Categories</option>{CATS.map(c=><option key={c}>{c}</option>)}
            </select>
            <input type="text" placeholder="Search Item..." className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-forest-500" value={searchInput} onChange={e=>setSearchInput(e.target.value)}/>
            <button type="submit" className="bg-forest-600 hover:bg-forest-700 text-white px-6 py-2 rounded-r-lg font-semibold text-sm">SEARCH</button>
          </form>
          <select className="hidden md:block border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none" value={filters.county} onChange={e=>af('county',e.target.value)}>
            <option value="">All Counties</option>{COUNTIES.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {!isF && <>
          {/* Hero + sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
            <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-forest-600 text-white font-bold px-4 py-3 text-sm uppercase">Shop by Categories</div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {CATS.map(cat=><button key={cat} onClick={()=>af('category',cat)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-forest-50 dark:hover:bg-gray-700 hover:text-forest-700 text-sm text-gray-700 dark:text-gray-300 text-left">
                  <img src={CAT_IMG[cat]} alt={cat} className="w-6 h-6 rounded-full object-cover"/>{cat}
                </button>)}
              </div>
            </div>
            <div className={`lg:col-span-2 rounded-xl overflow-hidden relative bg-gradient-to-r ${sl.bg} text-white min-h-[280px] flex items-center`}>
              <div className="flex-1 p-8 z-10 relative">
                <div className="text-xs font-medium bg-white/20 inline-block px-3 py-1 rounded-full mb-3">{sl.badge}</div>
                <h1 className="font-display text-3xl font-bold">{sl.h1}<br/><span className="text-earth-400">{sl.h2}</span></h1>
                <p className="mt-2 text-sm text-forest-100 max-w-xs">{sl.desc}</p>
                <Link to="/marketplace" className="mt-5 inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-lg text-sm">Shop Now ▶</Link>
              </div>
              <div className="absolute right-0 bottom-0 w-48 h-full"><img src={sl.img} alt="" className="w-full h-full object-cover opacity-75" onError={e=>{e.target.style.display='none';}}/></div>
              <div className="absolute bottom-3 left-8 flex gap-1.5">{SLIDES.map((_,i)=><button key={i} onClick={()=>setHeroIdx(i)} className={`w-5 h-1.5 rounded-full transition-all ${i===heroIdx?'bg-white':'bg-white/40'}`}/>)}</div>
            </div>
            <div className="bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl p-5 text-white flex flex-col justify-between min-h-[280px] relative">
              <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rotate-12 rounded">Special Offer</div>
              <div><div className="text-xs opacity-80">Summer Sale</div><div className="text-4xl font-black text-yellow-200">50% OFF</div><div className="font-bold text-lg">Fresh Produce</div></div>
              <button onClick={()=>af('category','Fruits')} className="mt-3 bg-forest-700 hover:bg-forest-800 text-white font-bold py-2 rounded-lg text-sm">SHOP NOW ▶</button>
            </div>
          </div>
          {/* Categories */}
          <div className="mb-10">
            <div className="text-center mb-6"><div className="text-forest-600 italic text-sm">Our Story</div><h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Categories</h2></div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {CATS.map(cat=><button key={cat} onClick={()=>af('category',cat)} className="flex flex-col items-center group">
                <div className="w-full aspect-square rounded-xl overflow-hidden border-2 border-transparent group-hover:border-forest-400 transition-all shadow-sm"><img src={CAT_IMG[cat]} alt={cat} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"/></div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1.5 text-center">{cat}</span>
              </button>)}
            </div>
          </div>
          {/* Deals */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div>
                <div className="text-forest-600 italic text-sm">Deals Of The Day</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">Grab The Best Offer of This Week!</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Hurry up! Offers end in:</p>
                <div className="mt-3"><Countdown/></div>
                <button onClick={clearAll} className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-lg text-sm">VIEW ALL ▶</button>
              </div>
              {featured.slice(0,2).map(p=>(
                <div key={p._id} className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-36 bg-gray-50 dark:bg-gray-700 overflow-hidden"><img src={p.images?.[0]||getProdImg(p.category,p.name)} alt={p.name} className="w-full h-full object-cover" onError={e=>{e.target.src=CAT_IMG[p.category]||CAT_IMG.Other;}}/></div>
                  <div className="p-3"><div className="text-xs text-gray-400 uppercase">{p.category}</div><h3 className="font-semibold text-sm dark:text-white truncate">{p.name}</h3>
                  <div className="flex items-center gap-2 mt-1"><span className="text-forest-600 font-bold">KSh {p.pricePerUnit?.toLocaleString()}</span><span className="text-gray-400 line-through text-xs">KSh {Math.round(p.pricePerUnit*1.25).toLocaleString()}</span></div>
                  <Link to={`/marketplace/${p._id}`} className="mt-2 w-full block text-center bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold py-2 rounded-lg">ADD TO CART</Link></div>
                </div>
              ))}
            </div>
          </div>
        </>}

        {isF && <div className="flex items-center gap-3 mb-5">
          <h2 className="font-bold text-gray-800 dark:text-white text-lg">{filters.category||'All Products'}{filters.search&&` — "${filters.search}"`}</h2>
          <span className="text-sm text-gray-500">{total} results</span>
          <button onClick={clearAll} className="ml-auto text-sm text-red-500 font-medium">✕ Clear</button>
        </div>}

        {!isF && <div className="flex items-center justify-between mb-4"><div className="text-forest-600 italic text-sm">Fresh Arrivals</div><h2 className="text-xl font-bold text-gray-900 dark:text-white">All Products</h2><span className="text-sm text-gray-400">{total} products</span></div>}

        {loading ? <Spinner size="lg" className="py-20"/> : products.length===0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <span className="text-6xl">🌿</span><h3 className="font-bold text-gray-700 dark:text-gray-300 mt-4 text-lg">No products found</h3>
            <button onClick={clearAll} className="mt-4 btn-primary text-sm">View All</button>
          </div>
        ) : (<>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">{products.map(p=><PCard key={p._id} p={p}/>)}</div>
          {pages>1&&<div className="flex justify-center items-center gap-2 mt-8">
            <button onClick={()=>af('page',filters.page-1)} disabled={filters.page<=1} className="w-9 h-9 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded hover:bg-forest-50 dark:hover:bg-gray-700 disabled:opacity-40"><ChevronLeft className="w-4 h-4"/></button>
            {Array.from({length:Math.min(pages,7)},(_,i)=>i+1).map(pg=><button key={pg} onClick={()=>af('page',pg)} className={`w-9 h-9 rounded text-sm font-medium ${filters.page===pg?'bg-forest-600 text-white':'border border-gray-300 dark:border-gray-600 hover:bg-forest-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>{pg}</button>)}
            <button onClick={()=>af('page',filters.page+1)} disabled={filters.page>=pages} className="w-9 h-9 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded hover:bg-forest-50 dark:hover:bg-gray-700 disabled:opacity-40"><ChevronRight className="w-4 h-4"/></button>
          </div>}
        </>)}
      </div>
    </div>
  );
}
