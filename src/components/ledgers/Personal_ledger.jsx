import React, { useEffect, useState } from 'react'
import { Link} from "react-router";
import useApi from '../../api/useApi';


const Personal_ledger = () => {
    const {getData,postData}=useApi()
    const [list, setlist] = useState([])
    const [user, setuser] = useState({})
   
     const intialstate={
          vendorid: '',
          groupname: '',
          grouptype: '',
          ledgername: '',
          fromdate: '',
          todate: '',
          }
const [formData, setFormData] = useState(intialstate);

const handleChange = (e) => {
const { name, value } = e.target;
setFormData(prev => ({ ...prev, [name]: value }));
};


const handleSubmit = async (e) => {
  e.preventDefault(); // Correct capitalization
    const res2= await getData(`/get_ledgers/${formData.vendorid.toLowerCase()}`)
    // const res2= await getData(`/ledger/ledger-data/${formData.ledgername}/${formData.fromdate}/${formData.todate}`)
    setlist(res2.transactions)
    setuser(res2.data)
    console.log(res2)
};

  return (<>
<Link to={'/'}><div style={{
    background:'#249CA2',
    height:50,
    width:'100vw',
    display:'flex',
    alignItems:'center',
    color:'white',
    gap:10,
    marginBottom:10
    }}> <i style={{paddingLeft:20}} class="fa-solid fa-arrow-left"></i>
    <label style={{fontWeight:700,fontSize:12,color:'white'}}>Back</label>
</div>
</Link>
<div style={{ maxWidth: 960, fontFamily: "Arial" ,fontSize:12,margin:'auto'}}>
 <h2 style={{ textAlign: "center" }}>PERSONAL LEDGER</h2>

   <form onSubmit={handleSubmit} style={{fontSize:14, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',borderRadius:5 ,margin:"10px 0"}}>
        
        {/* Basic fields */}
        {[
        //    { label: 'Group Type', name: 'grouptype',options:[
        //     { label: 'Income', id: 'Income' },
        //     { label: 'Asset', id: 'Asset' },
        //     { label: 'Expense', id: 'Expense' },
        //     { label: 'Liabilty', id: 'Liabilty' }
        //     ] },
        //   { label: 'Group Name', name: 'groupname',options:grouplist.filter(item=>item.GroupType===formData.grouptype).map(item=>({label:item.GroupName,id:item.Pushkey}))},
        //   { label: 'Ledger Name', name: 'ledgername',options:ledger.filter(item=>item.GroupName===formData.groupname).map(item=>({label:item.LedgerName,id:item.Pushkey}))},
        // { label: 'From Date', name: 'fromdate',type:'date'},
        // { label: 'To Date', name: 'todate',type:'date'},
        { label: 'ID', name: 'vendorid'}
        ].map((field, idx) => (
          <div key={idx} style={{
            flex: '1 1 45%',
            display: 'flex',
            flexDirection: 'column',
            margin: '10px',
            minWidth: '280px',
          }}>
            <label style={{ fontWeight: 'bold', marginBottom: '6px' }}>{field.label}</label>
            {field.name === 'grouptype'||field.name === 'groupname'||field.name === 'ledgername' ? (
            <select
              required
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              style={{
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              <option value={''} >select</option>
              {field.options.map(item=>(<option key={item.id} value={item.id} >{item.label}</option>))}
             
            </select>
          ) : (
            <input
              required
              type={field.type || 'text'}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              style={{
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />)}
          </div>
        ))}
        <div style={{ width: '100%', textAlign: 'center',display:'grid',placeItems:'center'}}>
          <button
            type="submit"
            style={{
              backgroundColor: '#249CA2',
              color: 'white',
              padding: '8px 30px',
              fontSize: '14px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            SEARCH
          </button>
        </div>
</form>
<p style={{padding:10,fontWeight:'bold'}}>Name:{user.name}- {user.business_name}</p>
        {/* Ledger Table */}
<div style={{ border: "1px solid #ccc", borderRadius: "10px", overflow: "hidden",marginBottom:30 }}>
  <table style={{ width: "100%", borderCollapse: "collapse" }}>
    <thead>
      <tr style={{ background: "#f4f4f4", fontWeight: "bold" }}>
        <th style={{ padding: "10px", borderBottom: "1px solid #ddd", textAlign: "left" }}>S No</th>
        <th style={{ padding: "10px", borderBottom: "1px solid #ddd", textAlign: "left" }}>Date</th>
        <th style={{ padding: "10px", borderBottom: "1px solid #ddd", textAlign: "left" }}>Particular</th>
        <th style={{ padding: "10px", borderBottom: "1px solid #ddd", textAlign: "center" }}>Dr</th>
        <th style={{ padding: "10px", borderBottom: "1px solid #ddd", textAlign: "center" }}>Cr</th>
        <th style={{ padding: "10px", borderBottom: "1px solid #ddd", textAlign: "center" }}>Balance</th>
      </tr>
    </thead>
    <tbody>
      {list.length > 0 ? (
        list.map((item, index) => (
          <tr
            key={index}
            style={{
              background: index % 2 === 0 ? "#fff" : "#f9f9f9",
            }}
          >
            <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>{index + 1}</td>
            <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>{item.date}</td>
            <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>{item.particular}</td>
            <td style={{ padding: "10px", borderBottom: "1px solid #ddd", textAlign: "right", }}>{item.dr_amt}</td>
            <td style={{ padding: "10px", borderBottom: "1px solid #ddd", textAlign: "right", }}>{item.cr_amt}</td>
           <td style={{ padding: "10px", borderBottom: "1px solid #ddd", textAlign: "right", fontWeight: "bold" }}>
            {item.balance >= 0
                ? `${item.balance.toFixed(2)} Dr`
                : `${Math.abs(item.balance).toFixed(2)} Cr`}
            </td>

         
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="6" style={{ padding: "10px", textAlign: "center" }}>No ledgers found</td>
        </tr>
      )}
    </tbody>
  </table>
</div>


</div>
</>)
}

export default Personal_ledger