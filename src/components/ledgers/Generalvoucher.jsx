

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import Swal from "sweetalert2";
import useApi from '../../api/useApi';
import { User } from "lucide-react";

const JournalVoucher = () => {
  const {getData,postData}= useApi()
  // --- State for the new Journal Voucher form ---
  const [accounts, setAccounts] = useState([]); // List of all available ledgers
  const [narration, setNarration] = useState("");
  const [entries, setEntries] = useState([]); // List of previously saved vouchers
  const [clientName, setClientName] = useState('');
  const [clientSuggestions, setClientSuggestions] = useState([]);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [clientID, setClientID] = useState('');

  // State to manage individual line item being added
  const [newLineItem, setNewLineItem] = useState({
    ledger: "",
    amount: "",
    particular: "",
    type: "debit" // 'debit' or 'credit'
  });

  // State for the actual debit and credit line items
  const [debits, setDebits] = useState([]);
  const [credits, setCredits] = useState([]);

  // --- Utility Functions ---

  // Calculates the sum of all amounts in an array of entries
  const calculateTotal = (arr) => {
    return arr.reduce((sum, entry) => sum + Number(entry.amount), 0);
  };

  const totalDebit = calculateTotal(debits);
  const totalCredit = calculateTotal(credits);

  // Helper to get Ledger Name from Pushkey
  const getLedgerName = (Code) => {
    const account = accounts.find(acc => acc.Code === Code);
    return account ? account.LedgerName : Code;
  };

  // --- Handlers ---

  const handleLineItemChange = (e) => {
    const { name, value } = e.target;
    setNewLineItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEntry = (e) => {
    e.preventDefault();
    console.log(newLineItem)

    if (!newLineItem.ledger || !newLineItem.amount || Number(newLineItem.amount) <= 0) {
      Swal.fire({
        title: "Validation Error",
        text: "Please select a ledger and enter a valid amount.",
        icon: "warning"
      });
      return;
    }

    const entry = {
      ...newLineItem,
      amount: Number(newLineItem.amount),
    };

    if (newLineItem.type === "debit") {
      setDebits((prev) => [...prev, entry]);
    } else {
      setCredits((prev) => [...prev, entry]);
    }

    // Reset line item form, keeping type for convenience
    setNewLineItem({ ledger: "", amount: "", particular: "", type: newLineItem.type });
  };

  const handleRemoveEntry = (index, type) => {
    if (type === "debit") {
      setDebits((prev) => prev.filter((_, i) => i !== index));
    } else {
      setCredits((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    // e.preventDefault();
     if(clientName!==""&&!clientID){
      Swal.fire({
        title: "Validation Error",
        text: "Please select a valid Account Holder from the suggestions.",
        icon: "warning"
      });
      return;
    }

    if (debits.length === 0 || credits.length === 0) {
      Swal.fire({
        title: "Validation Error",
        text: "The voucher must have at least one Debit and one Credit entry.",
        icon: "warning"
      });
      return;
    }

    if (totalDebit !== totalCredit) {
      Swal.fire({
        title: "Validation Error",
        text: `Debit Total (₹${totalDebit}) must equal Credit Total (₹${totalCredit}).`,
        icon: "warning"
      });
      return;
    }

   

    try {
        const formattedDebits = debits.map(d => ({
        ledger_id: d.ledger,
        ledger_name:getLedgerName(d.ledger),
        narration: d.particular || "Journal Voucher",
        debit:d.amount,
        credit:0,
        employee_id:clientID,
        employee_name: clientName
      }));
      
      // Format the single Credit entry
      const formattedCredit =credits.map(c => ({
        ledger_id: c.ledger,
        ledger_name:getLedgerName(c.ledger),
        narration: c.particular || "Journal Voucher",
        debit:0,
        credit:c.amount,
        employee_id:clientID,
        employee_name: clientName
      }));

      const voucher = {
        date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        entries: [...formattedDebits,...formattedCredit],
        amount: totalCredit,
        narration: narration,
        voucher_type: "Journal",
      };
      console.log(voucher)
      const res=await postData('/journal_voucher',voucher)
      Swal.fire({
        title: "Successful",
        text: 'Journal Voucher Successfully Saved!',
        icon: "success",
        timer:2000
      });

      // Update local entries list
      setEntries(prev => [voucher, ...prev]);

      // Reset form
      setDebits([]);
      setCredits([]);
      setNarration("");
      setClientID('');
      setClientName('');
      setNewLineItem({ ledger: "", amount: "", particular: "", type: "debit" });

    } catch (error) {
      console.error("Error saving journal voucher:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to save journal voucher.",
        icon: "error"
      });
    }
  };

  useEffect(() => {
        (async()=>{
          const res2= await getData('/ledger/get-group')
        //   setAccounts(Object.values(res2))
          
          const res1= await getData('/ledger/get-ledger')
          setAccounts(Object.values(res1))
          console.log(Object.values(res1))
        }
        )()
      }, [])
  
    const fetchdata = async () => {
        try {
        const res = await getData("/ledgers");
        console.log(res)
        if (Array.isArray(res)) {
            setAccounts(res)
        } 
        } catch (error) {
        console.error("Failed to load Data:", error);
        }
    };
    //   useEffect(() => {
    //   fetchdata();
    //   }, []);

      const [employees, setemployee] = useState([])
    const fetchdata1 = async () => {
        try {
          const res2 = await getData("/trade/search-data");
          console.log(res2)
          if (Array.isArray(res2)) {
            setemployee(res2);
          } 
        } catch (error) {
          console.error("Failed to load appointments:", error);
        }
      };
  useEffect(() => {
        fetchdata1();
      }, []);

    const handleClientNameChange = (e) => {
    const value = e.target.value;
    setClientName(value);
    setClientID(''); // Reset client ID on change

    if (value.length > 1) {
        const matches = employees
            .filter(client => 
                client.name.toLowerCase().includes(value.toLowerCase())
            )
            .slice(0, 5); // Limit to top 5 suggestions
        setClientSuggestions(matches);
        setShowClientSuggestions(matches.length > 0);
    } else {
        setClientSuggestions([]);
        setShowClientSuggestions(false);
    }
};
  const fillClientDetails = (clientData) => {
        setClientName(clientData.name);
        setClientID(clientData._id || '');
        setShowClientSuggestions(false); // Hide suggestions after selection
    };
  
  const isBalanced = totalDebit === totalCredit;
  const canSubmit = isBalanced && (debits.length > 0 || credits.length > 0);

  return (
    <div className="max-w-4xl mx-auto p-4 font-sans text-sm">
      <form>
        {/* Narration and Line Item Entry */}
        <div className="p-4 border border-gray-300 rounded-lg mb-5 bg-white shadow-sm">
          <h3 className="mt-0 text-xl font-bold text-gray-700 mb-4">
            Add New Journal Entry ✍️
          </h3>
           <div className="relative">
                {/* The custom input that triggers autocomplete logic */}
                <InputGroup 
                    icon={User} 
                    label="Account Holder Name" 
                    id="client-name" 
                    type="text" 
                    value={clientName} 
                    onChange={handleClientNameChange} 
                    onFocus={() => clientName.length > 1 && clientSuggestions.length > 0 && setShowClientSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowClientSuggestions(false), 200)} // Delay hiding for click
                    placeholder="Start typing..." 
                    required 
                />
                {/* Suggestions Dropdown */}
                {showClientSuggestions && clientSuggestions.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
                        {clientSuggestions.map((client) => (
                            <li 
                                key={client.id}
                                onMouseDown={() => fillClientDetails(client)} // Use onMouseDown to trigger before onBlur fires
                                className="p-3 text-sm text-gray-800 hover:bg-indigo-50 cursor-pointer transition duration-100 border-b border-gray-100 last:border-b-0"
                            >
                                <div className="font-medium">{client.name}</div>
                                <div className="text-xs text-gray-500">{client.address}, {client.city}</div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

          {/* Narration Input */}
          <div className="my-4">
            <label className="font-bold mb-1 block">Narration (Overall Voucher)</label>
            <textarea
              name="narration"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              required
              className="w-full p-2 min-h-[60px] border border-gray-300 rounded-md resize-y focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Line Item Inputs */}
          <div className="flex flex-wrap gap-4 items-end">
            {/* Debit/Credit Selector */}
            <div className="flex-none w-28">
              <label className="font-bold mb-1 block">Type</label>
              <select
                name="type"
                value={newLineItem.type}
                onChange={handleLineItemChange}
                className="w-full p-2 border border-gray-400 rounded-md"
              >
                <option value="debit">Debit (Dr.)</option>
                <option value="credit">Credit (Cr.)</option>
              </select>
            </div>

            {/* Ledger Selector */}
            <div className="flex-1 min-w-[200px]">
              <label className="font-bold mb-1 block">Ledger Account</label>
              <select
                name="ledger"
                value={newLineItem.ledger}
                onChange={handleLineItemChange}
                required
                className="w-full p-2 border border-gray-400 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Ledger</option>
                {accounts.map((acc, idx) => (
                  <option key={idx} value={acc.Code}>
                    {acc.LedgerName}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount Input */}
            <div className="flex-none w-24">
              <label className="font-bold mb-1 block">Amount (₹)</label>
              <input
                type="number"
                name="amount"
                value={newLineItem.amount}
                onChange={handleLineItemChange}
                required
                min="0.01"
                step="0.01"
                className="w-full p-2 border border-gray-400 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Particulars Input (Optional) */}
            <div className="flex-1 min-w-[200px] hidden md:block">
              <label className="font-bold mb-1 block">Particulars (Optional)</label>
              <input
                type="text"
                name="particular"
                value={newLineItem.particular}
                onChange={handleLineItemChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Add Button */}
            <div className="flex-none">
              <button
                onClick={handleAddEntry}
                type="button"
                className="bg-green-600 hover:bg-green-700 text-white p-2 text-sm border-none rounded-md cursor-pointer h-9 transition duration-150 ease-in-out"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Debit/Credit Entries Display and Summary */}
        <div className="flex flex-col md:flex-row gap-5 mb-5">
          {/* Debit Table */}
          <div className={`flex-1 border rounded-lg overflow-hidden shadow-sm ${!isBalanced ? 'border-red-500 border-2' : 'border-gray-300'}`}>
            <h4 className={`p-3 text-lg font-semibold bg-gray-50 ${!isBalanced ? 'text-red-600' : 'text-gray-700'}`}>
              Debit Entries (Total: ₹{totalDebit.toFixed(2)}) ⬇️
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase w-2/5">Ledger</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase w-3/10">Particulars</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase w-1/5">Amount</th>
                    <th className="px-3 py-2 text-xs font-medium text-gray-700 uppercase w-1/10">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {debits.map((entry, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 whitespace-nowrap">{getLedgerName(entry.ledger)}</td>
                      <td className="px-3 py-2">{entry.particular}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-right font-mono">{entry.amount.toFixed(2)}</td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveEntry(index, 'debit')}
                          className="text-red-500 hover:text-red-700 focus:outline-none"
                          aria-label="Remove debit item"
                        >
                          <i className="fa-solid fa-trash text-sm" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {debits.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-3 py-4 text-center text-gray-500 italic">
                        No Debit entries added yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {/* Credit Table */}
          <div className={`flex-1 border rounded-lg overflow-hidden shadow-sm ${!isBalanced ? 'border-red-500 border-2' : 'border-gray-300'}`}>
            <h4 className={`p-3 text-lg font-semibold bg-gray-50 ${!isBalanced ? 'text-red-600' : 'text-gray-700'}`}>
              Credit Entries (Total: ₹{totalCredit.toFixed(2)}) ⬆️
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase w-2/5">Ledger</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase w-3/10">Particulars</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-700 uppercase w-1/5">Amount</th>
                    <th className="px-3 py-2 text-xs font-medium text-gray-700 uppercase w-1/10">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {credits.map((entry, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 whitespace-nowrap">{getLedgerName(entry.ledger)}</td>
                      <td className="px-3 py-2">{entry.particular}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-right font-mono">{entry.amount.toFixed(2)}</td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveEntry(index, 'credit')}
                          className="text-red-500 hover:text-red-700 focus:outline-none"
                          aria-label="Remove credit item"
                        >
                          <i className="fa-solid fa-trash text-sm" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {credits.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-3 py-4 text-center text-gray-500 italic">
                        No Credit entries added yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </form>

      {/* Submission Button */}
      <div className="w-full text-center mb-5">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`
            text-white p-3 text-lg font-semibold rounded-lg shadow-md transition duration-300 ease-in-out
            ${canSubmit
              ? 'bg-cyan-600 hover:bg-cyan-700 cursor-pointer'
              : 'bg-gray-400 cursor-not-allowed'
            }
          `}
        >
          Post Journal Voucher
        </button>
        {!isBalanced && (
          <p className="text-red-600 text-sm mt-1 font-medium">
            **Debit (₹{totalDebit.toFixed(2)}) and Credit (₹{totalCredit.toFixed(2)}) totals must match to submit.**
          </p>
        )}
        {isBalanced && (debits.length === 0 || credits.length === 0) && (
            <p className="text-red-600 text-sm mt-1 font-medium">
              **Must have at least one Debit and one Credit entry to submit.**
            </p>
        )}
      </div>
    </div>
  );
};

export default JournalVoucher;

// --- Custom Input Group Component for cleaner form code ---
const InputGroup = ({ icon: Icon, label, id, type, value, onChange, size, ...props }) => (
    <div>
        <label htmlFor={id} className={`block ${size === 'sm' ? 'text-xs' : 'text-sm'} font-medium text-gray-700 mb-1 flex items-center`}>
            {Icon && <Icon className="w-4 h-4 mr-1 text-gray-500" />}
            {label}
        </label>
        <input
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            className={`w-full ${size === 'sm' ? 'p-2 text-sm' : 'p-3'} border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150`}
            {...props}
        />
    </div>
);