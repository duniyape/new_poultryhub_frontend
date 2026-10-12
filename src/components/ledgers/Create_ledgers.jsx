import React, { useEffect, useState } from 'react'
import { Link} from "react-router";
import useApi from '../../api/useApi';


const Create_ledgers = () => {
    const {getData,postData}=useApi()
    const [list, setlist] = useState([])
    const [grouplist, setgrouplist] = useState([])
    const [subgrouplist, setsubgrouplist] = useState([])
    const intialstate={
    groupname: '',
    grouptype: '',
    ledgername: '',
    subgroup:'',
  }
const [formData, setFormData] = useState(intialstate);

const getledger=async()=>{
    const res2= await getData('/ledger/get-ledger')
        setlist(res2)
}

useEffect(() => {
      (async()=>{
        await Promise.all([
          getData('/ledger/get-group'),
          getData('/ledger/subgroup')
        ]).then(([groupRes, subGroupRes]) => {
          setgrouplist(Object.values(groupRes));
          setsubgrouplist(subGroupRes);
        });
        getledger()
       
      }
      )()
    }, [])
    
const handleChange = (e) => {
const { name, value } = e.target;
setFormData(prev => ({ ...prev, [name]: value }));
};


const handleSubmit = async (e) => {
  e.preventDefault(); // Correct capitalization
  const res2 = await postData(formData.Pushkey?'/ledger/update-ledger':'/ledger/create-ledger', formData);
  console.log(res2);
  setFormData(intialstate)
  getledger()
};

return (
    <div className="max-w-6xl mx-auto p-4 font-sans text-sm">
      {/* Form Card */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm mb-6 overflow-hidden">
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Create New Ledger</h2>
          <span className="text-[10px] text-slate-400 font-medium italic">Step 3: Individual Account Creation</span>
        </div>

        <form onSubmit={handleSubmit} className="p-4 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            
            {/* Group Type */}
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-slate-500 uppercase mb-1 ml-1 text-nowrap">1. Group Type</label>
              <select
                required
                name="grouptype"
                value={formData.grouptype}
                onChange={handleChange}
                className="bg-slate-50 border border-slate-300 text-slate-900 rounded-md focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 block w-full p-2 text-sm outline-none transition-all"
              >
                <option value="">Select Type</option>
                <option value="Income">Income</option>
                <option value="Asset">Asset</option>
                <option value="Expense">Expense</option>
                <option value="Liabilty">Liabilty</option>
              </select>
            </div>

            {/* Group Name */}
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-slate-500 uppercase mb-1 ml-1 text-nowrap">2. Parent Group</label>
              <select
                required
                name="groupname"
                value={formData.groupname}
                onChange={handleChange}
                className="bg-slate-50 border border-slate-300 text-slate-900 rounded-md focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 block w-full p-2 text-sm outline-none transition-all"
              >
                <option value="">Select Group</option>
                {grouplist
                  .filter(item => item.GroupType === formData.grouptype)
                  .map(item => (
                    <option key={item.Pushkey} value={item.Pushkey}>{item.GroupName}</option>
                  ))}
              </select>
            </div>

            {/* SubGroup Name */}
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-slate-500 uppercase mb-1 ml-1 text-nowrap">3. Sub-Group</label>
              <select
                required
                name="subgroup"
                value={formData.subgroup}
                onChange={handleChange}
                className="bg-slate-50 border border-slate-300 text-slate-900 rounded-md focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 block w-full p-2 text-sm outline-none transition-all"
              >
                <option value="">Select Sub-Group</option>
                {subgrouplist
                  .filter(item => item.Group_id === formData.groupname)
                  .map(item => (
                    <option key={item.id} value={item.id}>{item.SubGroup}</option>
                  ))}
              </select>
            </div>

            {/* Ledger Name */}
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-slate-500 uppercase mb-1 ml-1 text-nowrap">4. Ledger Name</label>
              <input
                required
                type="text"
                name="ledgername"
                placeholder="e.g. HDFC Bank A/c"
                value={formData.ledgername}
                onChange={handleChange}
                className="bg-slate-50 border border-slate-300 text-slate-900 rounded-md focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 block w-full p-2 text-sm outline-none transition-all"
              />
            </div>

            {/* Action Row */}
            <div className="lg:col-span-4 flex justify-end mt-2 pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="w-full lg:w-auto px-10 py-2 bg-[#249CA2] hover:bg-[#1e858a] text-white font-bold rounded shadow-sm transition-all text-sm uppercase tracking-widest active:scale-95"
              >
                Create Ledger
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* List Table Card */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-600 font-bold">
                <th className="px-4 py-3 text-center w-12">S.No</th>
                <th className="px-4 py-3">Code / ID</th>
                <th className="px-4 py-3">Ledger Name</th>
                <th className="px-4 py-3">Hierarchy (Sub & Parent)</th>
                <th className="px-4 py-3 text-center w-24">Nature</th>
                <th className="px-4 py-3 text-center w-20">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {list.length > 0 ? (
                list.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-4 py-2.5 text-center text-slate-400 font-mono">{index + 1}</td>
                    <td className="px-4 py-2.5 text-slate-500 font-mono">{item.Pushkey}</td>
                    <td className="px-4 py-2.5 font-bold text-slate-800 uppercase tracking-tight">{item.LedgerName}</td>
                    <td className="px-4 py-2.5 text-slate-600 leading-relaxed">
                      <div className="font-medium">{item.SubGroupName}</div>
                      <div className="text-[10px] text-slate-400">{item.Group}</div>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                        (item.GroupType === "Asset" || item.GroupType === "Expense") 
                        ? "text-blue-600 bg-blue-50 border-blue-100" 
                        : "text-purple-600 bg-purple-50 border-purple-100"
                      }`}>
                        {(item.GroupType === "Asset" || item.GroupType === "Expense") ? "DR" : "CR"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button 
                        onClick={() => setFormData({ groupname: item.GroupName, grouptype: item.GroupType, ledgername: item.LedgerName, Pushkey: item.Pushkey, subgroup: item.SubGroupID })}
                        className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-slate-400 italic bg-slate-50/30">
                    No ledgers found. Start by selecting a group and subgroup.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Create_ledgers