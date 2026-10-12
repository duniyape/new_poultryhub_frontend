import React, { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import useApi from '../../api/useApi';
import { X } from 'lucide-react';

const BillingPopup = ({data,onClose}) => {
    const orders = data?.orders || [];
    const user = data?.vendor || {};
  const [items, setItems] = useState([]);
  const { postData } = useApi();
  const [invoiceNo, setInvoiceNo] = useState(''); 
  const [gstmode, setGstMode] = useState(data.gstmode || 'inclusive'); // "inclusive" | "exclusive"
    const onGenerate = (finalItems) => {
        console.log("Generating bill with items:", finalItems, "and Invoice No:", invoiceNo);
    }

  // Aggregate items when orders change
  useEffect(() => {
    if (orders.length > 0) {
      const allItems = orders.flatMap(o => o.items);
      const aggregated = Object.values(
        allItems.reduce((acc, item) => {
          if (!acc[item.id]) {
            acc[item.id] = { ...item, price: item.price || '', quantity: 0, pieces: 0 };
          }
          acc[item.id].quantity += Number(item.quantity || 0);
          acc[item.id].pieces += Number(item.pieces || 0);
          return acc;
        }, {})
      );
      setItems(aggregated);
    } else {
      setItems([]);
    }
  }, [orders]);

  const handlePriceChange = (id, newPrice) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, price: parseFloat(newPrice) || 0 } : item
      )
    );
  };

   const supplyType = data.supplyType||'intra'; // "intra" | "inter"
  
 const {
  slabSummary,
  totalTaxable,
  totalCGST,
  totalSGST,
  totalIGST,
  grandTotal
} = useMemo(() => {
  const slabSummary = {};
  let totalTaxable = 0;
  let totalCGST = 0;
  let totalSGST = 0;
  let totalIGST = 0;

  items.forEach(item => {
    const factor = item.unit === "Kg" ? item.quantity : item.pieces;
    const gstRate = Number(item.gst || 0);

    let taxableValue = 0;

    if (gstmode === "inclusive") {
      taxableValue = (item.price / (1 + gstRate / 100)) * factor;
    } else {
      taxableValue = item.price * factor;
    }

    let cgst = 0, sgst = 0, igst = 0;

    if (gstRate > 0) {
      if (supplyType === "intra") {
        cgst = (taxableValue * gstRate) / 200;
        sgst = (taxableValue * gstRate) / 200;
      } else {
        igst = (taxableValue * gstRate) / 100;
      }
    }

    // slab init
    if (!slabSummary[gstRate]) {
      slabSummary[gstRate] = {
        taxable: 0,
        cgst: 0,
        sgst: 0,
        igst: 0
      };
    }

    slabSummary[gstRate].taxable += taxableValue;
    slabSummary[gstRate].cgst += cgst;
    slabSummary[gstRate].sgst += sgst;
    slabSummary[gstRate].igst += igst;

    totalTaxable += taxableValue;
    totalCGST += cgst;
    totalSGST += sgst;
    totalIGST += igst;
  });

  return {
    slabSummary: Object.keys(slabSummary)
      .sort((a, b) => Number(a) - Number(b))
      .reduce((acc, rate) => {
        acc[rate] = {
          taxable: Number(slabSummary[rate].taxable.toFixed(2)),
          cgst: Number(slabSummary[rate].cgst.toFixed(2)),
          sgst: Number(slabSummary[rate].sgst.toFixed(2)),
          igst: Number(slabSummary[rate].igst.toFixed(2))
        };
        return acc;
      }, {}),
    totalTaxable: Number(totalTaxable.toFixed(2)),
    totalCGST: Number(totalCGST.toFixed(2)),
    totalSGST: Number(totalSGST.toFixed(2)),
    totalIGST: Number(totalIGST.toFixed(2)),
    grandTotal: Number(
      (totalTaxable + totalCGST + totalSGST + totalIGST).toFixed(2)
    )
  };
}, [items, gstmode, supplyType]);

  
  const postdata = async (data) => {
    try {
      const res = await postData("/generate_bill", data)
     if(!res){
      return false
     }else{
      return res
     }
    } catch (error) {
      console.log(error)
    }
  }

 const handleDownload = async (data) => {
     if(user.v_type==="Vendor" && invoiceNo === '') 
    return(
     Swal.fire({
      title: "Error!",
      text: "Please Enter Purhase Bill Invoice No!",
      icon: "error"
    }))
    if (data.find(item => !item.price || item.price <= 0))
      return Swal.fire({
        title: "Error!",
        text: "Please enter valid prices for all items.",
        icon: "error"
      });
     const invoiceid= invoiceNo||`PUR-${Math.floor(100000 + Math.random() * 900000)}`;
      const items = data.map(item => ({
          description: item.name,
          qty: item.quantity||0,
          pieces: item.pieces||0,
          product_id: item.id,
          price: item.price || 0,
          unit: item.unit,
          amount: parseFloat((item.unit==="Kg"?item.quantity:item.pieces)*item.price).toFixed(2)
        }));
        const totalQty = items.reduce((sum, i) => sum + Number(i.qty || 0), 0);

       const invoicedata={
          vendor_id: user.vendor_id,
          invoiceid,
          date: new Date().toLocaleDateString('en-GB'), // Consider making this dynamic if needed
          customer: {
            name: user.name,
            address: user.address,
            state: user.state,
            mobile: user.number,
          },  
          items,
          type: user.v_type=== 'Customer' ? 'sell' : 'purchase',
          previousBalance: 0,
          totalQty,
          pieces: 0,
          current_total: 0,
          gstmode,
          slabSummary,
          totalTaxable,
          totalCGST,
          totalSGST,
          totalIGST,
          grandTotal
        }
    const res=await postdata(invoicedata)
    console.log("Response from bill generation:", res);
    if (!res) return (
     Swal.fire({
      title: "Error!",
      text: "Something Went Wrong!",
      icon: "error"
    })
  )
    // showLoader()
    // const blob = await pdf(<Invoice data={res.data} />).toBlob();
    // const url = URL.createObjectURL(blob);
    // const link = document.createElement('a');
    // link.href = url;
    // link.download = `invoice.pdf`;
    // link.click();
    // URL.revokeObjectURL(url);
    // hideLoader()
    Swal.fire({
      title: "Sucessful!",
      text: "Bill Generated Successfully!",
      icon: "success"
    });
    onClose();
    // setshow(false)
  };

 
  const totalTax = totalCGST + totalSGST + totalIGST;
  return (
  <div className="fixed inset-0 z-100 flex items-center justify-center p-2 bg-black/10 backdrop-blur-xs">
    <div className="bg-white w-full max-w-4xl rounded-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
      
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center bg-gray-50 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Final Bill Summary</h2>
          <p className="text-xs text-gray-500 uppercase tracking-wider">Aggregated Totals</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-gray-500">
          <X className='text-lg'/>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        
        {/* Vendor Controls: Invoice No & GST Type */}
        {user?.v_type === "Vendor" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 z-10 bg-white pb-2">
            <div className="bg-red-50 p-3 py-2  rounded-lg border border-red-100 flex items-center gap-3">
              <label className="text-sm font-bold text-red-700 whitespace-nowrap">Invoice No:</label>
              <input
                required
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                placeholder="Enter Bill Number"
                className="grow p-2 border border-red-200 rounded bg-white outline-none focus:ring-2 focus:ring-red-500 text-sm"
              />
            </div>

            <div className="bg-slate-50 p-3 py-2 rounded-lg border border-slate-200 flex items-center gap-3">
              <label className="text-sm font-bold text-slate-700 whitespace-nowrap">GST Mode:</label>
              <select
                value={gstmode} // "inclusive" or "exclusive"
                onChange={(e) => setGstMode(e.target.value)}
                className="grow p-2 border border-slate-300 rounded bg-white outline-none focus:ring-2 focus:ring-slate-500 text-sm font-medium"
              >
                <option value="inclusive">Inclusive (Price includes GST)</option>
                <option value="exclusive">Exclusive (Price + GST)</option>
              </select>
            </div>
          </div>
        )}

        {/* Items Table */}
        <div className="space-y-2">
          {items.map(item => {
            const qty = item.unit === "Kg" ? item.quantity : item.pieces;
            return (
              <div key={item.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="grow">
                  <p className="font-bold text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500">{qty} {item.unit} Total</p>
                </div>
                <div className="flex items-center gap-2 mr-4">
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">₹</span>
                    <input
                      type="number"
                      value={item.price}
                      onChange={e => handlePriceChange(item.id, e.target.value)}
                      className="w-20 pl-4 pr-1 py-1 text-right text-sm border border-gray-300 rounded focus:border-red-500 outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 uppercase">/{item.unit}</span>
                </div>
                <div className="text-right min-w-20">
                  <span className="font-black text-gray-900">
                    ₹{(item.price * qty).toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer / Totals Logic */}
      <div className="p-4 bg-gray-50 border-t space-y-3 shrink-0">
        <div className="space-y-1 px-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Taxable Value</span>
            <span>₹{totalTaxable}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>GST</span>
            <span>₹{totalTax}</span>
          </div>
        </div>

        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <span className="font-bold text-gray-700">Total Payable</span>
          <span className="text-xl font-black text-red-600">₹{grandTotal}</span>
        </div>

        <button 
          onClick={() => handleDownload(items)}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-file-invoice"></i>
          Generate Invoice
        </button>
      </div>
    </div>
  </div>
);
};

export default BillingPopup;

