import { pdf } from '@react-pdf/renderer';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useApi from '../../api/useApi';
import Invoice from './Invoice';
import { useLoader } from '../../context/LoaderContext';

const Download = () => {
    const { showLoader, hideLoader } = useLoader();
    const { id } = useParams();
    const { getData} = useApi()
  const [Data, setData] = useState('')
  const [Downloaded, setDownloaded] = useState(false)
  useEffect(() => {
   (async()=>{
    try {
        const res = await getData(`/get_bill/${id}`)
      setData(res)
       if (res) {
        setTimeout(() => {
          handleDownload(res);
        }, 500); // 300–500ms delay is usually safe
      }
  } catch (error) {
    console.error("Error fetching retailer data:", error);
    return null;
  }
   })()
  }, [id])
  
 const handleDownload = async (res) => {
    showLoader()

    try {
      const blob = await pdf(<Invoice data={res} type="sale" />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.download = `statement-${timestamp}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setDownloaded(true)
        
    } catch (error) {
      console.error('Failed to download PDF:', error);
    } finally {
      hideLoader()
    }
  };
  
  if(!Downloaded){
    return <div style={styles.container}/>
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>✅ PDF Downloaded Successfully</h2>
        <p style={styles.message}>You can now go back to WhatsApp to confirm.</p>
        <button onClick={()=>window.location.href = `https://wa.me/916284021225`} style={styles.button} >
          Go Back to WhatsApp
        </button>
      </div>
    </div>
   
  );
};


const styles = {
  container: {
    minHeight: '100vh',
    width:'100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: '20px',
    boxSizing: 'border-box',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: '#fff',
    padding: '30px 20px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  heading: {
    fontSize: '1.5rem',
    marginBottom: '10px',
    color: '#28a745',
  },
  message: {
    fontSize: '1rem',
    marginBottom: '20px',
    color: '#333',
  },
  button: {
    padding: '10px 20px',
    fontSize: '1rem',
    backgroundColor: '#25D366',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    width: '100%',
  },
};

export default Download;
