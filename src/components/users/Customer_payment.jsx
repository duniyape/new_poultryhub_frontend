import React, { useState, useEffect } from "react";
import { ref, get, push, set, update, getDatabase, query, orderByChild, equalTo } from "firebase/database";
import moment from "moment";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
// Assuming Denomination is in a reachable path
// import Denomination from "./Denomination"; 
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { useRef } from "react";
import { useLoader } from "../../context/LoaderContext";
const phoneNumberId = 670517682822062
const accessToken = 'EAA6rtuUkSgIBOw1ZBKc0daGfX8SSbt86QetCckUtCodtMy2ZA44d9e0nrEUhZAsxaroHpX1217ROdLpkDRD1RwKa0VWMzgy5eMfIBv4WN1CYhXnAfXx7psCzgZB2xJkEZABscWDYYsKRwBHXMnfBdT905ZCLklGOnXS8tCaqsDGpoK7s5XlkOxgh4udFz67qw5aQZDZD'


// NOTE: WhatsApp API keys are omitted for security
const database = getDatabase();

const Customer_payment = ({ data, customerId: propCustomerId, reload }) => {
    // Determine IDs: propCustomerId for dashboard, useParams for standalone
    const { id: paramId } = useParams();
    const customerId = propCustomerId || paramId;

    // State management
    const [customerData, setCustomerData] = useState(data || null);
    const [loading, setLoading] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const { showLoader, hideLoader } = useLoader();
    const tableRef = useRef(null);
    const [formData, setFormData] = useState({
        amount: '',
        mode: '',
        reference: '',
        Cq_date: moment().format('YYYY-MM-DD'),
    });

    useEffect(() => {
        if (data && Object.keys(data).length > 0) {
            setCustomerData(data);
        }
    }, [data]);

    const cType = customerData?.type || data?.type || "Customer";
    const ledgerCode = cType === "Customer" ? "A7" : "A6";

    // --- Data Fetching Logic (Retained from original) ---


    const calculateLedgerWithDateRangeAndCustomer = async (ledgerId, cId = customerId) => {
        console.log(ledgerId)
        if (!cId) return;
        showLoader();
        try {
            const ledgerRef = query(ref(database, "ledger"), orderByChild("vendor_id"), equalTo(cId));
            const snapshot = await get(ledgerRef);
            if (!snapshot.exists()) return null;

            const entries = Object.values(snapshot.val());
            const startDate = new Date('2025-05-01');
            const endDate = new Date();

            let opening_balance = 0;
            let running_balance = 0;
            let currentTransactions = [];
            let table_rows = [];

            for (let entry of entries) {
                if (entry.vendor_id !== cId) continue;

                let entryDate = entry.date ? new Date(entry.date) : null;
                if (!entryDate) continue;

                // DR (debit: sale/expense)
                for (let dr of entry?.dr || []) {
                    if (dr.ledger === ledgerId) {
                        let amt = parseFloat(dr.amt || 0);
                        if (entryDate < startDate) {
                            opening_balance += amt;
                        } else if (entryDate >= startDate && entryDate <= endDate) {
                            currentTransactions.push({
                                date: entryDate, particular: dr.particular || "other", dr_amt: amt, cr_amt: 0,
                            });
                        }
                    }
                }

                // CR (credit: payment/advance)
                for (let cr of entry?.cr || []) {
                    if (cr.ledger === ledgerId) {
                        let amt = parseFloat(cr.amt || 0);
                        if (entryDate < startDate) {
                            opening_balance -= amt;
                        } else if (entryDate >= startDate && entryDate <= endDate) {
                            currentTransactions.push({
                                date: entryDate, particular: cr.particular || "other", dr_amt: 0, cr_amt: amt,
                            });
                        }
                    }
                }
            }

            currentTransactions.sort((a, b) => a.date - b.date);

            table_rows.push({
                date: moment(startDate).format("YYYY-MM-DD"),
                particular: "Opening Balance",
                dr_amt: opening_balance > 0 ? opening_balance.toFixed(2) : 0,
                cr_amt: opening_balance < 0 ? Math.abs(opening_balance).toFixed(2) : 0,
                balance: opening_balance,
                isBalance: true
            });

            running_balance = opening_balance;
            for (let tx of currentTransactions) {
                if (tx.dr_amt === 0 && tx.cr_amt === 0) continue;
                running_balance += tx.dr_amt;
                running_balance -= tx.cr_amt;

                table_rows.push({
                    date: moment(tx.date).format("YYYY-MM-DD"),
                    particular: tx.particular,
                    dr_amt: tx.dr_amt.toFixed(2),
                    cr_amt: tx.cr_amt.toFixed(2),
                    balance: running_balance,
                });
            }
            setTransactions(table_rows);
            console.log(table_rows);

        } catch (error) {
            console.error("Ledger calculation failed:", error);
            setTransactions([]);
        } finally {
            hideLoader();
        }
    };

    // const handlePdfDownload = () => {
    //     if (!transactions || transactions.length === 0) return;
    //     const doc = new jsPDF();
    //     autoTable(doc, {
    //         head: [['S No', 'Date', 'Particular', 'Debit (Dr)', 'Credit (Cr)', 'Balance']],
    //         body: transactions.map((item, idx) => [
    //             idx + 1,
    //             item.date,
    //             item.particular,
    //             item.dr_amt,
    //             item.cr_amt,
    //             item.balance,
    //         ]),
    //     });
    //     doc.save(`ledger_${customerId}.pdf`);
    // };



const handlePdfDownload = () => {
    if (!transactions || transactions.length === 0) {
        Swal.fire("No Data", "No ledger transactions found.", "warning");
        return;
    }

    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();

    // Company / Report Heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("CUSTOMER LEDGER", pageWidth / 2, 18, {
        align: "center",
    });

    // Header divider
    doc.setDrawColor(0, 128, 128);
    doc.setLineWidth(0.6);
    doc.line(14, 23, pageWidth - 14, 23);

    // Customer Details Heading
    doc.setFontSize(12);
    doc.setTextColor(0, 100, 100);
    doc.text("Customer Details", 14, 32);

    // Customer Details
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    const leftX = 14;
    const rightX = pageWidth / 2 + 5;

    console.log("Customer Data for PDF:", customerData);

    const leftDetails = [
        `Shop Name: ${customerData?.shop || "-"}`,
        `Owner Name: ${customerData?.owner || "-"}`,
        // `Customer ID: ${customerId || "-"}`,
        `GST No: ${customerData?.gstin || "-"}`,
    ];

    const rightDetails = [
        `Contact: ${customerData?.contact || "-"}`,
        `Account Type: ${cType || "-"}`,
        `Report Date: ${moment().format("DD-MM-YYYY")}`,
    ];

    leftDetails.forEach((text, index) => {
        doc.text(text, leftX, 41 + index * 7);
    });

    rightDetails.forEach((text, index) => {
        doc.text(text, rightX, 41 + index * 7);
    });

    // Balance Summary
    const balance = Number(customerData?.balance || 0);

    doc.setFillColor(240, 248, 255);
    doc.roundedRect(14, 64, pageWidth - 28, 14, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);

    const balanceText =
        balance > 0
            ? `Due: Rs. ${balance.toFixed(2)}`
            : balance < 0
            ? `Advance: Rs. ${Math.abs(balance).toFixed(2)}`
            : "Balance: Rs. 0.00";

    doc.text(balanceText, 18, 73);

    // Transaction Ledger Table
    autoTable(doc, {
        startY: 85,
        head: [[
            "S No",
            "Date",
            "Particular",
            "Debit (Dr)",
            "Credit (Cr)",
            "Balance",
        ]],

        body: transactions.map((item, idx) => [
            item.isBalance ? "OB" : idx,
            item.date
                ? moment(item.date).format("DD-MM-YYYY")
                : "-",
            item.particular || "-",
            Number(item.dr_amt || 0).toFixed(2),
            Number(item.cr_amt || 0).toFixed(2),
            `${Math.abs(Number(item.balance || 0)).toFixed(2)} ${
                Number(item.balance || 0) > 0
                    ? "Dr"
                    : Number(item.balance || 0) < 0
                    ? "Cr"
                    : ""
            }`,
        ]),

        theme: "grid",

        headStyles: {
            fillColor: [0, 100, 100],
            textColor: 255,
            fontStyle: "bold",
            halign: "center",
        },

        styles: {
            fontSize: 8,
            cellPadding: 3,
            overflow: "linebreak",
        },

        columnStyles: {
            0: { cellWidth: 13 },
            1: { cellWidth: 25 },
            2: { cellWidth: "auto" },
            3: { halign: "right" },
            4: { halign: "right" },
            5: { halign: "right" },
        },

        margin: {
            left: 14,
            right: 14,
            bottom: 18,
        },

        didDrawPage: () => {
            const pageHeight = doc.internal.pageSize.getHeight();

            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 100, 100);

            doc.text(
                `Customer: ${customerData?.shop || customerId}`,
                14,
                pageHeight - 8
            );

            doc.text(
                `Page ${doc.internal.getCurrentPageInfo().pageNumber}`,
                pageWidth - 14,
                pageHeight - 8,
                { align: "right" }
            );
        },
    });

    // Download PDF
    doc.save(
        `ledger_${customerData?.shop || customerId}_${moment().format("YYYYMMDD")}.pdf`
    );
};


    useEffect(() => {
        if (customerId) {
            calculateLedgerWithDateRangeAndCustomer(ledgerCode, customerId);
        }
    }, [customerId, ledgerCode]);

    // --- Logic Handlers (Retained from original) ---

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const sendInvoice = async () => {
        const number = customerData.contact || null
        const bal = customerData.balance * 1 - formData.amount * 1
        // console.log(bal<0?0:bal,formData.amount,customerData.balance<0?0:customerData.balance)
        if (!number) return
        showLoader();
        try {
            let messagePayload = {};
            // If mediaUrl is provided, send image message  
            if (formData.mode === "CHEQUE") {
                messagePayload = {
                    messaging_product: "whatsapp",
                    to: `91${number}`,
                    type: "template",
                    template: {
                        name: "cheque_payment", // Your approved template name
                        language: {
                            code: "hi"
                        },
                        components: [
                            {
                                type: "body",
                                parameters: [
                                    {
                                        type: "text",
                                        text: customerData.balance < 0 ? 0 : customerData.balance
                                    },
                                    {
                                        type: "text",
                                        text: formData.amount // parameter 1
                                    },
                                    {
                                        type: "text",
                                        text: bal < 0 ? 0 : bal // parameter 1
                                    },
                                    {
                                        type: "text",
                                        text: formData.reference || '' // parameter 1
                                    },
                                    {
                                        type: "text",
                                        text: new Date(formData.Cq_date).toLocaleDateString("en-GB") || '' // parameter 1
                                    },
                                    {
                                        type: "text",
                                        text: name // parameter 1
                                    },
                                ]
                            },

                        ]
                    }
                };
            } else {
                messagePayload = {
                    messaging_product: "whatsapp",
                    to: `91${number}`,
                    type: "template",
                    template: {
                        name: "cash_payment", // Your approved template name
                        language: {
                            code: "hi"
                        },
                        components: [
                            {
                                type: "body",
                                parameters: [
                                    {
                                        type: "text",
                                        text: customerData.balance < 0 ? 0 : customerData.balance
                                    },
                                    {
                                        type: "text",
                                        text: formData.amount // parameter 1
                                    },
                                    {
                                        type: "text",
                                        text: bal < 0 ? 0 : bal // parameter 1
                                    },
                                    {
                                        type: "text",
                                        text: formData.mode // parameter 1
                                    },
                                    {
                                        type: "text",
                                        text: name // parameter 1
                                    },
                                ]
                            },

                        ]
                    }
                };
            }
            await axios.post(
                `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
                messagePayload,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log(`Message sent to ${number}`);
        } catch (error) {
            console.error(`Failed to send message to ${number}:`, error.response?.data || error.message);
        } finally {
            hideLoader();
            return
        }
    };

    const sendmsg = async (invoiceNo,amount,date,dt,mobile) => {
  console.log("Sending WhatsApp message with data:", data);
  try {
    const PHONE_NUMBER_ID = "1392613863933350";
    const ACCESS_TOKEN = "EACH6PXeLx50BS6iTmAByAVJYsYAsdBJ4wWvemuVxEZBq3YJ2XsWAiROaIb9SOyUJEBwutJNlRq4U2HWZCRQjU0YtfIGQjZBETfOEWaokipFQGWBDJj6vT8a9cyZA639Bl0Xtf8KN7nRt3EdY7rxqZC1zMZC5doVmbqIN4NjCCf1drKAvo4wJMWzPzNPZBqNBkUH3QZDZD";

    const url = `https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`;

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: "91"+mobile, // Recipient mobile number
      type: "template",
      template: {
        name: "receipt_invoice", // Approved Utility template
        language: {
          code: "en"
        },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: invoiceNo || "Customer"
              },
              {
                type: "text",
                text: amount || "0.00"
              },
              {
                type: "text",
                text:  parseFloat(dt)>0? "Debit":"Credit" 
              },
              {
                type: "text",
                text: parseFloat(dt)>0?dt:parseFloat(dt)*-1 || "Debit"
              }
            ]
          }
        ]
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(JSON.stringify(result));
    }

    console.log("Message sent successfully:", result);
    return result;

  } catch (error) {
    console.log("WhatsApp message error:", error.message);
    return { success: false, error: error.message };
  }
};

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!customerData || !formData.amount || parseFloat(formData.amount) <= 0) return;
        const paymentAmount = parseFloat(formData.amount);
        setLoading(true);
        showLoader();

        const ledgerRef = push(ref(database, "ledger"));
        const currentBalance = parseFloat(customerData.balance || 0);
        const voucher_mode = formData.mode === "CASH" ? "cash" : 'bank'
        let dr = [];
        let cr = [];
        const ledgerData = {
            id: ledgerRef.key,
            mode: formData.mode,
            reference: formData.reference,
            date: new Date().toISOString(),
            cr,
            dr,
            vendor_id: customerId,
            total_amount: paymentAmount,
            voucher_type: cType === "Customer" ? 'receipt' : 'payment',
            voucher_mode,
        };
        if (cType === "Customer") {
            ledgerData['narration'] = `Payment Received from ${customerId}`
            ledgerData['cr'] = [{ ledger: ledgerCode, particular: `Payment Received`, amt: paymentAmount }]
            ledgerData['dr'] = [{ ledger: formData.mode === "CASH" ? 'A1' : formData.mode === "SMART" ? 'A8' : 'A2', particular: `Payment Received-${customerId}`, amt: paymentAmount }]
        } else {
            ledgerData['narration'] = `Payment Made to ${customerId}`
            ledgerData['dr'] = [{ ledger: ledgerCode, particular: `Payment Made`, amt: paymentAmount }]
            ledgerData['cr'] = [{ ledger: formData.mode === "CASH" ? 'A1' : formData.mode === "SMART" ? 'A8' : 'A2', particular: `Payment Made-${customerId}`, amt: paymentAmount }]
        }

        console.log(ledgerData)

        try {
            await set(ledgerRef, ledgerData);
            const updatedBalance = currentBalance - paymentAmount;
            await update(ref(database, `vendor/${customerId}`), { balance: updatedBalance });
            sendmsg(paymentAmount,new Date().toLocaleDateString("en-GB"),"Debit",updatedBalance,customerData.contact)
            // await sendInvoice(); 
            Swal.fire({
                title: "Successful!",
                text: "✅ Payment recorded and balance updated.",
                icon: "success",
                timer: 1000,
                showConfirmButton: false
            });
            // handleSearch(customerId);
            setCustomerData(prev => prev ? { ...prev, balance: updatedBalance } : prev);
            setFormData(prev => ({ ...prev, amount: '', reference: '' }));
            // setTotals({ totalNotes: 0, totalAmount: 0 });

            calculateLedgerWithDateRangeAndCustomer(ledgerCode, customerId);
            reload()
        } catch (err) {
            console.error('Payment submission failed:', err);
            Swal.fire({
                title: "Error!",
                text: "❌ Failed to record payment. See console for details.",
                icon: "error"
            });
        } finally {
            setLoading(false);
            hideLoader();
        }
    };


    // --- UI Rendering ---

    if (!customerId) {
        return <div className="p-4 sm:p-8 text-center text-red-500">Error: Customer ID not provided.</div>;
    }

    const hasDue = customerData?.balance > 0;
    const hasAdvance = customerData?.balance < 0;
    const dueAmount = hasDue ? Math.abs(customerData.balance).toFixed(2) : '0.00';
    const advanceAmount = hasAdvance ? Math.abs(customerData.balance).toFixed(2) : '0.00';

    const [show, setshow] = useState(false)
    // if(show) return <CustomerTransaction data={customerData} transactions={transactions} back={()=>setshow(false)}/>

    return (
        // Adjusting outer padding: p-2 on mobile, p-4 on small, p-6 on medium+
        <div className="max-w-4xl mx-auto p-2 sm:p-4 md:p-6 bg-gray-50 min-h-screen">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-2xl border border-gray-200">
                <h2 className="text-xl sm:text-3xl font-bold text-center text-teal-700 mb-4 sm:mb-6 border-b pb-2 sm:pb-4">
                    💰{cType} {cType === "Customer" ? "Receipt" : "Payment"}
                </h2>

                {/* Customer Details Summary */}
                {customerData && (
                    <div className="mb-6 p-3 sm:p-5 border border-blue-200 bg-blue-50 rounded-lg shadow-md">
                        <h3 className="text-lg sm:text-xl font-semibold text-blue-800 mb-2">👤 {customerData.shop}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                            <p><strong>Owner:</strong> {customerData.owner}</p>
                            <p><strong>Contact:</strong> {customerData.contact}</p>
                            <p>
                                <strong>Net Balance: </strong>
                                <span className={`font-bold ${customerData.balance > 0 ? 'text-red-600' : (customerData.balance < 0 ? 'text-green-600' : 'text-gray-600')}`}>
                                    ₹{Math.abs(customerData.balance || 0).toFixed(2)} {customerData.balance > 0 ? 'Due' : (customerData.balance < 0 ? 'Advance' : '')}
                                </span>
                            </p>
                        </div>
                    </div>
                )}

                {/* Payment Form */}
                {customerData && (
                    <form onSubmit={handleSubmit} className="mb-8 p-3 sm:p-5 border border-gray-300 rounded-lg shadow-inner bg-gray-50">
                        <h3 className="text-lg sm:text-xl font-bold text-teal-700 mb-3 border-b pb-2">Record New {cType === "Customer" ? "Receipt" : "Payment"}</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">


                            {/* Form Fields (Mode, Amount, Reference, Date) */}
                            {/* ... all form fields remain here, no style change needed as p-2.5 input is fine ... */}

                            {/* Payment Mode */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{cType === "Customer" ? "Receipt" : "Payment"} Mode <span className="text-red-500">*</span></label>
                                <select
                                    name="mode"
                                    required
                                    value={formData.mode}
                                    onChange={handleChange}
                                    className="w-full p-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 bg-white"
                                >
                                    <option value="">Select</option>
                                    <option value="CASH">CASH</option>
                                    <option value="BANK">UPI / NEFT</option>
                                    <option value="SMART">HDFC Smart Hub</option>
                                </select>
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (₹) <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    name="amount"
                                    min="0.01"
                                    step="0.01"
                                    value={formData.amount}
                                    required
                                    onChange={handleChange}
                                    className="w-full p-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>

                            {/* Reference / Cheque No */}
                            {formData.mode !== "CASH" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{formData.mode === "CHEQUE" ? 'Cheque No' : "Reference No"} <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="reference"
                                        value={formData.reference}
                                        required
                                        onChange={handleChange}
                                        className="w-full p-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500"
                                    />
                                </div>
                            )}

                            {/* Cheque Date */}
                            {formData.mode === "CHEQUE" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cheque Date <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        name="Cq_date"
                                        value={formData.Cq_date}
                                        required
                                        onChange={handleChange}
                                        className="w-full p-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500"
                                    />
                                </div>
                            )}

                            {/* Denomination (CASH only) */}
                            {/* {formData.mode === "CASH" && (
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cash Denomination Breakdown</label>
                                    <Denomination onTotalChange={setTotals} />
                                    <p className={`mt-2 text-sm font-semibold ${formData.amount === totals.totalAmount ? 'text-green-600' : 'text-red-600'}`}>
                                        Denomination Total: ₹{totals.totalAmount.toFixed(2)} / Payment Amount: ₹{parseFloat(formData.amount || 0).toFixed(2)}
                                    </p>
                                </div>
                            )} */}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`mt-4 sm:mt-6 w-full py-3 text-white font-bold rounded-lg shadow-lg transition duration-150 ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                                }`}
                        >
                            {loading ? "Processing..." : "✅ Submit Payment"}
                        </button>
                    </form>
                )}

                {/* Ledger Table Section */}
                {customerData && (
                    <div className="mt-6 sm:mt-8">
                        <div className="flex items-center justify-between mb-4 border-b border-teal-700 text-teal-700 pb-2">
                            <h3 className="text-lg sm:text-2xl font-bold">
                                Transaction Ledger
                            </h3>

                            <button
                                onClick={handlePdfDownload}
                                className="flex items-center gap-2 bg-teal-700 text-white px-4 py-2 rounded hover:bg-teal-800 transition"
                            >
                                <Download />
                                <span>Download PDF</span>
                            </button>
                        </div>

                        <div ref={tableRef} className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-md">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        {['S No', 'Date', 'Particular', 'Debit (Dr)', 'Credit (Cr)', 'Balance'].map((header) => (
                                            <th key={header} className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 text-xs sm:text-sm">
                                    {transactions.length > 0 ? (
                                        transactions.map((item, index) => (
                                            <tr key={index} className={item.isBalance ? 'bg-blue-50 font-semibold' : 'hover:bg-gray-50'}>
                                                <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">{item.isBalance ? 'OB' : index}</td>
                                                <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">{new Date(item.date).toLocaleDateString('en-GB')}</td>
                                                <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-700">{item.particular}</td>
                                                <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-red-600">{item.dr_amt || 0}</td>
                                                <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-green-600">{item.cr_amt || 0}</td>
                                                <td className={`px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right font-bold ${item.balance >= 0 ? 'text-red-800' : 'text-green-800'}`}>
                                                    {item.balance === 0 ? parseFloat(item.balance).toFixed(2) : item.balance > 0 ? `${parseFloat(item.balance).toFixed(2)} Dr` : `${Math.abs(parseFloat(item.balance)).toFixed(2)} Cr`}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-3 sm:px-6 py-4 text-center text-gray-500">
                                                No ledger entries found for the selected account.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Customer_payment;