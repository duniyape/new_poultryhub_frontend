

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Receipt, 
  User, 
  MapPin, 
  Phone, 
  Calendar, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Package,
  AlertCircle,
  Loader2,
  FileText,
  Search,
  X
} from 'lucide-react';
import useApi from '../api/useApi';
import { useNavigate } from 'react-router-dom';
import BillingPopup from '../components/orders/Billing';

const App = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selected,setSelected]=useState({});
  const [filter, setFilter] = useState("Customer"); // Customer (Sale) | Vendor (Purchase)
  const [expandedVendor, setExpandedVendor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const {getData,postData}=useApi();
  const navigate = useNavigate();
const Fetchdata = async (e) => {
    const res2= await getData(`/orders/unbilled/summary`)
    setData(res2)
    console.log(res2)
};
    useEffect(() => {
     Fetchdata()
    }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Filter vendors based on search term
  const filteredVendors = data ? Object.entries(data.vendors).filter(([vId, vendorData]) => {
    const v = vendorData.vendor;
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      v.name.toLowerCase().includes(search) ||
      v.business_name.toLowerCase().includes(search) ||
      v.fromNumber.includes(search);

    const matchesType = v.v_type === filter;
    return matchesSearch && matchesType;
    }) : [];

  // if (!data) {
  //   return (
  //     <div className="min-h-screen bg-gray-100 flex items-center justify-center">
  //       <div className="text-center space-y-3">
  //         <Loader2 className="w-8 h-8 animate-spin text-[#249CA2] mx-auto" />
  //         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loading Unbilled Orders...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-sm pb-10">
      {/* Top Navbar */}
      <nav className="bg-[#249CA2] h-12 flex items-center px-4 sticky top-0 z-50">
        <button onClick={()=>navigate(-1)} className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity focus-visible:outline-none">
          <ArrowLeft size={18} />
          <span className="font-bold text-xs uppercase tracking-wider">Back</span>
        </button>
      </nav>
      {isOpen&&<BillingPopup data={selected} onClose={()=>{setIsOpen(false),Fetchdata()}}  />}
      
      <div className="max-w-4xl mx-auto p-2 md:p-4 space-y-3">
        {/* Page Header */}
        <div className="bg-white p-3 rounded-sm border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#249CA2] p-2 rounded-sm">
              <Receipt size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-black text-gray-800 uppercase tracking-tight">Unbilled Orders</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Pending Settlements: {data?.total_unbilled_orders||0}
              </p>
            </div>
          </div>
          <div className="flex p-0.5 bg-slate-100 rounded-md">
              <button
                onClick={() => setFilter("Customer")}
                className={`px-3 py-1 rounded-sm text-xs font-medium transition-all ${
                  filter === "Customer" 
                    ? "bg-white text-orange-600 shadow-xs" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Sale
              </button>
              <button
                onClick={() => setFilter("Vendor")}
                className={`px-3 py-1 rounded-sm text-xs font-medium transition-all ${
                  filter === "Vendor" 
                    ? "bg-white text-orange-600 shadow-xs" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Purchase
              </button>
            </div>
          
          {/* Search Bar Component */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text"
              placeholder="Search vendor or phone..."
              className="w-full bg-gray-50 border border-gray-200 rounded-sm pl-9 pr-8 py-1.5 text-xs focus:ring-1 focus:ring-[#249CA2] outline-none transition-all placeholder:text-gray-400 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Vendor List */}
        <div className="space-y-3">
          {filteredVendors.length > 0 ? (
            filteredVendors.map(([vId, vendorData]) => (
              <div key={vId} className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
                {/* Vendor Header Card */}
                <div 
                  className="p-3 flex flex-wrap md:flex-nowrap items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
                  onClick={() => setExpandedVendor(expandedVendor === vId ? null : vId)}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="bg-gray-100 p-2 rounded-sm text-gray-500">
                      <User size={20} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-black text-gray-800 uppercase truncate leading-tight">
                        {vendorData.vendor.name}
                      </h2>
                      <p className="text-[11px] text-[#249CA2] font-bold uppercase truncate">
                        {vendorData.vendor.business_name}
                      </p>
                    </div>
                     <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-sm text-[10px] font-bold uppercase">
                            {vendorData.vendor.v_type}
                      </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 ml-auto md:ml-0">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Phone size={12} />
                      <span className="text-[11px] font-mono text-gray-600">{vendorData.vendor.fromNumber}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <MapPin size={12} />
                      <span className="text-[11px] font-medium text-gray-600">
                        {vendorData.vendor.city}, {vendorData.vendor.state}
                      </span>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Current Balance</p>
                      <p className="text-sm font-black text-red-600 leading-none">
                        {formatCurrency(vendorData.vendor.balance)}
                      </p>
                    </div>
                    <div className="text-gray-300 ml-2">
                      {expandedVendor === vId ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                {/* Orders Subsection (Collapsible) */}
                {expandedVendor === vId && (
                  <div className="bg-gray-50/50 p-3">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <FileText size={12} /> Pending Orders ({vendorData.count})
                      </h3>
                      <button onClick={()=>{setSelected(vendorData),setIsOpen(true)}} className="text-[10px] font-black text-white bg-[#249CA2] p-2 rounded-sm hover:bg-[#036f76] uppercase tracking-widest flex items-center gap-2">
                        <FileText size={12} /> Generate Bill
                      </button>
                    </div>

                    <div className="space-y-3">
                      {vendorData.orders.map((order) => (
                        <div key={order.id} className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm">
                          {/* Order Sub-header */}
                          <div className="bg-gray-100/50 p-2 px-3 flex justify-between items-center border-b border-gray-200">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5">
                                <Calendar size={12} className="text-[#249CA2]" />
                                <span className="text-[11px] font-bold text-gray-700">{formatDate(order.created_at)}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock size={12} className="text-gray-400" />
                                <span className="text-[11px] text-gray-500">{formatTime(order.created_at)}</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-gray-400">#{order.id.slice(-6).toUpperCase()}</span>
                          </div>

                          {/* Order Items Table */}
                          <table className="w-full text-left text-[11px]">
                            <thead className="text-[10px] text-gray-400 font-bold uppercase bg-white border-b border-gray-100">
                              <tr>
                                <th className="px-3 py-1.5">Product Item</th>
                                <th className="px-3 py-1.5">Category</th>
                                {/* <th className="px-3 py-1.5 text-center">Pkg</th> */}
                                <th className="px-3 py-1.5 text-right">Quantity</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {order.items.map((item, i) => (
                                <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                                  <td className="px-3 py-2">
                                    <div className="font-bold text-gray-800 uppercase">{item.name}</div>
                                    <div className="text-[9px] text-gray-400 uppercase tracking-tight">{item.sub_category_name}</div>
                                  </td>
                                  <td className="px-3 py-2">
                                    <span className="px-1.5 py-0.5 bg-gray-100 rounded-sm font-bold text-gray-500 uppercase text-[9px]">
                                      {item.category_name}
                                    </span>
                                  </td>
                                  {/* <td className="px-3 py-2 text-center font-medium text-gray-500">
                                    {item.pkg} {item.unit}
                                  </td> */}
                                  <td className="px-3 py-2 text-right">
                                    <span className="text-sm font-black text-[#249CA2]">{item.quantity}</span>
                                    <span className="ml-1 text-[9px] font-bold text-gray-400 uppercase">{item.unit}</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {/* Order Action Footer */}
                          <div className="p-2 bg-gray-50 flex justify-end gap-2 border-t border-gray-100">
                            {/* <button className="px-3 py-1 text-[10px] font-bold text-gray-500 border border-gray-200 rounded-sm hover:bg-white transition-colors uppercase">
                              View Details
                            </button>
                            <button className="px-3 py-1 text-[10px] font-bold text-white bg-[#249CA2] rounded-sm hover:bg-[#1e8388] transition-colors uppercase shadow-sm">
                              Generate Bill
                            </button> */}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white border border-gray-200 rounded-sm p-10 text-center">
              <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="text-gray-300" size={24} />
              </div>
              <h3 className="text-sm font-bold text-gray-800 uppercase">No Orders Found</h3>
              <p className="text-[11px] text-gray-400 mt-1">Try adjusting your search terms</p>
            </div>
          )}
        </div>

        {/* Empty State / Bottom Info */}
        <div className="bg-blue-50 border border-blue-100 p-3 rounded-sm flex items-start gap-3">
          <AlertCircle size={16} className="text-blue-500 mt-0.5" />
          <div className="text-[11px] text-blue-700 leading-relaxed">
            <strong>Note:</strong> Unbilled orders represent inventory delivered or services rendered that have not yet been formalized into a transaction invoice. Please reconcile these with vendor balances to maintain accurate account statements.
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;