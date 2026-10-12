import React, { useEffect, useState } from 'react'
import { Link} from "react-router";
import useApi from '../../api/useApi';

const Subgroup = () => {
    const {getData,postData}=useApi()
    const [list, setlist] = useState([])
    const [grouplist, setgrouplist] = useState([])
     const intialstate={
    groupname: '',
    grouptype: '',
    subgroup:'',
  }
const [formData, setFormData] = useState(intialstate);

const getledger=async()=>{
    const res2= await getData('/ledger/subgroup')
        setlist(Object.values(res2))
}

useEffect(() => {
      (async()=>{
        const res2= await getData('/ledger/get-group')
        setgrouplist(Object.values(res2))
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
  const res2 = await postData('/ledger/subgroup', formData);
  console.log(res2);
  setFormData(intialstate)
  getledger()
};

 return (
    <div className="max-w-6xl mx-auto p-4 font-sans text-sm">
      {/* Form Card */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm mb-6">
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
          <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Create Sub Group</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            
            {/* Group Type */}
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-slate-500 uppercase mb-1 ml-1">Group Type</label>
              <select
                required
                name="grouptype"
                value={formData.grouptype}
                onChange={handleChange}
                className="bg-slate-50 border border-slate-300 text-slate-900 rounded-md focus:ring-teal-500 focus:border-teal-500 block w-full p-2 text-sm transition-all"
              >
                <option value="">Select</option>
                <option value="Income">Income</option>
                <option value="Asset">Asset</option>
                <option value="Expense">Expense</option>
                <option value="Liabilty">Liabilty</option>
              </select>
            </div>

            {/* Group Name */}
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-slate-500 uppercase mb-1 ml-1">Group Name</label>
              <select
                required
                name="groupname"
                value={formData.groupname}
                onChange={handleChange}
                className="bg-slate-50 border border-slate-300 text-slate-900 rounded-md focus:ring-teal-500 focus:border-teal-500 block w-full p-2 text-sm transition-all"
              >
                <option value="">Select</option>
                {grouplist
                  .filter(item => item.GroupType === formData.grouptype)
                  .map(item => (
                    <option key={item.Pushkey} value={item.Pushkey}>{item.GroupName}</option>
                  ))}
              </select>
            </div>

            {/* SubGroup Name */}
            <div className="flex flex-col">
              <label className="text-[11px] font-bold text-slate-500 uppercase mb-1 ml-1">SubGroup Name</label>
              <input
                required
                type="text"
                name="subgroup"
                placeholder="Enter sub group name"
                value={formData.subgroup}
                onChange={handleChange}
                className="bg-slate-50 border border-slate-300 text-slate-900 rounded-md focus:ring-teal-500 focus:border-teal-500 block w-full p-2 text-sm"
              />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-3 flex justify-center mt-2">
              <button
                type="submit"
                className="px-10 py-2 bg-[#249CA2] hover:bg-[#1e858a] text-white font-bold rounded shadow-sm transition-colors text-sm uppercase tracking-widest"
              >
                Submit
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
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 font-bold text-slate-600 text-[11px] uppercase tracking-wider w-16 text-center">S No</th>
                <th className="px-4 py-3 font-bold text-slate-600 text-[11px] uppercase tracking-wider">Sub Group Name</th>
                <th className="px-4 py-3 font-bold text-slate-600 text-[11px] uppercase tracking-wider">Parent Group</th>
                <th className="px-4 py-3 font-bold text-slate-600 text-[11px] uppercase tracking-wider text-center w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.length > 0 ? (
                list.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-2.5 text-center text-slate-500 font-medium">{index + 1}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-800">{item.SubGroup}</td>
                    <td className="px-4 py-2.5 text-slate-600">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-500 mr-2 uppercase">{item.GroupType}</span>
                        {item.GroupName}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button 
                        onClick={() => setFormData({ groupname: item.Group_id, subgroup: item.SubGroup, grouptype: item.GroupType, id: item.id })}
                        className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-full transition-colors inline-block"
                        title="Edit Sub Group"
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
                  <td colSpan="4" className="px-4 py-10 text-center text-slate-400 italic bg-slate-50/30">
                    No Sub Groups found. Create one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Subgroup