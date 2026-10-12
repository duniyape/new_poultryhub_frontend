import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileText, 
  MapPin, 
  Phone, 
  Calendar, 
  Package, 
  ChevronRight,
  TrendingUp,
  Wallet,
  ArrowLeft,
  Search,
  Filter,
  Download,
  ReceiptText,
  Printer
} from 'lucide-react';
import useApi from '../api/useApi';
import { pdf } from '@react-pdf/renderer';
import Invoice from '../components/Invoice/Invoice';
import { useLoader } from '../context/LoaderContext';
import { useNavigate } from 'react-router-dom';

const App = () => {
  const [view, setView] = useState('list');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
 
  const handleSelectInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setView('detail');
    window.scrollTo(0, 0);
  };

  const calculateTotal = (bill) => {
    return bill.grandTotal;
  };

  // --- LIST VIEW COMPONENT ---
  const ListView = () =>{
    const [searchQuery, setSearchQuery] = useState('');
    const {getData,postData}=useApi();
    const navigate=useNavigate();


  // Mock data for the list of bills
  const [bills,setbills] = useState([]);
  const [filter, setFilter] = useState("sell"); // Customer (Sale) | Vendor (Purchase)
  

const Fetchdata = async (e) => {
    const res2= await getData(`/get_bills`)
    setbills(Object.values(res2))
    console.log(res2)
};
    useEffect(() => {
     Fetchdata()
    }, []);
    
  // const filteredBills = useMemo(() => {
  //   return bills.filter(bill => 
  //     bill.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     bill.invoiceid.toLowerCase().includes(searchQuery.toLowerCase())
  //   );
  // }, [bills, searchQuery,filter]);
  const filteredBills = useMemo(() => {
  const search = searchQuery.toLowerCase();

  return bills.filter(bill => {
    const matchesSearch =
      bill.customer?.name?.toLowerCase().includes(search) ||
      bill.invoiceid?.toLowerCase().includes(search);

    const matchesType = bill.type === filter;

    return matchesSearch && matchesType;
  });
}, [bills, searchQuery, filter]);


    return (
    <div className="mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div  className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h1 onClick={()=>navigate('/')} className="text-2xl font-bold text-slate-900"><i style={{marginRight:10}} class="fa-solid fa-arrow-left"></i>Billing Dashboard</h1>
          <p className="text-sm text-slate-500">Track and manage your business invoices</p>
        </div>
        <div className="flex p-0.5 bg-slate-100 rounded-md">
              <button
                onClick={() => setFilter("sell")}
                className={`px-3 py-1 rounded-sm text-xs font-medium transition-all ${
                  filter === "sell" 
                    ? "bg-white text-orange-600 shadow-xs" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Sale
              </button>
              <button
                onClick={() => setFilter("purchase")}
                className={`px-3 py-1 rounded-sm text-xs font-medium transition-all ${
                  filter === "purchase" 
                    ? "bg-white text-orange-600 shadow-xs" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Purchase
              </button>
            </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID or Name..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <button className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors hidden sm:block">
            <Filter className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Total Payable</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredBills.map((bill) => (
              <tr key={bill.invoiceid} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {bill.invoiceid}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-slate-800">{bill.customer.name}</div>
                  <div className="text-xs text-slate-400">{bill.customer.mobile}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{bill.date}</td>
                <td className="px-6 py-4 text-right">
                  <div className="text-sm font-bold text-slate-900">₹{calculateTotal(bill).toLocaleString()}</div>
                  {/* <div className="text-[10px] text-slate-400 uppercase font-medium">Incl. Prev. Balance</div> */}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleSelectInvoice(bill)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    View Details <ChevronRight className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
            {
              filteredBills.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-slate-400">
                    No invoices found.
                  </td>
                </tr>
              )
            }
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredBills.map((bill) => (
          <div 
            key={bill.invoiceid} 
            onClick={() => handleSelectInvoice(bill)}
            className="bg-white p-4 rounded-xl border border-slate-200 active:scale-[0.98] transition-all"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">#{bill.invoiceid}</span>
              <span className="text-xs text-slate-400">{bill.date}</span>
            </div>
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-900">{bill.customer.name}</h3>
              <p className="text-xs text-slate-500">{bill.customer.mobile}</p>
            </div>
            <div className="flex justify-between items-end pt-3 border-t border-slate-50">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Total Outstanding</p>
                <p className="text-sm font-black text-slate-900">₹{calculateTotal(bill).toLocaleString()}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )};

  // --- DETAIL VIEW COMPONENT ---
  const DetailView = () => {
    const totalOutstanding = (parseFloat(selectedInvoice.grandTotal) + Math.abs(parseFloat(selectedInvoice.previousBalance)));
    const { showLoader, hideLoader } = useLoader();
     
     const handleDownload = async (res) => {
        showLoader()
        try {
          const blob = await pdf(<Invoice data={res} type="sale" />).toBlob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `bill-${res.invoiceid}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Failed to download PDF:', error);
        } finally {
          hideLoader()
        }
      };

    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setView('list')}
              className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-white-600" />
            </button>   
            <div>
              <h2 className="text-lg font-bold text-slate-900">Invoice Details</h2>
              <p className="text-xs text-slate-500">#{selectedInvoice.invoiceid} • {selectedInvoice.date}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {selectedInvoice.type==="sell"&&<button onClick={()=>handleDownload(selectedInvoice)} className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all">
              <Printer className="w-4 h-4" /> Print
            </button>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-slate-400">
                <ReceiptText className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-widest">Billed To</h3>
              </div>
              <div className="flex flex-col md:flex-row md:justify-between gap-4">
                <div>
                  <h4 className="text-xl font-black text-slate-900">{selectedInvoice.customer.name}</h4>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-slate-400" /> 
                      {selectedInvoice.customer.address}, {selectedInvoice.customer.state}
                    </p>
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                      <Phone className="w-3 h-3 text-slate-400" /> 
                      {selectedInvoice.customer.mobile}
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 self-start">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Vendor Reference</p>
                  <p className="text-sm font-mono font-bold text-slate-700">{selectedInvoice.vendor_id.toUpperCase()}</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                <Package className="w-4 h-4 text-slate-400" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-600">Itemized List</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white border-b border-slate-50">
                      <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Description</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Qty</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Rate</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {selectedInvoice.items.map((item, idx) => (
                      <tr key={idx} className="text-sm">
                        <td className="px-5 py-2">
                          <p className="font-bold text-slate-800">{item.description}</p>
                        </td>
                        <td className="px-5 py-2 text-slate-600">{item.qty} {item.unit}</td>
                        <td className="px-5 py-2 text-slate-600">₹{item.price}</td>
                        <td className="px-5 py-2 text-right font-black text-slate-900">₹{item.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Payment Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-900 text-white rounded-xl p-6 shadow-lg">
              <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Financial Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400 font-medium">Current Subtotal</span>
                  <span className="text-sm font-bold">₹{selectedInvoice.grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400 font-medium">Previous Balance</span>
                  <span className="text-sm font-bold text-orange-400">₹{parseFloat(selectedInvoice.previousBalance).toFixed(2)}</span>
                </div>
                
                <div className="pt-4 mt-2 border-t border-slate-800">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-tight">Net Payable</span>
                      <p className="text-xs text-slate-600 leading-none mt-1">(Current + Previous)</p>
                    </div>
                    <span className="text-2xl font-black text-emerald-400 tracking-tighter">
                      ₹{totalOutstanding.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-2">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-blue-400" />
                    <span className="text-xs font-bold text-slate-300">Total Qty</span>
                  </div>
                  <span className="text-sm font-black text-white">{selectedInvoice.totalQty} Units</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
              <div className="p-2 bg-blue-100 rounded-lg h-fit">
                <Wallet className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-blue-900">Payment Notice</h5>
                <p className="text-[11px] text-blue-700 mt-1 leading-relaxed">
                  Please ensure all outstanding balances are cleared within the current billing cycle to avoid service interruptions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8 font-sans antialiased">
      {view === 'list' ? <ListView /> : <DetailView />}
    </div>
  );
};

export default App;