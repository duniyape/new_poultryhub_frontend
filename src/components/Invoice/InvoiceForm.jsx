import React, { useState, useEffect } from 'react';
import Invoice from './Invoice';
import { pdf } from '@react-pdf/renderer';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import useApi from '../../api/useApi';
import Swal from 'sweetalert2';
import { get, ref } from 'firebase/database';
import { db } from '../../firebase/Database';

const InvoiceForm = () => {
  const { id } = useParams()
  const { getData, postData } = useApi()
  const [invoiceid, setinvoiceid] = useState('')
  const [show, setshow] = useState(true)

useEffect(() => {
  if (!id) return;
  console.log(id);
  fetchData();
  search(id);
}, [id]);

const fetchData = async () => {
    try {
      const usersRef = ref(db, `orders/${id}`);
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log("Fetched data:", data);
      } else {
        console.log("No data available");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const [formData, setFormData] = useState({
    date: '2025-06-05',
    customer: {
      name: '',
      address: '',
      state: '',
      mobile: '',
    },
    items: [{ sn: 1, description: '', qty: '', unit: 'KG', price: '', amount: '' }],
    previousBalance: 0,
    totalBalance: '',
    totalQty: '',
    pieces: '',
    grandTotal: '',
  });

//   useEffect(() => {
    
//   }, [id]);

  const search = async (id) => {
    console.log(id)
    try {
      // Get ledger entries
      const res2 = await getData(`/get_ledgers/${id}`)
      console.log(res2)

      // Calculate total dr_amt and cr_amt 
      if (!res2) return
      const totals = res2.reduce((acc, item) => {
        acc.dr_amt += item.dr_amt;
        acc.cr_amt += item.cr_amt;
        return acc;
      }, { dr_amt: 0, cr_amt: 0 });

      // const previous_bal = 0;
      const previous_bal = totals.dr_amt - totals.cr_amt;

      // Get customer + product details
      const res = await getData(`/get_details/${id}`)
      console.log(res)

      if (res) {
        const items = res.product.map(item => ({
          description: item.name,
          qty: item.total_qty,
          product_id: item.product_id,
          price: '',
          unit: 'KG',
          amount: 0
        }));

        setFormData({
          vendor_id: id,
          date: '2025-06-05', // Consider making this dynamic if needed
          customer: {
            name: res.name,
            address: res.address,
            state: res.state,
            mobile: res.number,
          },
          items,
          type: res.type,
          previousBalance: previous_bal,
          totalQty: '',
          grandTotal: '',
          pieces: '',
          current_total: 0,
        });
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };


  useEffect(() => {
    (async () => {
      try {
        const res = await getData("/get_bills")
        console.log(res);
        const existing_bills = res;
        let last_number = 1000;

        if (existing_bills) {
          const invoice_numbers = Object.keys(existing_bills)
            .filter(key => key.startsWith('NPH'))
            .map(key => parseInt(key.replace('NPH', ''), 10));

          if (invoice_numbers.length > 0) {
            last_number = Math.max(...invoice_numbers);
          }
        }

        const new_invoice_number = last_number + 1;
        const invoice_id = `NPH${new_invoice_number}`;
        // console.log(invoice_id)
        if(formData.type==="sell"){
          setinvoiceid(invoice_id)
        }
      } catch (error) {
        console.error(error)
      }
    })()
  }, [formData.type])


  const handleChange = (e, index, field) => {
    if (field) {
      const newItems = [...formData.items];
      newItems[index][field] = e.target.value;
      setFormData({ ...formData, items: newItems });
    } else if (e.target.name.startsWith('customer.')){
      const key = e.target.name.split('.')[1];
      setFormData({ ...formData, customer: { ...formData.customer, [key]: e.target.value } });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedItems = formData.items.map(item => ({
      ...item,
      amount: parseFloat(item.qty || 0) * parseFloat(item.price || 0),
    }));
    const totalQty = updatedItems.reduce((sum, i) => sum + Number(i.qty || 0), 0);
    const grandTotal = updatedItems.reduce((sum, i) => sum + Number(i.amount || 0), 0);
    const current_total = Math.abs(formData.previousBalance) + grandTotal
    setFormData({ ...formData, items: updatedItems, totalQty, grandTotal, invoiceid, current_total });
    // setprint(true);
    console.log({ ...formData, items: updatedItems, totalQty, grandTotal, invoiceid, current_total })
  };


  const handleDownload = async (invoicedata) => {
    const res=await postdata(invoicedata)
    if (!res) return (
     Swal.fire({
      title: "Error!",
      text: "Insufficient Stock!",
      icon: "error"
    })
  )
    const blob = await pdf(<Invoice data={invoicedata} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice.pdf`;
    link.click();
    URL.revokeObjectURL(url);
    Swal.fire({
      title: "Sucessful!",
      text: "Bill Generated Successfully!",
      icon: "success"
    });
    setshow(false)
  };

  //   if (print) {
  //     return (
  //       <>
  //         <div className="print-header">
  //           <button onClick={() => setprint(false)}>Close</button>
  //         </div>
  //         <Invoice data={formData} />
  //       </>
  //     );
  //   }

  return (
    <>
      <Link to={'/'}><div style={{
        background: '#249CA2',
        height: 50,
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        gap: 10,
        marginBottom: 10
      }}> <i style={{ paddingLeft: 20 }} class="fa-solid fa-arrow-left"></i>
        <label style={{ fontWeight: 700, fontSize: 12, color: 'white' }}>Back</label>
      </div>
      </Link>
      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: '800px',
          margin: '20px auto',
          padding: '20px',
          fontSize: 14,
          border: '1px solid #ccc',
          borderRadius: '10px',
          backgroundColor: '#fff',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Invoice Info</h2>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <input
            type="text"
            name="invoiceNo"
            placeholder="Invoice No"
            onChange={(e)=>setinvoiceid(e.target.value)}
            value={invoiceid}
            style={{ flex: '1 1 48%', padding: '10px' }}
            required
          />
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            style={{ flex: '1 1 48%', padding: '10px' }}
          />
        </div>

        <h2 style={{ fontSize: 16 }}>Customer Info</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <input
            type="text"
            name="customer.name"
            placeholder="Name"
            value={formData.customer.name}
            onChange={handleChange}
            style={{ flex: '1 1 48%', padding: '10px' }}
          />
          <input
            type="text"
            name="customer.address"
            placeholder="Address"
            value={formData.customer.address}
            onChange={handleChange}
            style={{ flex: '1 1 48%', padding: '10px' }}
          />
          <input
            type="text"
            name="customer.state"
            placeholder="State"
            value={formData.customer.state}
            onChange={handleChange}
            style={{ flex: '1 1 48%', padding: '10px' }}
          />
          <input
            type="text"
            name="customer.mobile"
            placeholder="Mobile"
            value={formData.customer.mobile}
            onChange={handleChange}
            style={{ flex: '1 1 48%', padding: '10px' }}
          />
        </div>

        <h2 style={{ fontSize: 16 }}>Items</h2>
        {formData.items.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              marginBottom: '10px',
            }}
          >
            <input
              placeholder="Description"
              value={item.description}
              onChange={(e) => handleChange(e, index, 'description')}
              style={{ flex: '1 1 48%', padding: '10px' }}
            />
            <input
              placeholder="Qty"
              value={item.qty}
              onChange={(e) => handleChange(e, index, 'qty')}
              style={{ flex: '1 1 48%', padding: '10px' }}
            />
            <input
              placeholder="Unit"
              value={item.unit}
              onChange={(e) => handleChange(e, index, 'unit')}
              style={{ flex: '1 1 48%', padding: '10px' }}
            />
            <input
              placeholder="Price"
              value={item.price}
              onChange={(e) => handleChange(e, index, 'price')}
              style={{ flex: '1 1 48%', padding: '10px' }}
            />
          </div>
        ))}

        {/* <button
          type="button"
          onClick={addItem}
          style={{
            padding: '10px 20px',
            marginBottom: '20px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          + Add Item
        </button> */}

        {formData.grandTotal && (
          <>
            <h2 style={{ fontSize: 16 }}> Total Amount</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap',gap:10 }}>
              <div style={{ flex: '1 1 48%'}}>
              <label>Amount</label>
              <input
                type="text"
                placeholder="Total"
                value={formData.grandTotal}
                readOnly
                style={{ width: '100%', padding: '10px' }}
              />
              </div>
              <div style={{ flex: '1 1 48%'}}>
              <label>Pieces</label>
              <input
                type="text"
                placeholder="No of Pieces"
                name='pieces'
                onChange={handleChange}
                value={formData.pieces}
                style={{ width: '100%', padding: '10px' }}
              />
              </div>

            </div>

            <h2 style={{ fontSize: 16 }}>Balance Info</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ flex: '1 1 48%' }}>
                <span>Previous Balance</span>
                <input
                  type="text"
                  name="previousBalance"
                  value={Math.abs(formData.previousBalance)}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px' }}
                />
              </div>
              <div style={{ flex: '1 1 48%' }}>
                <span>Current Balance</span>
                <input
                  type="text"
                  name="totalBalance"
                  value={Math.abs(formData.previousBalance) + Number(formData.grandTotal)}
                  readOnly
                  style={{ width: '100%', padding: '10px' }}
                />
              </div>
            </div>
          </>
        )}

        {!formData.grandTotal && (
          <div style={{ textAlign: 'center', display: 'grid', placeItems: 'center', marginTop: '20px' }}>
            <button
              type="submit"
              style={{
                padding: '10px 30px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
              }}
            >
              Calculate
            </button>
          </div>
        )}

        {(formData.grandTotal && show) && (
          <div style={{ textAlign: 'center', display: 'grid', placeItems: 'center', marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => handleDownload(formData)}
              style={{
                padding: '10px 30px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
              }}
            >
              Generate Invoice
            </button>
          </div>
        )}
      </form>
    </>


  );
};

export default InvoiceForm;
