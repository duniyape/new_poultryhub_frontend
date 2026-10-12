import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Filter,
  Phone,
  Hash,
  DollarSign,
  Check,
  X,
  Eye,
  Image as ImageIcon
} from 'lucide-react';
import { db } from '../../firebase/Database';
import { ref, push, set, onValue } from "firebase/database";
import axios from 'axios';

const INITIAL_DATA = [
  { id: 'PR-9042', client: 'Acme Corp', phone: '+1 (555) 123-4567', amount: 2450.00, date: '2023-10-24', status: 'Pending', category: 'Design Services' },
  { id: 'PR-9041', client: 'Sarah Johnson', phone: '+1 (555) 987-6543', amount: 1200.00, date: '2023-10-23', status: 'Paid', category: 'Consulting' },
  { id: 'PR-9040', client: 'Global Tech', phone: '+1 (555) 456-7890', amount: 8900.50, date: '2023-10-22', status: 'Overdue', category: 'Software Dev' },
  { id: 'PR-9039', client: 'Design Studio', phone: '+1 (555) 234-5678', amount: 450.00, date: '2023-10-20', status: 'Paid', category: 'Illustration' },
  { id: 'PR-9038', client: 'Mark Wilson', phone: '+1 (555) 876-5432', amount: 3100.00, date: '2023-10-18', status: 'Pending', category: 'Branding' },
  { id: 'PR-9037', client: 'Vertex Inc', phone: '+1 (555) 345-6789', amount: 15000.00, date: '2023-10-15', status: 'Paid', category: 'Enterprise' },
  { id: 'PR-9036', client: 'Emily Chen', phone: '+1 (555) 765-4321', amount: 850.00, date: '2023-10-12', status: 'Cancelled', category: 'Copywriting' },
];

const StatusBadge = ({ status }) => {
  const styles = {
    Paid: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    Pending: 'bg-amber-50 text-amber-700 border-amber-100',
    Overdue: 'bg-rose-50 text-rose-700 border-rose-100',
    Cancelled: 'bg-slate-50 text-slate-600 border-slate-100',
  };

  const icons = {
    Paid: <CheckCircle className="w-3.5 h-3.5 mr-1" />,
    Pending: <Clock className="w-3.5 h-3.5 mr-1" />,
    Overdue: <AlertCircle className="w-3.5 h-3.5 mr-1" />,
    Cancelled: <X className="w-3.5 h-3.5 mr-1" />,
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      {icons[status]}
      {status}
    </span>
  );
};

export default function ScreenShot() {
  const [data, setData] = useState(INITIAL_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [viewingScreenshot, setViewingScreenshot] = useState(null);
  
  const tabs = ['All', 'Pending', 'Paid', 'Overdue'];

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = 
        item.client.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.phone.includes(searchTerm);
      const matchesTab = activeTab === 'All' || item.status === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [searchTerm, activeTab, data]);

  const handleApprove = (id) => {
    setData(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'Paid' } : item
    ));
  };

  const handleReject = (id) => {
    setData(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'Cancelled' } : item
    ));
  };


    useEffect(() => {
  const imagesRef = ref(db, "whatsapp/images");

  const unsubscribe = onValue(imagesRef, (snapshot) => {
    const val = snapshot.val();

    if (!val) {
      setData([]);
      return;
    }

    const list = Object.entries(val).map(([key, item]) => ({
      id: key,
      client: item.name || "Unknown",
      phone: item.mobile || "-",
      amount: Number(item.amount || 0),
      date: item.date || new Date().toISOString(),
      status: item.status || "Pending",
      category: "WhatsApp Payment",
      screenshotUrl: item.media_id || null
    }));

    setData(list);
  });

  return () => unsubscribe();
}, []);


const geturl = async (p) => {
  try {
    
    const res = await axios.get(`https://graph.facebook.com/v22.0/${p}`, {
      headers: {
        Authorization: "Bearer EACH6PXeLx50BO39th5RhjYBaIEm9WN1DeqyKTanvAM50PQ2cK10GrtVZBZCJiEH5ke8481Dzit3lhhAFB8ZCqZCxhJOIRHTeORvGdiMYYeXWIQRBDjq874W0SvrYqaTP9zsgycuRZCbx4RZAA5SzS2CdEmULMjFsuJBZCboc8cIPPu4oqmzIr178N0fkrQftXQ4uQZDZD",
        "Content-Type": "application/json"
      }
    });
    return res.data.url;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const [image, setimage] = useState(null)

const getimage = async (p) => {
  try {
    const url = await geturl(p);
    console.log(url)
    const res = await axios.get(url, {
      headers: {
        Authorization: "Bearer EACH6PXeLx50BO39th5RhjYBaIEm9WN1DeqyKTanvAM50PQ2cK10GrtVZBZCJiEH5ke8481Dzit3lhhAFB8ZCqZCxhJOIRHTeORvGdiMYYeXWIQRBDjq874W0SvrYqaTP9zsgycuRZCbx4RZAA5SzS2CdEmULMjFsuJBZCboc8cIPPu4oqmzIr178N0fkrQftXQ4uQZDZD",
        "Content-Type": "application/json",
         responseType: "blob"
      }
    });

    const imgBlob = res.data
    const imgUrl = URL.createObjectURL(imgBlob);
setimage(imgUrl)
  } catch (err) {
    console.error(err);
    throw err;
  }
};



  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 overflow-x-auto no-scrollbar shadow-sm">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-all flex-shrink-0 ${
                    activeTab === tab 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 lg:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search..."
                  className="w-full lg:w-[300px] pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="p-2.5 bg-white text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-sm">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* List Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Request</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-900 block">#{request.id}</span>
                      <span className="text-xs text-slate-400">{request.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-700">{request.client}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{request.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-900">
                        ${request.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="whitespace-nowrap">
                          {new Date(request.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {request.status !== 'Paid' && request.status !== 'Cancelled' && (
                          <>
                            <button 
                              onClick={() => handleApprove(request.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                              title="Approve"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span className="hidden lg:inline">Approve</span>
                            </button>
                            <button 
                              onClick={() => handleReject(request.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 transition-colors shadow-sm"
                              title="Reject"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span className="hidden lg:inline">Reject</span>
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => setViewingScreenshot(request)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" 
                          title="View Screenshot"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredData.length > 0 ? (
              filteredData.map((request) => (
                <div key={request.id} className="p-4 space-y-4 active:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{request.client}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Hash className="w-3 h-3" /> {request.id} • {request.category}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Amount</p>
                      <p className="text-sm font-bold text-slate-900 flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-emerald-500" />
                        {request.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Status</p>
                      <StatusBadge status={request.status} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Phone className="w-3 h-3" />
                      <span>{request.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(request.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 pt-2">
                    {request.status !== 'Paid' && request.status !== 'Cancelled' && (
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => handleApprove(request.id)}
                          className="py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 active:bg-emerald-700"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button 
                          onClick={() => handleReject(request.id)}
                          className="py-2.5 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 active:bg-rose-700"
                        >
                          <X className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    )}
                    <button 
                      onClick={async() =>{await getimage(request.screenshotUrl), setViewingScreenshot(request)}}
                      className="w-full py-2.5 bg-white text-slate-600 text-xs font-bold rounded-xl border border-slate-200 flex items-center justify-center gap-2 active:bg-slate-50 shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Screenshot
                    </button>
                  </div>
                </div>
              ))
            ) : null}
          </div>

          {/* Empty State */}
          {filteredData.length === 0 && (
            <div className="px-6 py-16 text-center">
              <div className="flex flex-col items-center opacity-50">
                <Search className="w-12 h-12 text-slate-300 mb-2" />
                <p className="text-slate-500 font-bold">No results found</p>
                <p className="text-slate-400 text-sm">Try a different search term or filter</p>
              </div>
            </div>
          )}
          
          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500 font-medium">
            <p className="text-xs sm:text-sm">Showing {filteredData.length} entries</p>
            <div className="flex gap-2 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 text-xs font-bold" disabled>
                Prev
              </button>
              <button className="flex-1 sm:flex-none px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-xs font-bold">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Screenshot Preview Modal */}
      {viewingScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white sticky top-0">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Payment Proof</h3>
                <p className="text-xs text-slate-500">Request #{viewingScreenshot.id} • {viewingScreenshot.client}</p>
              </div>
              <button 
                onClick={() => setViewingScreenshot(null)}
                className="p-2 bg-slate-100 text-slate-500 hover:text-slate-900 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="aspect-[4/3] rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-3">
                <div className="p-4 bg-white rounded-2xl shadow-sm">
                  <ImageIcon className="w-12 h-12 text-slate-300" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-500">Transaction Screenshot</p>
                  <p className="text-xs px-8">This is a placeholder for the payment receipt uploaded by the client.</p>
                </div>
              </div>
             {image&& <img src={image} className="w-full rounded-xl mt-4 border" alt="fb-image" />}
              
              <div className="mt-6">
                <button 
                  onClick={() => setViewingScreenshot(null)}
                  className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}