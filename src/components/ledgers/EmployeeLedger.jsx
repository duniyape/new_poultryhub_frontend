import React, { useEffect, useState } from 'react'
import { Link} from "react-router";
import useApi from '../../api/useApi';
import { useNavigate } from "react-router-dom";
import { 
ArrowLeft,
  User 
} from 'lucide-react';
const EmployeeLedger = () => {

    const navigate = useNavigate();
    const {getData,postData}=useApi()
    const [list, setlist] = useState([])
    const [grouplist, setgrouplist] = useState([])
    const [ledger, setledger] = useState([])
     const intialstate={
    groupname: 'A2',
    grouptype: 'Expense',
    ledgername: 'A5',
    fromdate: '',
    todate: '',
    employeeId:''
  }
const [formData, setFormData] = useState(intialstate);

useEffect(() => {
      (async()=>{
        const res2= await getData('/ledger/get-group')
        setgrouplist(Object.values(res2))
        const res1= await getData('/ledger/get-ledger')
        setledger(Object.values(res1))
      }
      )()
    }, [])
    
const handleChange = (e) => {
const { name, value } = e.target;
setFormData(prev => ({ ...prev, [name]: value }));
};


const handleSubmit = async (e) => {
  console.log(formData)
    e.preventDefault(); // Correct capitalization
    const res2= await getData(`/ledger/personal_ledger-data/A5/${formData.fromdate}/${formData.todate}/${formData.employeeId}`)
    setlist(res2.transactions)
    console.log(res2)
};

const [employees, setEmployees] = useState([]);

  useEffect(() => {
  fetchEmployees();
}, []);

const fetchEmployees = async () => {
  try {
    const res = await fetch("https://apipoultry.duniyape.in/employees");
    const data = await res.json();
    setEmployees(data);
  } catch (err) {
    console.error("Failed to fetch employees", err);
  }
};


 return (
    <div className="max-w-6xl mx-auto p-4 font-sans text-sm">

       <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            Payroll System <span className="text-slate-200">|</span> v2.4.0
          </div>
        </div>
      {/* Search Form Card */}
      <form 
        onSubmit={handleSubmit} 
        className="bg-white border border-slate-200 rounded-lg p-4 mb-6 shadow-sm"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
           {/* From Date */}
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-slate-500 uppercase mb-1 ml-1">From Date</label>
            <input
              type="date"
              name="fromdate"
              required
              value={formData.fromdate}
              onChange={handleChange}
              className="bg-slate-50 border border-slate-300 text-slate-900 rounded-md focus:ring-teal-500 focus:border-teal-500 block w-full p-2 text-sm"
            />
          </div>

          {/* To Date */}
          <div className="flex flex-col">
            <label className="text-[11px] font-bold text-slate-500 uppercase mb-1 ml-1">To Date</label>
            <input
              type="date"
              name="todate"
              required
              value={formData.todate}
              onChange={handleChange}
              className="bg-slate-50 border border-slate-300 text-slate-900 rounded-md focus:ring-teal-500 focus:border-teal-500 block w-full p-2 text-sm"
            />
          </div>


           <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Select Employee</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select 
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none"
                    >
                      <option value="">Choose a team member...</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} — {emp.dept}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <div className="border-l border-t border-slate-400 w-1.5 h-1.5 rotate-[225deg]"></div>
                    </div>
                  </div>
                </div>

  

          {/* Group Type */}
          {/* <div className="flex flex-col">
            <label className="text-[11px] font-bold text-slate-500 uppercase mb-1 ml-1">Group Type</label>
            <select
              name="grouptype"
              required
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
          </div> */}

          {/* Group Name */}
          {/* <div className="flex flex-col">
            <label className="text-[11px] font-bold text-slate-500 uppercase mb-1 ml-1">Group Name</label>
            <select
              name="groupname"
              required
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
          </div> */}

          {/* Ledger Name */}
          {/* <div className="flex flex-col">
            <label className="text-[11px] font-bold text-slate-500 uppercase mb-1 ml-1">Ledger Name</label>
            <select
              name="ledgername"
              required
              value={formData.ledgername}
              onChange={handleChange}
              className="bg-slate-50 border border-slate-300 text-slate-900 rounded-md focus:ring-teal-500 focus:border-teal-500 block w-full p-2 text-sm transition-all"
            >
              <option value="">Select</option>
              {ledger
                .filter(item => item.GroupName === formData.groupname)
                .map(item => (
                  <option key={item.Pushkey} value={item.Pushkey}>{item.LedgerName}</option>
                ))}
            </select>
          </div> */}

         

          {/* Search Button Container */}
          <div className="flex items-end justify-center md:justify-start">
            <button
              type="submit"
              className="w-full md:w-auto px-8 py-2 bg-[#249CA2] hover:bg-[#1e858a] text-white font-bold rounded-md shadow-sm transition-colors text-sm tracking-wide"
            >
              SEARCH
            </button>
          </div>
        </div>
      </form>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 font-bold text-slate-600 text-[11px] uppercase tracking-wider text-center w-12">S No</th>
                <th className="px-4 py-3 font-bold text-slate-600 text-[11px] uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 font-bold text-slate-600 text-[11px] uppercase tracking-wider">Particular</th>
                <th className="px-4 py-3 font-bold text-slate-600 text-[11px] uppercase tracking-wider text-right w-28">Dr</th>
                <th className="px-4 py-3 font-bold text-slate-600 text-[11px] uppercase tracking-wider text-right w-28">Cr</th>
                <th className="px-4 py-3 font-bold text-slate-600 text-[11px] uppercase tracking-wider text-right w-32">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.length > 0 ? (
                list.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-2 text-center text-slate-500">{index + 1}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-slate-700 font-medium">{new Date(item.date).toLocaleDateString('en-GB')}</td>
                    <td className="px-4 py-2 text-slate-600 italic leading-snug">{item.particular}</td>
                    <td className="px-4 py-2 text-right text-slate-900 tabular-nums">
                      {item.dr_amt > 0 ? item.dr_amt.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}
                    </td>
                    <td className="px-4 py-2 text-right text-slate-900 tabular-nums">
                      {item.cr_amt > 0 ? item.cr_amt.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}
                    </td>
                    <td className="px-4 py-2 text-right font-bold tabular-nums">
                      <span className={item.balance >= 0 ? "text-slate-900" : "text-rose-600"}>
                        {Math.abs(item.balance).toFixed(2)} {item.balance >= 0 ? 'Dr' : 'Cr'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-400 italic bg-slate-50/30">
                    No transactions found for the selected period.
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

export default EmployeeLedger