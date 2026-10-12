 import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Package, 
  Layers, 
  Search, 
  Loader2, 
  ChevronRight,
  Boxes
} from 'lucide-react';
import useApi from '../api/useApi'
import { useNavigate } from 'react-router-dom';

const Products = () => {
    const [list, setList] = useState([]);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    const {getData}=useApi()

    useEffect(() => {
      (async()=>{
        const res2= await getData('/get_all_product')
        setList(Object.values(res2))
      }
      )()
    }, [])

  const filteredList = list.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-sm pb-10">
      {/* Top Navbar */}
      <nav className="bg-[#249CA2] h-12 flex items-center px-4 sticky top-0 z-50">
        <button onClick={()=>navigate('/')} className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
          <ArrowLeft size={18} />
          <span className="font-bold text-xs uppercase tracking-wider">Back</span>
        </button>
      </nav>

      <div className="max-w-5xl mx-auto p-2 md:p-4 space-y-3">
        
        {/* Header & Search */}
        <div className="bg-white p-3 rounded-sm border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2 self-start">
            <div className="bg-[#249CA2] p-1.5 rounded-sm">
              <Boxes size={16} className="text-white" />
            </div>
            <h1 className="text-base font-black text-gray-800 uppercase tracking-tight">Current Stock List</h1>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
            <input 
              type="text"
              placeholder="Search product or category..."
              className="w-full bg-gray-50 border border-gray-200 rounded-sm pl-9 pr-3 py-1.5 text-xs focus:ring-1 focus:ring-[#249CA2] outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Inventory Summary Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <SummaryCard label="Total Items" val={list.length} icon={<Layers size={14}/>} />
          <SummaryCard label="In Stock" val={list.filter(i => i.current_stock > 0).length} icon={<Package size={14}/>} />
          <SummaryCard label="Categories" val={new Set(list.map(i => i.category)).size} icon={<ChevronRight size={14}/>} />
          <SummaryCard label="Low Stock" val={list.filter(i => i.current_stock < 50).length} icon={<ArrowLeft size={14}/>} danger />
        </div>

        {/* Stock Table */}
        <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[12px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-tighter">
                  <th className="px-3 py-2.5 border-r border-gray-100 w-12 text-center text-[10px]">#</th>
                  <th className="px-3 py-2.5 border-r border-gray-100">Product Details</th>
                  <th className="px-3 py-2.5 border-r border-gray-100">Category</th>
                  {/* <th className="px-3 py-2.5 border-r border-gray-100 text-center">Packaging</th> */}
                  <th className="px-3 py-2.5 border-r border-gray-100 text-right">Main Stock</th>
                  <th className="px-3 py-2.5 text-right">Loose/Pieces</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredList.length > 0 ? (
                  filteredList.map((item, index) => {
                    const totalStock = item.unit === "Kg" || item.unit === "Ltr" ? (item.current_stock || 0) : (item.current_pieces || 0);
                    const pkg = item.pkg || 1;
                    const fullUnits = Math.floor(totalStock / pkg);
                    const loose = totalStock % pkg;
                    const subUnit = item.unit === "Kg" ? "Pcs" : "Kg";

                    return (
                      <tr key={item.id} className="hover:bg-[#249CA2]/5 transition-colors group">
                        <td className="px-3 py-2.5 border-r border-gray-50 text-center text-gray-400 font-mono">
                          {String(index + 1).padStart(2, '0')}
                        </td>
                        <td onClick={()=>navigate('/product/'+item.id)} className="px-3 py-2.5 border-r border-gray-50">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-800 group-hover:text-[#249CA2] transition-colors uppercase truncate max-w-50">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium italic">{item.subcategory || 'Standard'}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 border-r border-gray-50">
                          <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-sm text-[10px] font-bold uppercase">
                            {item.category}
                          </span>
                        </td>
                        
                        <td className="px-3 py-2.5 border-r border-gray-50 text-right whitespace-nowrap">
                          <span className="text-sm font-black text-gray-900">{fullUnits}</span>
                          <span className="text-[10px] text-gray-400 font-bold ml-1 uppercase">{item.unit}</span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <div className="flex flex-col items-end">
                            <div className="text-sm font-bold text-gray-800">
                              {loose} <span className="text-[10px] text-[#249CA2] uppercase">{item.unit}</span>
                            </div>
                            <div className="text-[10px] text-gray-400 leading-none">
                              / {item.unit === "Kg" ? item.current_pieces : item.current_stock} {subUnit}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-3 py-10 text-center text-gray-400 italic bg-white font-medium">
                      No products found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Dense Table Footer Info */}
          <div className="bg-gray-50 p-2 px-3 border-t border-gray-200 flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Inventory Snapshot • {new Date().toLocaleDateString('en-IN')}
            </span>
            <div className="flex items-center gap-4">
              <FooterStat label="Active Items" val={filteredList.length} />
              {/* <FooterStat label="Stock Alert" val={filteredList.filter(i => i.current_stock < 100).length} /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ label, val, icon, active, danger }) => (
  <div className={`p-2.5 rounded-sm border flex items-center gap-3 bg-white shadow-sm border-gray-200`}>
    <div className={`p-1.5 rounded-sm ${danger ? 'bg-red-50 text-red-500' : 'bg-[#249CA2]/10 text-[#249CA2]'}`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">{label}</p>
      <span className={`text-base font-black leading-none ${danger ? 'text-red-600' : 'text-gray-800'}`}>{val}</span>
    </div>
  </div>
);

const FooterStat = ({ label, val }) => (
  <div className="flex items-center gap-1.5">
    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{label}:</span>
    <span className="text-xs font-bold text-gray-700">{val}</span>
  </div>
);

export default Products