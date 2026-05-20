import { useState } from 'react';
import { X, Download, CheckCircle, User, Package } from 'lucide-react';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';
import Spinner from './Spinner.jsx';

export default function ReceiptModal({ order, onClose }) {
  const [downloading, setDownloading] = useState(false);
  if (!order) return null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await api.get(`/payments/receipt/${order._id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url; a.download = `AGC-Receipt-${order._id.slice(-8).toUpperCase()}.pdf`; a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Receipt downloaded!');
    } catch { toast.error('Download failed'); }
    finally { setDownloading(false); }
  };

  const items = order.isCartOrder && order.cartItems?.length > 0
    ? order.cartItems
    : [{ name: order.product?.name, quantity: order.quantity, unitPrice: order.unitPrice, subtotal: order.totalPrice }];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-forest-700 text-white px-6 py-4 flex items-center justify-between">
          <div><h2 className="font-display font-bold text-lg">Payment Receipt</h2><p className="text-forest-200 text-xs">Agro-Connect Kenya</p></div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-forest-600 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        {/* Confirmed */}
        <div className="bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-700 px-6 py-4 flex items-center gap-3">
          <CheckCircle className="w-10 h-10 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-bold text-green-800 dark:text-green-300">Payment Confirmed!</p>
            {order.mpesaReceipt && <p className="text-green-600 dark:text-green-400 text-sm font-mono font-bold">{order.mpesaReceipt}</p>}
          </div>
        </div>
        <div className="p-6 space-y-4">
          {/* Meta */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Order ID</span><span className="font-mono font-bold dark:text-white">#{order._id?.slice(-8).toUpperCase()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Paid</span><span className="dark:text-white">{order.paidAt ? new Date(order.paidAt).toLocaleString('en-KE') : '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="badge bg-green-100 text-green-700 text-xs">Paid ✓</span></div>
          </div>
          {/* Items */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1"><Package className="w-3.5 h-3.5" />Items</p>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">{item.name} × {item.quantity}</span>
                  <span className="font-medium dark:text-white">KSh {(item.subtotal || (item.unitPrice * item.quantity) || 0).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2 flex justify-between font-bold">
                <span className="dark:text-white">Total Paid</span>
                <span className="text-forest-600 text-lg">KSh {order.totalPrice?.toLocaleString()}</span>
              </div>
            </div>
          </div>
          {/* Parties */}
          <div className="grid grid-cols-2 gap-3">
            {[{ label: 'Buyer', p: order.buyer }, { label: 'Farmer', p: order.farmer }].map(({ label, p }) => (
              <div key={label} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1"><User className="w-3 h-3" />{label}</p>
                <p className="text-sm font-medium dark:text-white">{p?.name || '—'}</p>
                <p className="text-xs text-gray-500">{p?.phone}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 pb-6">
          <button onClick={handleDownload} disabled={downloading}
            className="w-full flex items-center justify-center gap-2 bg-forest-600 hover:bg-forest-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50">
            {downloading ? <Spinner size="sm" className="inline" /> : <><Download className="w-4 h-4" /> Download PDF Receipt</>}
          </button>
        </div>
      </div>
    </div>
  );
}
