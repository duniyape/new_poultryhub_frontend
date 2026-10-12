import React, { useEffect, useState } from 'react'
import { Link} from "react-router";
import useApi from '../../api/useApi';


const Create_group = () => {
    const {getData,postData}=useApi()
    const [list, setlist] = useState([])
     const intialstate={
    groupname: '',
    grouptype: '',
  }
const [formData, setFormData] = useState(intialstate);
const getgroup=async()=>{
        const res2= await getData('/ledger/get-group')
        setlist(Object.values(res2))
      }

useEffect(() => {
      getgroup()
    }, [])
    
const handleChange = (e) => {
const { name, value } = e.target;
setFormData(prev => ({ ...prev, [name]: value }));
};


const handleSubmit = async (e) => {
  e.preventDefault(); // Correct capitalization
  const res2 = await postData('/ledger/create-group', formData);
  console.log(res2);
  getgroup()
};

return (
    <div className="max-w-6xl mx-auto p-4 font-sans text-sm">
      {/* Header & Form Card */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm mb-6 overflow-hidden">
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
          <h2 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Create Primary Group</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 items-end">
            
            {/* Group Name Input */}
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-0.5">Group Name</label>
              <input
                required
                type="text"
                name="groupname"
                placeholder="e.g. Current Assets"
                value={formData.groupname}
                onChange={handleChange}
                className="bg-slate-50 border border-slate-300 text-slate-900 rounded-md focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 block w-full p-2 text-sm transition-all outline-none"
              />
            </div>

            {/* Group Type Select */}
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-slate-500 uppercase mb-1.5 ml-0.5">Group Type</label>
              <select
                required
                name="grouptype"
                value={formData.grouptype}
                onChange={handleChange}
                className="bg-slate-50 border border-slate-300 text-slate-900 rounded-md focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 block w-full p-2 text-sm transition-all outline-none"
              >
                <option value="">Select Category</option>
                <option value="Income">Income</option>
                <option value="Asset">Asset</option>
                <option value="Expense">Expense</option>
                <option value="Liabilty">Liabilty</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-1 flex justify-center pt-2">
              <button
                type="submit"
                className="px-12 py-2 bg-[#249CA2] hover:bg-[#1e858a] text-white font-bold rounded shadow-sm transition-all text-sm uppercase tracking-widest active:transform active:scale-95"
              >
                Submit Group
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Primary Group Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 font-bold text-slate-600 text-[11px] uppercase tracking-wider w-16 text-center">S.No</th>
                <th className="px-4 py-3 font-bold text-slate-600 text-[11px] uppercase tracking-wider">Group Name</th>
                <th className="px-4 py-3 font-bold text-slate-600 text-[11px] uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 font-bold text-slate-600 text-[11px] uppercase tracking-wider text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.length > 0 ? (
                list.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-4 py-2.5 text-center text-slate-400 font-mono text-xs">{index + 1}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-800 tracking-tight">{item.GroupName}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter
                        ${item.GroupType === 'Asset' ? 'bg-blue-50 text-blue-600' : 
                          item.GroupType === 'Income' ? 'bg-green-50 text-green-600' :
                          item.GroupType === 'Expense' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                        {item.GroupType}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button 
                        onClick={() => setFormData({ groupname: item.GroupName, grouptype: item.GroupType, id: item.id })}
                        className="text-slate-400 hover:text-teal-600 p-1.5 hover:bg-teal-50 rounded-full transition-all"
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
                  <td colSpan="4" className="px-4 py-12 text-center text-slate-400 italic bg-slate-50/30 font-light">
                    No primary groups have been created yet.
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


export default Create_group