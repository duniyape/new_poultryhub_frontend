import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate ,Link} from "react-router";
import Swal from 'sweetalert2'


const Navbar = (props) => {
const navigate=useNavigate()

    const [activeTab, setActiveTab] = useState("chats");

    const tabStyle = (tab) => ({
      flex: 1,
      padding: "10px",
      textAlign: "center",
      cursor: "pointer",
      fontSize:15,
      fontWeight: activeTab === tab ? "bold" : "normal",
      borderBottom: activeTab === tab ? "3px solid #25D366" : "none",
      color: activeTab === tab ? "#25D366" : "white",
    });
  
    const containerStyle = {
      display: "flex",
      justifyContent: "space-around",
      backgroundColor: "#075E54",
      color: "white",
      padding: "10px 0",
    };

    useEffect(() => {
        props.setdataonmobile(activeTab)
    }, [activeTab])


     const logout = () => {
      Swal.fire({
        title: "Are you sure?",
        text: "Do you want to Logout!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Logout!"
      }).then((result) => {
        if (result.isConfirmed) {
        sessionStorage.removeItem("user");
        navigate("/login");
        }
      });
      
    };
    


  return (
    <div style={containerStyle}>
      <div style={tabStyle("chats")} onClick={() => setActiveTab("chats")}>
      <i style={{marginRight:5}} className="fa-solid fa-calendar-check"></i> Admin Panel
      </div>
      <div style={tabStyle("setting")} onClick={logout}>
      <i style={{marginRight:5}} class="fa-solid fa-gear"></i> Logout
      </div>
    </div>
  )
}

export default Navbar
