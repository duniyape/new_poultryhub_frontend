import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router";

// Create context
const UserContext = createContext(null);

// Provider component
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
    let userdata=sessionStorage.getItem('user')
    if(!userdata){
        navigate("/login")
    }else{
        setUser(JSON.parse(userdata))
    }
    }, []); 

      // Login handler
  const login = (userData) => {
    sessionStorage.setItem("user", JSON.stringify(userData))
    console.log(userData)
    setUser(userData)          // 🔥 THIS WAS MISSING
    navigate("/")
  }

  // Logout handler
  const logout = () => {
    sessionStorage.clear()
    setUser(null)
    navigate("/login")
  }

    return <UserContext.Provider value={{ user, login, logout }}>{children}</UserContext.Provider>;
};

// Custom hook to access user data
export const useUser = () => useContext(UserContext);
