import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
import Spinner from '../components/common/Spinner.jsx';
import { User, Lock, Camera, MapPin, Phone, Mail, Save, Eye, EyeOff } from 'lucide-react';

const COUNTIES = ['Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Nyeri','Meru','Machakos','Kakamega','Kisii','Kiambu','Muranga','Embu','Other'];

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const fileRef = useRef(null);
  const [profile, setProfile] = useState({ name: user?.name||'', email: user?.email||'', county: user?.location?.county||'', town: user?.location?.town||'' });
  const [savingP, setSavingP] = useState(false);
  const [passwords, setPasswords] = useState({ current:'', newPass:'', confirm:'' });
  const [showPw, setShowPw] = useState({ current:false, new:false });
  const [savingPw, setSavingPw] = useState(false);
  const [previewImg, setPreviewImg] = useState(user?.profileImage||null);
  const [uploadingImg, setUploadingImg] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault(); setSavingP(true);
    try {
      await api.put('/profile', { name: profile.name, email: profile.email, location: { county: profile.county, town: profile.town } });
      await refreshUser(); toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message||'Update failed'); }
    finally { setSavingP(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) return toast.error('Passwords do not match');
    setSavingPw(true);
    try {
      await api.put('/profile/password', { currentPassword: passwords.current, newPassword: passwords.newPass });
      toast.success('Password changed!'); setPasswords({ current:'', newPass:'', confirm:'' });
    } catch (err) { toast.error(err.response?.data?.message||'Change failed'); }
    finally { setSavingPw(false); }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 2*1024*1024) return toast.error('Image must be under 2MB');
    setUploadingImg(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      setPreviewImg(base64);
      try { await api.put('/profile/picture', { imageUrl: base64 }); await refreshUser(); toast.success('Picture updated!'); }
      catch { toast.error('Upload failed'); }
      setUploadingImg(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile Settings</h1>
        <div className="flex gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 rounded-xl w-fit mb-6">
          {['profile','password','picture'].map(t=>(
            <button key={t} onClick={()=>setTab(t)} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab===t?'bg-forest-600 text-white':'text-gray-600 dark:text-gray-400 hover:text-forest-600'}`}>
              {t==='profile'?'👤 Profile':t==='password'?'🔒 Password':'📷 Picture'}
            </button>
          ))}
        </div>

        {tab==='profile' && (
          <div className="card p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-forest-100 flex items-center justify-center flex-shrink-0">
                {user?.profileImage ? <img src={user.profileImage} alt="" className="w-full h-full object-cover"/> : <span className="text-forest-700 font-bold text-2xl">{user?.name?.[0]?.toUpperCase()}</span>}
              </div>
              <div><h2 className="font-display font-bold text-lg text-gray-900 dark:text-white">{user?.name}</h2><span className={`badge text-xs capitalize ${user?.role==='farmer'?'bg-forest-100 text-forest-700':user?.role==='admin'?'bg-purple-100 text-purple-700':user?.role==='hotel'?'bg-amber-100 text-amber-700':'bg-blue-100 text-blue-700'}`}>{user?.role}</span></div>
            </div>
            <form onSubmit={saveProfile} className="space-y-4">
              <div><label className="label flex items-center gap-1.5"><User className="w-3.5 h-3.5"/>Full Name</label><input className="input" value={profile.name} onChange={e=>setProfile({...profile,name:e.target.value})} required/></div>
              <div><label className="label flex items-center gap-1.5"><Phone className="w-3.5 h-3.5"/>Phone (read-only)</label><input className="input bg-gray-50 cursor-not-allowed" value={user?.phone||''} disabled/></div>
              <div><label className="label flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/>Email (optional)</label><input type="email" className="input" value={profile.email} onChange={e=>setProfile({...profile,email:e.target.value})}/></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5"/>County</label><select className="input" value={profile.county} onChange={e=>setProfile({...profile,county:e.target.value})}><option value="">Select county</option>{COUNTIES.map(c=><option key={c}>{c}</option>)}</select></div>
                <div><label className="label">Town</label><input className="input" placeholder="e.g. Naivasha" value={profile.town} onChange={e=>setProfile({...profile,town:e.target.value})}/></div>
              </div>
              <button type="submit" disabled={savingP} className="btn-primary flex items-center gap-2">{savingP?<Spinner size="sm" className="inline"/>:<><Save className="w-4 h-4"/>Save Changes</>}</button>
            </form>
          </div>
        )}

        {tab==='password' && (
          <div className="card p-6">
            <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-5 flex items-center gap-2"><Lock className="w-5 h-5 text-forest-600"/>Change Password</h2>
            <form onSubmit={changePassword} className="space-y-4">
              {[{k:'current',l:'Current Password',sk:'current'},{k:'newPass',l:'New Password',sk:'new'},{k:'confirm',l:'Confirm New Password',sk:'new'}].map(({k,l,sk})=>(
                <div key={k}><label className="label">{l}</label>
                  <div className="relative">
                    <input type={showPw[sk]?'text':'password'} className="input pr-10" placeholder={k==='current'?'Current password':'Min 6 characters'} value={passwords[k]} onChange={e=>setPasswords({...passwords,[k]:e.target.value})} required minLength={k!=='current'?6:undefined}/>
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={()=>setShowPw(p=>({...p,[sk]:!p[sk]}))}>
                      {showPw[sk]?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                    </button>
                  </div>
                </div>
              ))}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-300">⚠️ You'll need to log in again on other devices after changing your password.</div>
              <button type="submit" disabled={savingPw} className="btn-primary flex items-center gap-2">{savingPw?<Spinner size="sm" className="inline"/>:<><Lock className="w-4 h-4"/>Update Password</>}</button>
            </form>
          </div>
        )}

        {tab==='picture' && (
          <div className="card p-6">
            <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-5 flex items-center gap-2"><Camera className="w-5 h-5 text-forest-600"/>Profile Picture</h2>
            <div className="flex flex-col items-center gap-5">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-forest-100 flex items-center justify-center border-4 border-forest-200 shadow">
                {previewImg ? <img src={previewImg} alt="Preview" className="w-full h-full object-cover"/> : <span className="text-forest-700 font-bold text-5xl">{user?.name?.[0]?.toUpperCase()}</span>}
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">JPG or PNG, max 2MB</p>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageChange}/>
                <button onClick={()=>fileRef.current?.click()} disabled={uploadingImg} className="btn-primary flex items-center gap-2">
                  {uploadingImg?<Spinner size="sm" className="inline"/>:<><Camera className="w-4 h-4"/>Choose Photo</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
