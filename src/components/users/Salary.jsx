import React, { useState, useMemo, useEffect } from 'react';
import { 
  DollarSign, 
  Calculator, 
  Calendar, 
  User, 
  ArrowLeft, 
  Save, 
  Info,
  CreditCard,
  FileText,
  Download,
  CheckCircle2,
  Database
} from 'lucide-react';
import {db} from '../../firebase/Database';
import { ref, set,push } from 'firebase/database';
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
const App = () => {
  const [formData, setFormData] = useState({
    employeeId: '',
    grossSalary: '',
    paymentDate: new Date().toISOString(),
    paymentMethod: 'BANK',
    notes: ''
  });

  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);

  const [submitted, setSubmitted] = useState(false);

  // Get selected employee details
  const selectedEmployee = useMemo(() => {
  return employees.find(emp => emp.id === formData.employeeId);
}, [formData.employeeId, employees]);

  // Calculations
  const netPay = useMemo(() => {
    return parseFloat(formData.grossSalary) || 0;
  }, [formData.grossSalary]);

  const annualEstimate = useMemo(() => netPay * 12, [netPay]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    setSubmitted(true);
    console.log(formData) 
    const ledgerRef = push(ref(db, "ledger"));
     const ledgerData = {
                id: ledgerRef.key,
                mode: formData.paymentMethod,    
                reference: formData.notes,
                date: new Date().toISOString(),
                narration: `Salary Payment to Employee ID: ${formData.employeeId}`,
                dr: [{ ledger: 'A5', particular: `Payment Made-${formData.employeeId}`, amt: netPay }],
                cr: [{ ledger: formData.paymentMethod==="CASH" ? 'A1' :'A2', particular: `Payment Made-${formData.employeeId}`, amt: netPay }],
                empID: formData.employeeId,
                total_amount: netPay,
                voucher_type:"payment",
                voucher_mode: formData.paymentMethod,
            };

            try {
                await set(ledgerRef, ledgerData);
                setSubmitted(false)
                Swal.fire({
                  title: "Success",
                  text: "Payment recorded successfully!",
                  icon: "success",
                  confirmButtonText: "OK",
                  timer: 1000
                });
                setFormData({
                  employeeId: '',
                  grossSalary: '',
                  paymentDate: new Date().toISOString(),
                  paymentMethod: 'Bank',
                  notes: ''
                });
            } catch (error) {
              Swal.fire("Error", "Failed to record payment. Please try again.", "error");
            }
          
  };

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
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            Payroll System <span className="text-slate-200">|</span> v2.4.0
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-white">
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-indigo-600" />
                  Salary Processing Form
                </h1>
                <p className="text-slate-500 text-sm mt-1">Generate and record a new payment for your team.</p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Employee Selection */}
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

                {/* Earnings Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Gross Amount (₹)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="number"
                      name="grossSalary"
                      value={formData.grossSalary}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Payment Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="date"
                        name="paymentDate"
                        value={formData.paymentDate}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Method</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select 
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleChange}
                        className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none"
                      >
                        <option>BANK</option>
                        <option>CASH</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Transaction Id / Ref. Id</label>
                  <textarea 
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none text-sm"
                    placeholder="Reference, bonus reason, or month info..."
                  />
                </div>

                <button 
                  type="submit"
                  disabled={submitted}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] ${
                    submitted 
                    ? 'bg-green-600 text-white' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
                  }`}
                >
                  {submitted ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Record Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Submit Payment
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Improved Payroll Summary Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col">
              {/* Header of Card */}
              <div className="p-6 bg-slate-900 text-white">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <FileText className="w-6 h-6 text-indigo-300" />
                  </div>
                  <span className="text-[10px] font-bold bg-indigo-500/30 px-2 py-1 rounded border border-indigo-400/30 text-indigo-100 uppercase tracking-tighter">Draft Payslip</span>
                </div>
                
                {selectedEmployee ? (
                  <div>
                    <h3 className="text-xl font-bold leading-none mb-1">{selectedEmployee.name}</h3>
                    <p className="text-indigo-300 text-xs font-medium uppercase tracking-wider">{selectedEmployee.position}</p>
                  </div>
                ) : (
                  <div className="py-2">
                    <p className="text-slate-400 text-sm italic">No employee selected</p>
                  </div>
                )}
              </div>

              {/* Data Rows */}
              <div className="p-6 space-y-6 flex-grow">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Monthly Gross</span>
                    <span className="font-bold text-slate-700">₹{netPay.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Estimated Annual</span>
                    <span className="font-bold text-slate-700">₹{annualEstimate.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Payment Method</span>
                    <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md text-[11px] uppercase tracking-wide">
                      {formData.paymentMethod}
                    </span>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Net Disbursement</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900 tabular-nums">
                      ₹{netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-slate-400 font-bold text-sm">INR</span>
                  </div>
                </div>

                {/* Additional context */}
                <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
                  <div className="flex items-start gap-2">
                    <div className="mt-1">
                      <Info className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      This calculation assumes a standard 12-month payroll cycle. Actual annual totals may vary based on bonuses or leave adjustments.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action */}
              {/* <div className="p-6 pt-0 mt-auto">
                <button 
                  disabled={!formData.grossSalary}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-50 hover:border-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  Preview Full Slip
                </button>
              </div> */}
            </div>

            {/* Support Note */}
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex gap-3">
              <div className="shrink-0">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                  <User className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-900">Payroll Support</p>
                <p className="text-[11px] text-indigo-700/70 mt-0.5">Contact HR for custom deduction overrides or international wire details.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;