import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  X, 
  Printer, 
  Download,
  Filter,
  ArrowRight,
  FileText,
  Hash
} from 'lucide-react';
import useApi from '../../api/useApi';
import Swal from 'sweetalert2';

// Sample Data based on your structure
const INITIAL_VOUCHERS = [
  {
    id: "-OjBXP6f0GZJmW557nms",
    voucher_type: 'purchase',
    voucher_mode: 'credit',
    date: "2026-01-17",
    total_amount: 3500,
    particular: "Purchase 897865435",
    cr: [{ amt: 3500, ledger: "A6", particular: "Purchase 897865435" }],
    dr: [
      { amt: 3416.67, ledger: "A3", particular: "Purchase 897865435" },
      { amt: 41.67, ledger: "A12", particular: "Purchase 897865435" },
      { amt: 41.67, ledger: "A13", particular: "Purchase 897865435" }
    ]
  },
  {
    id: "-VCH123456789",
    voucher_type: 'receipt',
    voucher_mode: 'cash',
    date: "2026-01-18",
    total_amount: 1200,
    particular: "Cash Sales - Shop A",
    cr: [{ amt: 1200, ledger: "Sales A/c", particular: "Cash Sales" }],
    dr: [{ amt: 1200, ledger: "Cash In Hand", particular: "Cash Received" }]
  }
];

const VoucherModal = ({ voucher, onClose,Ledgers }) => {
  if (!voucher) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 text-sm">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                voucher.voucher_type === 'purchase' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
              }`}>
                {voucher.voucher_type}
              </span>
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-tight">
                Mode: {voucher.voucher_mode}
              </span>
            </div>
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              Voucher ID: <span className="text-gray-500 font-mono">{voucher.id}</span>
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Date</p>
              <p className="font-medium text-gray-800">{new Date(voucher.date).toLocaleDateString('en-GB')}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 col-span-2">
              <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Narration</p>
              <p className="font-medium text-gray-800 truncate">{voucher.narration}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Debit (DR)
              </h3>
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 py-2">Ledger</th>
                      <th className="px-4 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {voucher.dr.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-gray-700 font-medium">{Ledgers[item.ledger]}</td>
                        <td className="px-4 py-2 text-right font-mono text-gray-900">{item.amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Credit (CR)
              </h3>
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 py-2">Ledger</th>
                      <th className="px-4 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {voucher.cr.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-gray-700 font-medium">{Ledgers[item.ledger]}</td>
                        <td className="px-4 py-2 text-right font-mono text-gray-900">{item.amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
          <div className="font-bold text-gray-900">
            Total: ₹ {voucher.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
              <Printer size={14} /> Print
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors">
              <Download size={14} /> Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Vouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [ledgers, setledgers] = useState({});
  const [loading, setLoading] = useState(false);
  const {getData} = useApi();

  // Current Filter values (applied)
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    fromDate: "",
    toDate: "",
    type: "all",
    mode: "all"
  });

  // Local state for inputs (pending apply)
  const [inputs, setInputs] = useState({
    fromDate: "",
    toDate: "",
    type: "all",
    mode: "all"
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

const fetchFilteredData = async () => {
  try {
    setLoading(true);
    const res = await getData('/vouchers', {
      params: {
        fromdate: inputs.fromDate || undefined,
        todate: inputs.toDate || undefined,
        voucher_type: inputs.type === 'all' ? undefined : inputs.type,
        voucher_mode: inputs.mode === 'all' ? undefined : inputs.mode,
      },
    });

    setVouchers(res?.data || []);
    setledgers(res?.ledger_map || {});
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

//   const fetchFilteredData = useCallback(async (currentFilters) => {
//     setLoading(true);
//     // Simulated API delay
//     setTimeout(() => {
//       const filtered = INITIAL_VOUCHERS.filter(v => {
//         const matchesSearch = v.particular.toLowerCase().includes(currentFilters.search.toLowerCase()) || 
//                              v.id.toLowerCase().includes(currentFilters.search.toLowerCase());
//         const matchesType = currentFilters.type === "all" || v.voucher_type === currentFilters.type;
//         const matchesMode = currentFilters.mode === "all" || v.voucher_mode === currentFilters.mode;
        
//         let matchesDate = true;
//         if (currentFilters.fromDate) matchesDate = matchesDate && v.date >= currentFilters.fromDate;
//         if (currentFilters.toDate) matchesDate = matchesDate && v.date <= currentFilters.toDate;

//         return matchesSearch && matchesType && matchesMode && matchesDate;
//       });
//       setVouchers(filtered);
//       setLoading(false);
//     }, 400);
//   }, []);

  const handleSearchClick = () => {
    if(!inputs.fromDate||!inputs.toDate){
        Swal.fire({
            icon: 'warning',
            title: 'Date Range Required',
            text: 'Please select both From Date and To Date to filter vouchers.',
            confirmButtonText: 'OK'
        });
        return
    }
    setAppliedFilters(inputs);
    fetchFilteredData(inputs);
  };



  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 p-4 md:p-6 font-sans text-sm">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Dynamic Filter Bar */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            
            {/* Date Range */}
            <div className="md:col-span-4 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Date Range</label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 gap-2 focus-within:ring-2 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition-all">
                <input 
                  name="fromDate"
                  type="date" 
                  className="bg-transparent text-xs w-full outline-none p-1 cursor-pointer"
                  value={inputs.fromDate}
                  onChange={handleInputChange}
                />
                <ArrowRight size={12} className="text-slate-300 shrink-0" />
                <input 
                  name="toDate"
                  type="date" 
                  className="bg-transparent text-xs w-full outline-none p-1 cursor-pointer"
                  value={inputs.toDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Voucher Type */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Type</label>
              <select 
                name="type"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                value={inputs.type}
                onChange={handleInputChange}
              >
                <option value="all">All Types</option>
                <option value="purchase">Purchase</option>
                <option value="receipt">Receipt</option>
                <option value="payment">Payment</option>
                <option value="journal">Journal</option>
              </select>
            </div>

            {/* Voucher Mode */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Mode</label>
              <select 
                name="mode"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                value={inputs.mode}
                onChange={handleInputChange}
              >
                <option value="all">All Modes</option>
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
                <option value="credit">Credit</option>
              </select>
            </div>

            {/* Manual Search Button */}
            <div className="md:col-span-2">
              <button 
                onClick={handleSearchClick}
                disabled={loading}
                className="w-full py-2.5 flex items-center justify-center bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-all disabled:opacity-50 active:scale-95 shadow-sm shadow-slate-200 group"
                title="Apply Filters"
              >
                {loading ? (
                   <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Search size={16} />
                    <span className="text-xs font-bold uppercase">Search</span>
                  </div>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Data Content */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[400px] space-y-3">
              <div className="w-8 h-8 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Filtering Records...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Details</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Reference</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vouchers.map((voucher) => (
                    <tr 
                      key={voucher.id} 
                      className="hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                      onClick={() => setSelectedVoucher(voucher)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={13} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                          <span className="font-medium text-slate-600 whitespace-nowrap">{new Date(voucher.date).toLocaleDateString('en-GB')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                        </div>
                          <p className="text-sm text-slate-700 font-semibold leading-tight group-hover:text-indigo-700 transition-colors">{voucher.narration}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex gap-1">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                voucher.voucher_type === 'purchase' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {voucher.voucher_type}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-slate-900 font-mono">
                          ₹{voucher.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {vouchers.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                  <Hash size={32} className="mb-2 opacity-20" />
                  <p className="text-sm font-medium">No results found for selected criteria.</p>
                  <button 
                    onClick={() => { setInputs({ fromDate: "", toDate: "", type: "all", mode: "all" }); handleSearchClick(); }}
                    className="mt-4 text-[10px] font-bold text-indigo-600 uppercase hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase px-1">
          <div className="flex gap-4">
            <span>Result Count: {vouchers.length}</span>
            <span>Mode: {appliedFilters.mode}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : 'bg-green-500'}`}></div>
            {loading ? 'Fetching...' : 'System Ready'}
          </div>
        </div>
      </div>

      {selectedVoucher && (
        <VoucherModal 
          voucher={selectedVoucher} 
          onClose={() => setSelectedVoucher(null)} 
          Ledgers={ledgers}
        />
      )}
    </div>
  );
}