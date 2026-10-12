import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LoaderProvider } from './context/LoaderContext.jsx'
import { BrowserRouter, Routes, Route } from "react-router";
import { UserProvider,useUser } from "./context/UserContext.jsx";
import Login from './components/Login'
import Add_Product from './components/Add_Product'
import Products from './components/Products'
import Create_group from './components/ledgers/Create_group.jsx'
import Create_ledgers from './components/ledgers/Create_ledgers.jsx'
import View_ledgers from './components/ledgers/View_ledgers.jsx'
import InvoiceForm from './components/Invoice/InvoiceForm.jsx'
import Users from './components/users/Users.jsx'
import Personal_ledger from './components/ledgers/Personal_ledger.jsx'
import Download from './components/Invoice/Download.jsx'
import VendorCustomerForm from './components/users/AddUsers.jsx'
import New_order from './components/orders/New_order.jsx'
import Order from './components/orders/Order.jsx'
import Bills from './pages/Bills.jsx' 
import Orders from './pages/Orders.jsx'
import { ToastContainer } from 'react-toastify'
import CustomerProfilePage from './components/users/Customer_Profile.jsx'
import Stock_Movement from './components/stock/Stock_Movement.jsx'
import Billing from './components/orders/Billing.jsx'
import Home from './components/Home.jsx'
import Subgroup from './components/ledgers/Subgroup.jsx'
import AccountingPage from './components/ledgers/Accounting.jsx'
import Employee from './components/users/employee.jsx'
import Salary from './components/users/Salary.jsx'
import EmployeeLedger from './components/ledgers/EmployeeLedger.jsx'
import JournalVoucher from './components/ledgers/Generalvoucher.jsx'
import ScreenShot from './components/ledgers/ScreenShot.jsx'
import WhatsappReceiptUi from './components/users/WhatsappReceiptUi.jsx'




const Application=()=>{
  const { user } = useUser()
  return(
       <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home user={user} />} />
            <Route path="/add" element={<Add_Product />} />
            <Route path="/products" element={<Products />} />
            <Route path="/create_group" element={<Create_group />} />
            <Route path="/subgroup" element={<Subgroup />} />
            <Route path="/create_ledger" element={<Create_ledgers />} />
            <Route path="/ledgers" element={<View_ledgers />} />
            <Route path="/personal_ledger" element={<Personal_ledger />} />
            <Route path="/users/:id" element={<Users />} />
            <Route path="/add_user" element={<VendorCustomerForm />} />
            <Route path="/journal_voucher" element={<JournalVoucher />} />
            <Route path="/order/p/:id" element={<New_order />} />
            <Route path="/order" element={<New_order />} />
            <Route path="/order/:entityName" element={<Order />} />
            <Route path="/bills" element={<Bills />} />
            <Route path="/unbilled_orders" element={<Orders />} />
            <Route path="/profile/:customerId" element={<CustomerProfilePage />} />
            <Route path="/product/:id" element={<Stock_Movement />} />
            <Route path="/billing/:id" element={<Billing />} />
            <Route path="/accounting" element={<AccountingPage />} />
            <Route path="/employee" element={<Employee />} />
            <Route path="/salary" element={<Salary />} />
            <Route path="/employeeledger" element={<EmployeeLedger />} />
            <Route path="/screenshot" element={<ScreenShot />} />
            
        </Routes>
  )}

  createRoot(document.getElementById('root')).render(
     <BrowserRouter>
    <LoaderProvider>
       <ToastContainer/>
      <Routes>
        <Route path="/download/:id" element={<Download />} />
        <Route path="/pay" element={<WhatsappReceiptUi />} />
        <Route
          path="*"
          element={
            <UserProvider>
                <Application/>
            </UserProvider>
          }
        />
      </Routes>
      
    </LoaderProvider>
  </BrowserRouter>
)

      
