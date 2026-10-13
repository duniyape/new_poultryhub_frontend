import React, { useEffect, useState } from 'react';
import { get, push, ref, remove, runTransaction, set } from 'firebase/database';
import { db } from '../../firebase/Database';
import { useUser } from '../../context/UserContext';
import Swal from 'sweetalert2';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { User } from 'lucide-react';
import Customer_payment from './Customer_payment';
import useApi from '../../api/useApi';

// Helper function to format timestamp or date safely
const formatDate = (val) => {
    if (!val) return 'N/A';
    const num = Number(val);
    if (!isNaN(num) && num > 0) {
        // Unix timestamp in seconds (10 digits) vs milliseconds (13 digits)
        const d = num < 1e11 ? new Date(num * 1000) : new Date(num);
        return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString();
};


// --- Sample Data Structure for Demonstration ---
const SAMPLE_CUSTOMER_DATA = {
    address: "Dhupa samsan",
    balance: 16410,
    contact: "9131037870",
    createdAt: "2025-09-10T07:37:23.348Z",
    createdBy: "Ix3j8Tsm0HeDpFxB3ot3HYwUFcF3",
    gstin: "No",
    id: "CUST1008",
    location: {lat: 23.2109655, lng: 77.3594763},
    owner: "Rahul",
    remark: "Agli bar ka bolq",
    shop: "Rahul kirana Store",
    state: "Madhya Pradesh",
    type: "Retailer",
    visit: "2025-09-22", // Next visit date
};



// Helper function to format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
    }).format(amount);
};

const DetailItem = ({ label, value, textColor = 'text-gray-300', showClearButton = false, onClear }) => (
  <div className="py-2">
    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</dt>
    <dd className={`mt-0.5 text-base font-semibold flex items-center gap-2 ${textColor}`}>
      <span>{value}</span>
      {showClearButton && (
        <button
          onClick={onClear}
          className="ml-2 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-2 py-0.5 rounded-md shadow-sm transition-all duration-200"
        >
          Clear
        </button>
      )}
    </dd>
  </div>
);


// --- UPDATED CustomerDetails Component ---
const CustomerDetails = ({ customerId, data, role,user ,reload }) => {
    const isHighBalance = data.balance > 15000;
    const navigate = useNavigate();

    const handleClearOutstanding = (currentBalance) => {
    Swal.fire({
        title: 'Clear Outstanding Balance',
        text: `Are you sure you want to clear the outstanding balance of ${formatCurrency(currentBalance)}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Clear it!',
        cancelButtonText: 'No, Keep it'
    }).then(async(result) => {
        if (result.isConfirmed) {
             const ledgerRef = push(ref(db, "ledgers"));
            const ledgerData = {
                        id: ledgerRef.key,
                        date: new Date().toISOString(),
                        dr: [{ ledger: "A24", particular: `Discount to - ${customerId}`, amt: currentBalance }],
                        cr: [
                            { ledger: "A3", particular: `Discount to - ${customerId}`, amt: currentBalance}
                        ],
                        customer_id: customerId,
                        total_amount: currentBalance,
                        createdby: user,
                    };
                    try {
                        await set(ledgerRef, ledgerData);
                        await runTransaction(ref(db, `customers/${customerId}/balance`), (current) => (current || 0) - currentBalance);
                    } catch (error) {
                        console.error("Error clearing outstanding balance:", error);   
                        return; 
                    }
            Swal.fire({
                title: "Success!",
                text: "Outstanding balance has been cleared.",
                icon: "success",
                timer: 1000,
                showConfirmButton: false
            });
            reload();
        }   
    });
}
       
    // Ensure data.location exists and has lat/lng
    const locationData = data.location && data.location.lat && data.location.lng ? data.location : null;
    
    return (
        <div className="p-4 sm:p-5 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
            <h3 
                // Navigation/Edit is responsive based on role and screen click
                onClick={() => role === "admin" ? navigate(`/edit/${customerId}`) : undefined} 
                className={`text-xl font-bold text-teal-400 border-b border-gray-700 pb-2 mb-4 ${role === "admin" ? 'cursor-pointer hover:text-teal-300 transition' : ''}`}
            >
                {data.shop || 'Customer Information'}
            </h3>

            {/* General Information Grid */}
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-8 gap-y-2 mb-4 sm:mb-6 border-b border-gray-700 pb-4">
                <DetailItem label="Customer ID" value={data.id || customerId} textColor="text-white" />
                <DetailItem label="Shop Owner" value={data.owner || 'N/A'} />
                <DetailItem label="Contact Number" value={data.contact || 'N/A'} />
                <DetailItem label="Account Type" value={data.type || 'N/A'} />
                <DetailItem label="State" value={data.state || 'N/A'} />
                <DetailItem 
                    label="GST Status" 
                    value={data.gstin === 'Yes' ? 'Registered' : 'Non-GST'} 
                    textColor={data.gstin === 'Yes' ? 'text-green-400' : 'text-yellow-400'}
                />
            </dl>
            
            {/* Financial and Scheduling Grid */}
            {/* <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-8 gap-y-2 mb-4 sm:mb-6">
                <DetailItem 
                    label="Outstanding Balance" 
                    value={formatCurrency(data.balance || 0)} 
                    textColor={isHighBalance ? 'text-red-400' : 'text-green-400'}
                />
                <DetailItem 
                    label="Last Visit" 
                    value={data.visit ? new Date(data.visit).toDateString() : 'Not Visited Yet'}
                    textColor={data.visit ? 'text-teal-400' : 'text-red-400'}
                />
            </dl> */}
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-8 gap-y-2 mb-4 sm:mb-6">
            <DetailItem 
                label="Outstanding Balance" 
                value={formatCurrency(data.balance || 0)} 
                textColor={isHighBalance ? 'text-red-400' : 'text-green-400'}
                showClearButton={role==='admin'&&Number(data.balance) > 0}
                onClear={() => handleClearOutstanding(data.balance)} // 🔹 custom handler
            />

            <DetailItem 
                label="Last Visit" 
                value={data.visit ? formatDate(data.visit) : 'Not Visited Yet'}
                textColor={data.visit ? 'text-teal-400' : 'text-gray-400'}
            />
            </dl>

            
            {/* Address, Remark, and Location Link */}
            <div className="border-t border-gray-700 pt-4">
                <DetailItem label="Full Address" value={data.address || 'N/A'} textColor="text-white" />
                
                {/* Location Link Integration */}
                {locationData && (
                    <div className="mt-2">
                        <a
                            // Corrected Google Maps URL format
                            href={`https://www.google.com/maps/search/?api=1&query=${locationData.lat},${locationData.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm font-medium text-blue-400 hover:text-blue-300 transition"
                        >
                            🗺️ **View Location on Map**
                        </a>
                    </div>
                )}
                
                <div className="mt-4 p-3 bg-gray-700 rounded-md">
                    <DetailItem 
                        label="Latest Remark" 
                        value={data.remark || 'No recent remarks.'} 
                        textColor="text-white"
                    />
                </div>
                <p className="text-xs text-gray-500 mt-3">
                    Created by {data.createdBy} on {formatDate(data.createdAt)}.
                </p>
            </div>
        </div>
    );
};

// --- MAIN Component: CustomerProfilePage (Top-Tab Layout) ---
const CustomerProfilePage = ({ user: propUser, name: propName, role: propRole }) => {
    const { customerId } = useParams();
    const navigate = useNavigate();
    const { user: authUser } = useUser() || {};
    const user = propUser || authUser?.name || authUser?.number || authUser?.id || "Admin";
    const name = propName || authUser?.name || "Admin";
    const role = propRole || authUser?.role || "admin";

    const [activeTab, setActiveTab] = useState('Details');
    const [customerData, setCustomerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { getData } = useApi();
      
    const fetchcustomer = async () => {
        if (!customerId) return;
        setLoading(true);
        try {
            const cid = customerId.trim();
            let res = await getData('/get_vendor/' + cid);
            if (!res && cid) {
                res = await getData('/get_vendor/' + cid.toLowerCase());
            }
            console.log("Customer response:", res);
            if (res && typeof res === 'object') {
                const fullAddress = [res.address, res.city].filter(Boolean).join(", ");
                setCustomerData({
                    address: fullAddress || "Not Provided",
                    balance: res.balance !== undefined && res.balance !== null ? Number(res.balance) : 0,
                    contact: res.number || res.fromNumber || "N/A",
                    createdAt: res.timestamp,
                    createdBy: res.fromNumber || "Admin",
                    gstin: res.gst && res.gst.trim() ? res.gst : "No",
                    id: res.vendor_id || customerId,
                    owner: res.business_name || res.owner || "N/A",
                    shop: res.name || res.shop || "N/A",
                    state: res.state || "Not Specified",
                    city: res.city || "",
                    type: res.v_type || "Customer",
                    location: res.location || null,
                    remark: res.remark || "",
                    visit: res.visit || null,
                });
            } else {
                setCustomerData(null);
            }
        } catch (err) {
            console.error("Error fetching customer:", err);
            setCustomerData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchcustomer();
    }, [customerId]);

    const navItems = [
        { name: 'Details', icon: '👤' },
        { name: 'Transaction', icon: '💰' },
    ];

    const renderContent = () => {
        if (loading) {
            return (
                <div className="p-12 text-center text-gray-300 bg-gray-800 rounded-lg flex flex-col items-center justify-center gap-3">
                    <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading customer details...</span>
                </div>
            );
        }

        if (!customerData) {
            return (
                <div className="p-8 text-center bg-gray-800 rounded-lg border border-red-800/40">
                    <p className="text-red-400 font-semibold text-lg mb-2">Customer data not found.</p>
                    <p className="text-gray-400 text-sm mb-4">No record found for ID: <span className="font-mono text-teal-400">{customerId}</span></p>
                    <button 
                        onClick={() => fetchcustomer()} 
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded text-sm transition"
                    >
                        Retry
                    </button>
                </div>
            );
        }

        switch (activeTab) {
            case 'Details':
                return <CustomerDetails customerId={customerId} data={customerData} role={role} user={user} reload={fetchcustomer} />;
            case 'Transaction':
                return <Customer_payment user={user} data={customerData} customerId={customerId} name={name} reload={fetchcustomer} />;
            default:
                return <div className="p-5 text-center text-gray-400 bg-gray-800 rounded-lg">Content for **"{activeTab}"** is not yet implemented.</div>;
        }
    };

    const buttonBaseStyle = "py-3 px-4 text-sm font-medium transition duration-200 flex-shrink-0 border-b-2 cursor-pointer";
    const activeButtonStyle = "border-teal-500 text-teal-400 font-bold bg-gray-700/50";
    const inactiveButtonStyle = "border-transparent text-gray-400 hover:text-white hover:border-gray-600";

    return (
        <>
            <Link to={-1}>
                <div style={{
                    background: '#249CA2',
                    height: 50,
                    display: 'flex',
                    alignItems: 'center',
                    color: 'white',
                    gap: 10,
                }}>
                    <i style={{ paddingLeft: 20 }} className="fa-solid fa-arrow-left"></i>
                    <label style={{ fontWeight: 700, fontSize: 12, color: 'white', cursor: 'pointer' }}>Back</label>
                </div>
            </Link>

            <div className="p-0 sm:p-4 bg-gray-900 min-h-screen">
                {/* --- Sticky Header & Navigation Bar --- */}
                <header className="bg-gray-800 border-b border-gray-700 shadow-lg sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h1 className="text-xl font-bold text-white flex items-center gap-2">
                                <span>{customerData?.shop || 'Customer Profile'}</span>
                                {customerData?.type && (
                                    <span className="text-xs px-2 py-0.5 rounded bg-teal-900/60 text-teal-300 border border-teal-700 font-normal">
                                        {customerData.type}
                                    </span>
                                )}
                            </h1>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Customer ID: <span className="font-mono font-semibold text-teal-400">{customerId}</span>
                                {customerData?.owner && ` • Owner: ${customerData.owner}`}
                                {customerData?.contact && ` • Phone: ${customerData.contact}`}
                            </p>
                        </div>

                        {customerData && (
                            <div className="text-right">
                                <span className="text-xs text-gray-400 block uppercase tracking-wider font-semibold">Outstanding Balance</span>
                                <span className={`text-base font-bold ${Number(customerData.balance) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                    {formatCurrency(customerData.balance || 0)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Horizontal Navigation */}
                    <nav className="border-t border-gray-700 bg-gray-800 overflow-x-auto whitespace-nowrap">
                        <div className="flex max-w-7xl mx-auto px-4">
                            {navItems.map((item) => (
                                <button
                                    key={item.name}
                                    onClick={() => setActiveTab(item.name)}
                                    className={`${buttonBaseStyle} ${activeTab === item.name ? activeButtonStyle : inactiveButtonStyle} flex items-center gap-2`}
                                >
                                    <span className="text-base">{item.icon}</span> 
                                    {item.name}
                                </button>
                            ))}
                        </div>
                    </nav>
                </header>

                {/* --- Main Content Area --- */}
                <div className="max-w-7xl mx-auto pb-6">
                    <main className="p-0 md:p-4">
                        {renderContent()}
                    </main>
                </div>
            </div>
        </>
    );
};

export default CustomerProfilePage;