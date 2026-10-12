

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  User, 
  ChevronRight, 
  ShoppingCart, 
  ClipboardList 
} from 'lucide-react';
import { useNavigate,useParams } from 'react-router-dom';
import useApi from '../../api/useApi';

/**
 * MOCK API HOOK (Replace with your actual import)
 * import useApi from '../../api/useApi';
 */


const Dashboard = () => {
  const navigate = useNavigate(); // Removed as requested
  const { getData } = useApi();

  const { id } = useParams();

  // --- State ---
  const [filter, setFilter] = useState(id?id:'Customer'); // Customer (Sale) | Vendor (Purchase)
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load orders from sessionStorage
  const [orders] = useState(() => {
    const savedOrders = sessionStorage.getItem('pos_orders');
    return savedOrders ? JSON.parse(savedOrders) : {};
  });

  // --- Data Fetching ---
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const res = await getData('/admin/vendors');
        setCustomers(res || []);
      } catch (err) {
        console.error('Failed to fetch vendors', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  // --- Computed Data ---
  const filteorangeList = useMemo(() => {
    return customers.filter(item => {
      const matchesType = item.v_type === filter;
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.business_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [customers, filter, searchQuery]);
return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 text-sm">
      
      {/* --- Navbar (Compact) --- */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 px-3 py-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 ">
          <button 
            onClick={() => navigate('/')}
            className="p-1.5 hover:bg-slate-100 rounded-md transition-colors t"
          >
            <ArrowLeft className="w-5 h-5 text-orange-600" />
          </button>
          <span 
            className="text-lg font-bold bg-linear-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent cursor-pointer"
          >
            NPH
          </span>
        </div>
        
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full p-3 space-y-4">
        
        {/* --- Header & Controls (Tight) --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-lg text-slate-800 leading-none">Dashboard</h1>
            <p className="text-slate-500 text-[11px] mt-1">Manage {filter === 'Customer' ? 'sales' : 'purchases'}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">

            {/* <div className="flex p-0.5 bg-slate-100 rounded-md">
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
            </div> */}

            {/* Search Bar (Smaller Height) */}
            <div className="relative group">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
              <input 
                type="text" 
                placeholder={`Search...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-48 pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* --- List Section --- */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              {filter === 'Customer' ? <ShoppingCart className="w-3.5 h-3.5" /> : <ClipboardList className="w-3.5 h-3.5" />}
              {filter}s
            </h2>
            <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">
              {filteorangeList.length} Total
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 text-xs animate-pulse">Loading...</p>
            </div>
          ) : filteorangeList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {filteorangeList.map((item) => {
                const order = orders[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/order/${item.id}`)}
                    className="group bg-white p-2.5 rounded-lg border border-slate-200 hover:border-orange-200 hover:bg-orange-50/10 transition-all cursor-pointer flex items-center justify-between shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                        {item.name.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="font-bold text-slate-800 leading-tight truncate text-sm">{item.name}</h3>
                        <p className="text-[10px] text-slate-400 uppercase truncate font-medium">{item.business_name}</p>
                        {order && (
                          <p className="text-green-600 font-bold text-[11px] mt-0.5">₹{order.total.toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-orange-400 transition-colors" />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-dashed border-slate-200 p-8 text-center">
              <User className="w-6 h-6 text-slate-300 mx-auto mb-2" />
              <h3 className="text-slate-800 font-bold text-sm">No results</h3>
              <p className="text-slate-500 text-[11px]">Adjust your search or filter</p>
            </div>
          )}
        </div>
      </main>

      {/* --- Mobile FAB (Smaller) --- */}
      <button 
        className="fixed bottom-4 right-4 w-12 h-12 bg-orange-500 text-white rounded-full shadow-lg flex items-center justify-center sm:hidden active:scale-90 transition-all z-40"
        onClick={() => navigate('/add_user')}
      >
        <Plus className="w-6 h-6" />
      </button>

    </div>
  );
};

const App = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      <Dashboard />
    </div>
  );
};

export default App;

