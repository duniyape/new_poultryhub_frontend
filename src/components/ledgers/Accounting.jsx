import React, { useState, useEffect } from "react";
import { 
  Layers, 
  BookOpen, 
  Users as UsersIcon, 
  Home as HomeIcon,
  ArrowLeft,
  Receipt,
  Eye
} from "lucide-react";
import View_ledgers from "./View_ledgers";
import Create_group from "./Create_group";
import Create_ledgers from "./Create_ledgers";
import Subgroup from "./Subgroup";
import { useNavigate } from "react-router-dom";
import Vouchers from "./Vouchers";
import Generalvoucher from "./Generalvoucher"

const  AccountingPage = ({ initialTab = "vouchers" }) => {
  const navigate=useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState("");

  const tabs = [
    { id: "vouchers", label: "Vouchers", icon: <Receipt size={16} /> },
    { id: "view_ledgers", label: "View Ledgers", icon: <Eye size={16} /> },
    { id: "ledgers", label: "Ledgers", icon: <BookOpen size={16} /> },
    { id: "groups", label: "Groups", icon: <Layers size={16} /> },
    { id: "subgroups", label: "Subgroups", icon: <Layers size={16} className="opacity-70" /> },
    { id: "jounral_voucher", label: "Jounral Voucher", icon: <Layers size={16} className="opacity-70" /> },
  ];

  const mockData = {
    groups: [
      { id: "G1", name: "Sundry Debtors", count: 12, balance: "₹4,50,000" },
      { id: "G2", name: "Sundry Creditors", count: 8, balance: "₹2,10,000" },
    ],
    subgroups: [
      { id: "SG1", parent: "Sundry Debtors", name: "Local Retailers", balance: "₹1,20,000" },
      { id: "SG2", parent: "Sundry Debtors", name: "Interstate Wholesalers", balance: "₹3,30,000" },
    ],
    ledgers: [
      { id: "L1", name: "HDFC Bank", group: "Bank Accounts", balance: "₹8,20,000", type: "Debit" },
      { id: "L2", name: "Amul Feeds Ltd", group: "Sundry Creditors", balance: "₹45,000", type: "Credit" },
    ],
    vouchers: [
      { id: "V001", date: "2023-10-01", type: "Payment", amount: "₹12,000", party: "Amul Feeds" },
      { id: "V002", date: "2023-10-02", type: "Receipt", amount: "₹45,000", party: "Green Grocers" },
    ]
  };

  return (
    <div className="max-w-6xl mx-auto p-2 py-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <button 
            onClick={()=>navigate('/')}
            className="flex items-center text-orange-600 hover:text-orange-700 font-medium transition-colors"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Dashboard
          </button>
      </div>

      {/* Responsive Underline Tabs */}
      <div className="border-b border-gray-200 mb-6 overflow-x-auto scrollbar-hide">
        <div className="flex space-x-8 min-w-max px-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 text-xs font-bold transition-all relative whitespace-nowrap ${
                activeTab === tab.id 
                ? "text-orange-600" 
                : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>



      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {activeTab === "ledgers" && <Create_ledgers/>}
        {activeTab === "groups" && <Create_group/>}
        {activeTab === "subgroups" && <Subgroup/>}
        {activeTab === "vouchers" && <Vouchers/> }
        {activeTab === "view_ledgers" && <View_ledgers/>}
        {activeTab === "jounral_voucher" && <Generalvoucher/>}
      </div>
    </div>
  );
};

export default AccountingPage;
