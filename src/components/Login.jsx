import React, { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import { useNavigate } from "react-router";
import useApi from "../api/useApi";
import image from "../assets/logo.jpeg"
import { useUser } from "../context/UserContext";

// const db=getDatabase(app)

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: ""});
  const {postData} = useApi()
  const { login } = useUser()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    logindoctor()
  };

  const navigate = useNavigate()
  const logindoctor = async () => {
  try {
    const res = await postData("/login", {
      email: formData.email,
      password: formData.password,
    });

    if (res?.user) {
      // sessionStorage.setItem("user", JSON.stringify(res.user));
      login(res.user)
    } else {
      alert("Invalid Email or Password");
    }
  } catch (err) {
    alert("Invalid Email or Password");
  }
};



  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <img src={image} alt="Logo" style={styles.logo} />
        <h2 style={{fontSize:18,margin:'0px 0px 0px 0px'}}>Admin Login</h2>
          <div style={{
              margin:'20px 0px',
              fontSize:12
          }}>
          </div>
        <input
          type="email"
          name="email"
          placeholder="Email"
          style={styles.input}
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          style={styles.input}
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          style={styles.button}
          onMouseOver={(e) => (e.target.style.backgroundColor = styles.buttonHover.backgroundColor)}
          onMouseOut={(e) => (e.target.style.backgroundColor = styles.button.backgroundColor)}
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;


const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      width:'100vw',
      backgroundImage: "url('https://hips.hearstapps.com/hmg-prod/images/types-of-doctors-1600114658.jpg?crop=0.670xw:1.00xh;0.0553xw,0&resize=640:*')",
      backgroundSize: "cover",
      backgroundPosition: "center",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      padding: "20px",
      backgroundColor: "white",
      boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
      borderRadius: "8px",
      width: "100%",
      maxWidth: "320px",
      textAlign: "center",
    },
    logo: {
      width: "80px",
      height: "80px",
      margin: "0 auto 5px",
    },
    input: {
      marginBottom: "10px",
      padding: "10px",
      fontSize: "12px",
      border: "1px solid #ccc",
      borderRadius: "5px",
    },
    button: {
      padding: "10px",
      fontSize: "12px",
      backgroundColor: "#008C84",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },
    buttonHover: {
      backgroundColor: "#218838",
    },
  };
