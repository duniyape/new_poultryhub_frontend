import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useApi from '../../api/useApi';
import { ArrowLeft, Search, Filter } from 'lucide-react';

const Users = () => {
  const { id } = useParams();
 const { getData } = useApi();
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [typeFilter, setTypeFilter] = useState(id?id:'Customer');
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const headers = [
    { key: "name", label: "Shop" },
    { key: "vendor_id", label: "ID" },
    { key: "business_name", label: "Owner" },
    { key: "number", label: "Contact" },
    { key: "address", label: "Address" },
  ];

  useEffect(() => {
    (async () => {
      try {
        const res = await getData('/users');
        const data= res && typeof res === 'object' ? Object.values(res) : res;
        if (data && Array.isArray(data)) {
          const vendorArray = data.map((vendor) => ({
            ...vendor,
            type: vendor.v_type || "Customer"
          }));
          setVendors(vendorArray);
          applyFilters(vendorArray, typeFilter, searchTerm);
        }
      } catch (err) {
        console.error("❌ Failed to load users:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Helper to handle combined filtering logic
  const applyFilters = (data, type, query) => {
    let filtered = [...data];

    // Filter by Type
    if (type !== "") {
      filtered = filtered.filter(v => v.type === type);
    }

    // Filter by Search Query
    if (query.trim() !== "") {
      const q = query.toLowerCase();
      filtered = filtered.filter(v => 
        v.name?.toLowerCase().includes(q) || 
        v.business_name?.toLowerCase().includes(q) || 
        v.vendor_id?.toLowerCase().includes(q) ||
        v.number?.includes(q)
      );
    }

    setFilteredVendors(filtered);
  };

  const handleTypeChange = (value) => {
    setTypeFilter(value);
    applyFilters(vendors, value, searchTerm);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    applyFilters(vendors, typeFilter, value);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={()=>navigate('/')}
          className="flex items-center text-orange-600 hover:text-orange-700 font-medium transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
          <div className="flex items-center gap-2">
        <h1 className="text-md font-bold text-gray-800">{id} List</h1>

            {/* <Filter size={16} className="text-gray-400" /> */}
            {/* <span className="text-sm font-semibold text-gray-600">Filter:</span> */}
            {/* <div className="flex p-1 bg-gray-200 rounded-lg">
              {["Customer", "Vendor"].map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    typeFilter === type 
                    ? "bg-white text-orange-600 shadow-sm" 
                    : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {type === "" ? "All" : type}
                </button>
              ))}
            </div> */}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by name, owner or ID..." 
              className="pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-orange-500/20 outline-none w-full sm:w-64 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-wider">
                <th className="px-6 py-4">S.No</th>
                {headers.map((h, i) => (
                  <th key={i} className="px-6 py-4">{h.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={headers.length + 1} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading NPH records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredVendors.length > 0 ? (
                filteredVendors.map((vendor, index) => (
                  <tr 
                    key={index} 
                    onClick={() =>navigate('/profile/' + vendor.vendor_id)}
                    className="hover:bg-orange-50/30 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-2 text-gray-500 font-medium">{index + 1}</td>
                    {headers.map((h, i) => (
                      <td key={i} className="px-3 py-2 text-gray-700">
                        {h.key === 'name' ? (
                          <span className="font-bold text-gray-900 group-hover:text-orange-700">{vendor[h.key]}</span>
                        ) : (
                          String(vendor[h.key] ?? '—')
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={headers.length + 1} className="px-6 py-12 text-center text-gray-400 font-medium">
                    No users found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase">
          <span>Showing {filteredVendors.length} entries</span>
          <span className="text-orange-600">NPH Database v2.1</span>
        </div>
      </div>
    </div>
  );
};
export default Users;
