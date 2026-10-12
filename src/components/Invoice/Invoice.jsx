import React from 'react';
import logo from '../../assets/logo.jpeg';
import sign from '../../assets/sign.png';
import {
  PDFViewer, Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Font,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 20, fontSize: 10, fontFamily: 'Helvetica' },
  header: { textAlign: 'center', marginBottom: 5 },
  billToSection: {
    border: '1pt solid black',
    padding: 5,
    marginVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tableHeader: {
    flexDirection: 'row',
    borderTop: '1pt solid black',
    borderBottom: '1pt solid black',
    backgroundColor: '#f0f0f0',
    borderLeft: '1pt solid black'
  },
  tableRow: { flexDirection: 'row', borderLeft: '1pt solid black' },
  tablefooter: { flexDirection: 'row', border: '1pt solid black' },
  cell: { padding: 4, borderRight: '1pt solid gray', textAlign: 'center' },
  cellfooter: { padding: 4, textAlign: 'center' },
  footer: { paddingBottom: 5, borderBottom: '1pt solid black', paddingTop: 5 },
  terms: { marginTop: 10 },
  bold: { fontWeight: 'bold' },
});

const Invoice = ({ data }) => {

  const {
    invoiceid,
    date,
    customer,
    previousBalance,
    slabSummary,
    totalIGST,totalCGST,totalSGST,totalTaxable,
    grandTotal,
    current_total,
  } = data;

  const getFilledItems = (items, targetRows = 15) => {
    const filled = [...items];
    while (filled.length < targetRows) {
      filled.push({
        description: '',
        sn: '',
        qty: '',
        price: '',
        unit: '',
        amount: '',
      });
    }
    return filled;
  };
  const filledItems = getFilledItems(data.items);
  return (
    //  <div style={{ height: '100vh' }}>
    //   <PDFViewer width="100%" height="100%">
    <Document>
      <Page size="A4" style={styles.page}>
        <Image style={{ width: 70, position: 'absolute', top: 15, left: 80 }} src={logo} alt="logo..." />

        {/* Header */}
        <View style={styles.header}>
          <Text style={{ fontSize: 14, fontWeight: 'bold' }}>INVOICE</Text>
          <Text>NEW POULTRY HUB</Text>
          <Text>Shop No-27, Ground Floor, Model Town, Phase-3</Text>
          <Text>Bathinda, PUNJAB, Pin: 151001</Text>
          <Text>Tel.: 07554 604558 | Email: newpoultryhub@gmail.com</Text>
        </View>

        {/* Customer and Invoice Info */}
        <View style={styles.billToSection}>
          <View style={{ width: '48%' }}>
            <Text style={styles.bold}>Bill to :</Text>
            <Text>{customer.name}</Text>
            <Text>{customer.address}</Text>
            <Text>State : {customer.state}</Text>
            <Text>Mobile No : {customer.mobile}</Text>
          </View>
          <View style={{ width: '48%' }}>
            <Text>Invoice No : {invoiceid}</Text>
            <Text>Date of Invoice : {date}</Text>
            <Text>Place of Supply: {customer.name}</Text>
            <Text>State of Supply : {customer.state}</Text>
            <Text>Mobile No : {customer.mobile}</Text>
          </View>
        </View>

        {/* Table Headers */}
        <View style={styles.tableHeader}>
          {['S.N', 'Description of Goods', 'Qty.', 'Unit', 'Price', 'Amount'].map((label, i) => (
            <Text key={i} style={{ ...styles.cell, flex: i === 1 ? 3 : 1 }}>{label}</Text>
          ))}
        </View>

        {/* Table Rows */}
        {filledItems.map((item, idx) => (
          <View style={styles.tableRow} key={idx}>
            <Text style={{ ...styles.cell, flex: 1 }}>{item.description && idx + 1}</Text>
            <Text style={{ ...styles.cell, flex: 3, textAlign: 'left' }}>{item.description}</Text>
            <Text style={{ ...styles.cell, flex: 1 }}>{(item.unit==="Kg"?item.qty:item.pieces)}</Text>
            <Text style={{ ...styles.cell, flex: 1 }}>{item.unit}</Text>
            <Text style={{ ...styles.cell, flex: 1 }}>{item.price}</Text>
            <Text style={{ ...styles.cell, flex: 1 }}>{item.amount}</Text>
          </View>
        ))}

        {/* Total Row */}
        <View style={styles.tablefooter}>
          <Text style={{ ...styles.cellfooter, flex: 1, textAlign: 'center' }}>{">"}</Text>
          <Text style={{ ...styles.cellfooter, flex: 3, textAlign: 'left' }}>Total</Text>
          <Text style={{ ...styles.cellfooter, flex: 1 }}></Text>
          <Text style={{ ...styles.cellfooter, flex: 2 }}></Text>
          <Text style={{ ...styles.cellfooter, flex: 1 }}>{grandTotal.toFixed(2)}</Text>
        </View>

        {/* Grand Total & Words */}
        <View style={{marginTop:5,marginBottom:5}}>
                  {/* Table Header */}
        <View style={{flexDirection:'row',justifyContent:"space-between",marginTop: 10,gap:20}}>
          <View style={{flex:3}}>
        <View style={{
          display: "flex",
          flexDirection: "row",
          borderWidth: 1,
          borderColor: "#000",
          fontSize: 8,
          fontWeight: "bold",
          // marginTop:10
        }}>
          <Text style={{ flex: 2, padding: 5, borderRightWidth: 1 }}>GST %</Text>
          <Text style={{ flex: 2, padding: 5, borderRightWidth: 1 }}>Taxable Amount</Text>
          {/* <Text style={{ flex: 2, padding: 5, borderRightWidth: 1 }}>GST Amount</Text> */}
          <Text style={{ flex: 2, padding: 5, borderRightWidth: 1 }}>CGST</Text>
          <Text style={{ flex: 2, padding: 5 }}>SGST</Text>
        </View>

        {/* Table Rows */}
        {Object.entries(slabSummary).map(([rate, data], i) => (
         <View key={i} style={{
    display: "flex",
    flexDirection: "row",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    fontSize: 10
  }}>
    <Text style={{ flex: 2, padding: 5, borderRightWidth: 1 }}>{rate === "0" ? "Exempted" : `${rate}%`}</Text>
    <Text style={{ flex: 2, padding: 5, borderRightWidth: 1 }}>{data.taxable.toFixed(2)}</Text>
    {rate === "0" ? (
      <>
        {/* <Text style={{ flex: 2, padding: 5, borderRightWidth: 1 }}>-</Text> */}
        <Text style={{ flex: 2, padding: 5, borderRightWidth: 1 }}>-</Text>
        <Text style={{ flex: 2, padding: 5 }}>-</Text>
      </>
    ) : (
      <>
        {/* <Text style={{ flex: 2, padding: 5, borderRightWidth: 1 }}>{data.gstAmount.toFixed(2)}</Text> */}
        <Text style={{ flex: 2, padding: 5, borderRightWidth: 1 }}>{data.cgst}</Text>
        <Text style={{ flex: 2, padding: 5 }}>{data.sgst}</Text>
      </>
    )}
  </View>
))}
</View>
  <View style={{flex:1,marginRight:5,gap:5}}>
          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
              <Text>Taxable Amt:</Text>
              <Text style={{fontWeight:'bold'}}>{totalTaxable}/-</Text>
          </View>
          <View style={{flexDirection:'row',justifyContent:'space-between',borderBottom:"1px solid black" }}>
              <Text>GST :</Text>
              <Text style={{fontWeight:'bold'}}>{(Number(totalCGST+totalSGST+totalIGST)).toFixed(2)}/-</Text>
          </View>
          <View style={{flexDirection:'row',justifyContent:'space-between',borderBottom:"1px solid black"}}>
              <Text>Net Amt:</Text>
              <Text style={{fontWeight:'bold'}}>{grandTotal.toFixed(2)}/-</Text>
          </View>
  </View>
  </View>
        </View>

        {/* Balances */}
        <View style={styles.footer}>
          <Text>Previous Balance : {Math.abs(parseFloat(previousBalance).toFixed(0))}/-</Text>
          <Text>Current Balance : {current_total.toFixed(0)}/- </Text>
        </View>

        {/* Terms */}


        <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
          <View style={{ width: "70%" }} >
            <View style={styles.terms}>
              <Text style={styles.bold}>Terms & Conditions</Text>
              <Text>1. E.&O.E.</Text>
              <Text>2. Goods once sold will not be taken back.</Text>
              <Text>3. Interest @ 18% p.a. will be charged if the payment is not made within the stipulated time.</Text>
              <Text>4. Subject to 'Bathinda' Jurisdiction only.</Text>
            </View>
          </View>
          <View style={{ marginTop: 20, textAlign: 'right' }}>
            <Image style={{ width: 75, marginTop: -10, marginBottom: -10, transform: "rotate(-10)" }} src={sign} />
            <Text>for NEW POULTRY HUB</Text>
            <Text style={{ fontStyle: 'italic' }}>Authorised Signatory</Text>
          </View>
        </View>

        {/* Signature */}

      </Page>
    </Document>
    //   </PDFViewer>
    // </div>
  )
}

export default Invoice