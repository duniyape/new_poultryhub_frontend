import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import useApi from '../../api/useApi'
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Package, 
  TrendingUp, 
  ShoppingCart, 
  Calendar,
  Filter,
  Layers
} from 'lucide-react';


const Stock_Movement = () => {
    const {id}=useParams()
    const {getData}=useApi()
    const [data, setTransactions] = useState({})
    // Initialize with null or empty to simulate pending API state
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState({ from: '', to: '' });

   const fetchdata = async () => {
    try {
        const { from, to } = filterDate || {}
        const fromDate = from
        ? new Date(from)
        : new Date(new Date().setDate(new Date().getDate() - 7))
        const toDate = to ? new Date(to) : new Date()
        const res = await getData(
        `/stock-summary/${id}?from_date=${fromDate.toISOString()}&to_date=${toDate.toISOString()}`
        )
        console.log(res)
        setTransactions(res)
    } catch (error) {
        console.error("Stock summary fetch error:", error)
    }
    }

    
    useEffect(() => {
        fetchdata()
    }, [id])
    useEffect(() => {
        if(!filterDate.from || !filterDate.to) return;
        fetchdata()
    }, [filterDate])


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  return (<>
  <Link to={-1}><div style={{
            background:'#249CA2',
            height:50,
            width:'100vw',
            display:'flex',
            alignItems:'center',
            color:'white',
            gap:10,
            }}> <i style={{paddingLeft:20}} class="fa-solid fa-arrow-left"></i>
            <label style={{fontWeight:700,fontSize:12,color:'white'}}>Back</label>
        </div>
        </Link>
    <div className="min-h-screen bg-gray-100 p-2 md:p-4 font-sans text-sm">
        

      <div className="max-w-7xl mx-auto space-y-3">
        {/* Compact Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-sm border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-sm">
              <Layers size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-800 leading-none">Stock Logs</h1>
              <p className="text-gray-500 text-[11px] mt-1 uppercase tracking-tighter font-mono">ID: {data?.product_id || 'N/A'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <input 
              type="date"
              className="border border-gray-300 rounded-sm px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
              value={filterDate.from}
              onChange={(e) => setFilterDate(prev => ({...prev, from: e.target.value}))}
            />
            <span className="text-gray-400 text-xs">to</span>
            <input 
              type="date"
              className="border border-gray-300 rounded-sm px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
              value={filterDate.to}
              onChange={(e) => setFilterDate(prev => ({...prev, to: e.target.value}))}
            />
            <button className="bg-gray-800 text-white px-3 py-1 rounded-sm text-xs font-medium hover:bg-black transition-colors flex items-center gap-1">
              <Filter size={12} />
            </button>
          </div>
        </div>

        {/* Small Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <CompactStatCard 
            label="Opening" 
            val={data?.opening?.stock ?? 0} 
            sub={formatCurrency(data?.opening?.inventory_value)}
            icon={<Package size={14}/>}
          />
          <CompactStatCard 
            label="Purchased" 
            val={data?.period?.purchased_qty ?? 0} 
            sub={formatCurrency(data?.period?.purchase_amount)}
            icon={<ShoppingCart size={14}/>}
          />
          <CompactStatCard 
            label="Sold" 
            val={data?.period?.sold_qty ?? 0} 
            sub={formatCurrency(data?.period?.sales_amount)}
            icon={<TrendingUp size={14}/>}
          />
          <CompactStatCard 
            label="Closing" 
            val={data?.closing?.stock ?? 0} 
            sub={formatCurrency(data?.closing?.inventory_value)}
            icon={<Package size={14}/>}
            active
          />
        </div>

        {/* Dense Table */}
        <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                  <th className="px-3 py-2 border-r border-gray-100">Timestamp</th>
                  <th className="px-3 py-2 border-r border-gray-100">Item</th>
                  <th className="px-3 py-2 border-r border-gray-100 text-center">Type</th>
                  <th className="px-3 py-2 border-r border-gray-100 text-right">Qty</th>
                  <th className="px-3 py-2 border-r border-gray-100 text-right">Rate</th>
                  <th className="px-3 py-2 border-r border-gray-100 text-right">Total</th>
                  <th className="px-3 py-2 text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(data?.movements || []).length > 0 ? (
                  data.movements.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-3 py-2 border-r border-gray-50 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800">{formatDate(item.created_at)}</span>
                          <span className="text-[10px] text-gray-400">{formatTime(item.created_at)}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 border-r border-gray-50 uppercase text-[11px] font-bold text-gray-700">
                        {item.name}
                      </td>
                      <td className="px-3 py-2 border-r border-gray-50 text-center">
                        <span className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold uppercase ${
                          item.type === 'purchase' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-3 py-2 border-r border-gray-50 text-right font-mono text-gray-900">
                        {item.qty?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-3 py-2 border-r border-gray-50 text-right text-gray-500 text-xs">
                        {item.avg_cost?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-3 py-2 border-r border-gray-50 text-right font-medium">
                        {formatCurrency(item.amount).replace('₹', '₹ ')}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {(item.gross_profit || 0) > 0 ? (
                          <span className="text-green-600 font-bold">+{item.gross_profit.toFixed(1)}</span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-3 py-8 text-center text-gray-400 italic">No movements recorded in this period.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Dense Footer */}
          <div className="bg-gray-50 p-2 px-3 border-t border-gray-200 flex flex-wrap gap-x-6 gap-y-1">
            <FooterItem label="COGS" val={formatCurrency(data?.period?.cogs_expense)} />
            <FooterItem label="Sales Qty" val={data?.period?.sold_qty ?? 0} />
            <FooterItem label="Stock Value" val={formatCurrency(data?.closing?.inventory_value)} />
            <FooterItem label="Avg Cost" val={formatCurrency(data?.closing?.avg_cost)} />
          </div>
        </div>
      </div>
    </div>
  </>
  );
};

const CompactStatCard = ({ label, val, sub, icon, active }) => (
  <div className={`p-2.5 rounded-sm border flex items-center gap-3 transition-all ${
    active ? 'bg-white border-blue-500 ring-1 ring-blue-500' : 'bg-white border-gray-200'
  }`}>
    <div className={`p-1.5 rounded-sm ${active ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-base font-black text-gray-800 leading-none">{val}</span>
        <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">{sub}</span>
      </div>
    </div>
  </div>
);

const FooterItem = ({ label, val }) => (
  <div className="flex items-center gap-1.5">
    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{label}:</span>
    <span className="text-xs font-bold text-gray-700">{val}</span>
  </div>
);


export default Stock_Movement   

  