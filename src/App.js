import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { UserContext } from "./Context/userContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";

import Addjobs from "./pages/AddJobs";
import Signin from "./pages/Signinpage/Signin";
import Banners from "./pages/Banners/index";
import JobListing from "./widgets/Joblisting";
import Header from "./Components/Header";
import AddCompanydetails from "./pages/companydetails";
import CompanyList from "./pages/Comapnylist";

function App() {
    // set user details in context
    const [user, setUser] = useState({ email: "jhandique1999@gmail.com" });
    const [isAdmin, setIsAdmin] = useState(false);
    return (
        <BrowserRouter>
            <UserContext.Provider value={{ user, setUser, isAdmin, setIsAdmin }}>
                <div className="App">
                    <Header />
                    <ToastContainer autoClose={2000} />
                    <Routes>
                        <Route exact path="/signin" element={<Signin />} />
                        <Route exact path="/addjob" element={<Addjobs />} />
                        <Route exact path="/canvas" element={<Banners />} />
                        <Route exact path="/addcompanydetails" element={<AddCompanydetails />} />
                        <Route exact path="/companylist" element={<CompanyList />} />
                        <Route exact path="/jobs" element={<JobListing />} />
                        <Route exact path="/" element={<Signin />} />
                    </Routes>
                </div>
            </UserContext.Provider>
        </BrowserRouter>
    );
}

export default App;