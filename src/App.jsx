import React, { useEffect, useState } from 'react'
// import './App.css'
import Navbar from './components/Navbar'
import Home from './components/Home'


const App = () => {
const [mobileRoute, setmobileRoute] = useState('chat')


  return (
    <div style={{
      width:'100vw',
      minHeight:'100vh',
      background:'#F3F3F3'
  }}>
     <div>
     <Navbar setdataonmobile={(e)=>setmobileRoute(e)}/>
     <Home/>
     
     </div>
    </div>
  )
}

export default App
