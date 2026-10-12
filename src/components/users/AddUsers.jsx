import React, { useState } from "react";
import useApi from "../../api/useApi";

const VendorCustomerForm = () => {
  const [formType, setFormType] = useState("customer");
  const { postData } = useApi();
  const [formData, setFormData] = useState({
    businessName: "",
    name: "",
    phone: "",
    email: "",
    gst: "",
    state: "",
    city: "",
    address: "",
    from_number:"919131037870",
    v_type:formType === "customer" ? "Customer" : "Vendor",
  });

  const [errors, setErrors] = useState({});

  const regex = {
    phone: /^[6-9]\d{9}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    gst: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.businessName.trim())
      newErrors.businessName = "Business name is required";
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!regex.phone.test(formData.phone))
      newErrors.phone = "Enter valid phone number";
    if (formData.email && !regex.email.test(formData.email))
      newErrors.email = "Enter valid email";
    if (formData.gst && !regex.gst.test(formData.gst))
      newErrors.gst = "Invalid GST number";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    if (validate()) {
      const payload = {
        business_name: formData.name ,
        name:formData.businessName,
        number: formData.phone,
        email: formData.email,
        gst: formData.gst,
        state: formData.state,
        city: formData.city,
        address: formData.address,
        from_number: formData.from_number,
        v_type: formType === "customer" ? "Customer" : "Vendor",
      };
      try {
        const res2 = await postData('/create-vendor', payload);
           console.log(res2);
      alert(
        `✅ ${formType === "customer" ? "Customer" : "Vendor"} created successfully!`
      );
       console.log(formData);
      setFormData({
        businessName: "",
        name: "",
        phone: "",
        email: "",
        gst: "",
        state: "",
        city: "",
        address: "",
      });
      setErrors({});
      } catch (error) {
        console.error("❌ Error creating user:", error);
      }
     
     
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "linear-gradient(to bottom right, #a5b4fc, #fbcfe8)",
        backgroundAttachment: "fixed",  
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "10px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            padding: "15px",
            width: "100%",
            maxWidth: "500px",
          }}
        > 
        <div className="border-b border-b-stone-300 pb-2" style={{display:'flex',alignItems:'center',gap:10,marginBottom:10,cursor:'pointer'}} onClick={()=>window.history.back()}> 
           <i style={{marginRight:10,fontSize:20}} class="fa-solid fa-arrow-left"></i>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#1f2937",
              textAlign: "center",
            }}
          >
            Create {formType === "customer" ? "Customer" : "Vendor"}
          </h2></div>
        
        

          {/* Dropdown */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontSize: "14px",
                color: "#374151",
                fontWeight: "500",
              }}
            >
              Select Type
            </label>
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "14px",
              }}
            >
              <option value="customer">Customer</option>
              <option value="vendor">Vendor</option>
            </select>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "15px",
            }}
          >
            {[
              { id: "businessName", label: "Business Name", required: true },
              { id: "name", label: "Full Name", required: true },
              { id: "phone", label: "Phone Number", required: true },
              // { id: "email", label: "Email (Optional)", required: false },
              { id: "gst", label: "GST Number (Optional)", required: false },
              { id: "state", label: "State", required: true },
              { id: "city", label: "City", required: true },
              { id: "address", label: "Address", required: true },
            ].map((field) => (
              <div
                key={field.id}
                style={
                  field.id === "address"
                    ? { gridColumn: "1 / span 2" }
                    : undefined
                }
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "14px",
                    color: "#374151",
                    fontWeight: "500",
                  }}
                >
                  {field.label}{" "}
                  {field.required && <span style={{ color: "red" }}>*</span>}
                </label>
                <input
                  type="text"
                  value={formData[field.id]}
                  onChange={(e) =>
                    setFormData({ ...formData, [field.id]: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "14px",
                  }}
                />
                {errors[field.id] && (
                  <p
                    style={{
                      color: "red",
                      fontSize: "12px",
                      marginTop: "5px",
                    }}
                  >
                    {errors[field.id]}
                  </p>
                )}
              </div>
            ))}

            <div style={{ gridColumn: "1 / span 2" }}>
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  backgroundColor: "#4f46e5",
                  color: "#fff",
                  fontSize: "16px",
                  fontWeight: "600",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Create {formType === "customer" ? "Customer" : "Vendor"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VendorCustomerForm;
