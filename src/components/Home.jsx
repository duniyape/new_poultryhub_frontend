import React, { useState } from "react";
import { 
  ClipboardList, 
  Package, 
  Zap, 
  Flame, 
  Layers, 
  BookOpen, 
  UserCircle, 
  Users, 
  UserPlus, 
  FileText,
  ChevronRight,
  Home as HomeIcon,
  Bird,
  LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home = ({user}) => {
  const [currentPage, setCurrentPage] = useState("home");
  const navigate = useNavigate();

  const options = [
    { title: "ADD PRODUCT", icon: <ClipboardList size={20} />, value: "add",role:["admin"] },
    { title: "SALE ORDER", icon: <Zap size={20} />, value: "order/p/Customer",role:["admin","executive"] },
    { title: "PURCAHSE ORDER", icon: <Zap size={20} />, value: "order/p/Vendor",role:["admin"] },
    { title: "ORDERS", icon: <Flame size={20} />, value: "unbilled_orders",role:["admin","executive"] },
    { title: "PRODUCTS", icon: <Package size={20} />, value: "products",role:["admin","executive"] },
    { title: "add User", icon: <Users size={20} />, value: "add_user" ,role:["admin"] },
    { title: "Customer Reciept", icon: <Users size={20} />, value: "users/Customer" ,role:["admin"] },
    { title: "VENDORS Payment", icon: <Users size={20} />, value: "users/Vendor" ,role:["admin"] },
    { title: "INVOICES", icon: <FileText size={20} />, value: "bills" ,role:["admin","executive"] },
    { title: "Accounting", icon: <BookOpen size={20} />, value: "accounting", role:["admin"] },
    { title: "Employee", icon: <BookOpen size={20} />, value: "employee", role:["admin"] },
    { title: "Salary", icon: <BookOpen size={20} />, value: "salary", role:["admin"] },
    { title: "Personal Ledger", icon: <BookOpen size={20} />, value: "employeeledger", role:["admin","executive"] }
  ];

  const renderContent = () => {
    if (currentPage === "home") {
      return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <header className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Poultry Dashboard</h1>
            <p className="text-sm text-gray-500">Manage your flock, orders, and ledgers</p>
          </header>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {options.filter(item => item.role.includes(user?.role)).map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(item.value)}
                className="group flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-transparent hover:border-orange-500 hover:shadow-md transition-all duration-200 active:scale-95"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-orange-50 text-orange-700 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-200 mb-3">
                  {item.icon}
                </div>
                <span className="text-xs font-semibold text-gray-600 group-hover:text-orange-700 text-center uppercase tracking-tighter leading-tight">
                  {item.title}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-linear-to-br from-orange-500 to-amber-600 rounded-2xl text-white shadow-lg">
              <h3 className="text-lg font-bold mb-2">Flock Insights</h3>
              <p className="text-sm opacity-90 mb-4">Monitor production levels and supply chain updates.</p>
              <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
                View Reports
              </button>
            </div>
            <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Network Status</h3>
              <div className="flex items-center text-sm text-orange-600 font-medium">
                <div className="w-2 h-2 rounded-full bg-orange-500 mr-2 animate-pulse" />
                NPH Systems Online
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-8">
        <button 
          onClick={() => setCurrentPage("home")}
          className="flex items-center text-sm font-medium text-orange-600 hover:text-orange-700 mb-6"
        >
          <HomeIcon size={16} className="mr-2" />
          Back to Dashboard
        </button>
        <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
            <ChevronRight size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 uppercase tracking-widest">{currentPage.replace('_', ' ')}</h2>
          <p className="text-gray-500 mt-2">This module for NPH is currently under development.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased text-sm">
      <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-black">
              <Bird size={20} />
            </div>
            <span className="font-bold text-gray-900 tracking-tight">New Poultry Hub</span>
          </div>
          <div onClick={()=>navigate('/login')} className="flex items-center gap-3 text-xs font-bold text-orange-700">
            Logout
            {/* <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300" /> */}
              <LogOut size={20} />

          </div>
        </div>
      </nav>
      
      <main>
        {renderContent()}
      </main>
    </div>
  );
};

export default Home;