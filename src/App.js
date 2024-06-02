import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Navigate } from "react-router-dom";

import { UserContext } from "./Context/userContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";

// import pages
import Addjobs from "./pages/AddJobs";
import Signin from "./pages/Signinpage";
import Banners from "./pages/Banners/index";
import JobList from "./pages/JobList";
import Header from "./Components/Header";
import AddCompanyDetails from "./pages/AddCompanyDetails";
import CompanyList from "./pages/CompanyList";

function App() {
    // set user details in context
    const [user, setUser] = useState({ email: "jhandique1999@gmail.com" });
    const [isAdmin, setIsAdmin] = useState(false);

    const isUserLogedin = !!user?.email;

    return (
        <BrowserRouter>
            <UserContext.Provider value={{ user, setUser, isAdmin, setIsAdmin }}>
                <div className="App">
                    <Header />
                    <ToastContainer autoClose={2000} />
                    <Routes>
                        <Route exact path="/signin" element={isUserLogedin ? <Navigate to="/addjob" /> : <Signin />} />
                        <Route exact path="/addjob" element={isUserLogedin ? <Addjobs /> : <Navigate to="/" />} />
                        <Route exact path="/canvas" element={<Banners />} />
                        <Route exact path="/addcompany" element={isUserLogedin ? <AddCompanyDetails /> : <Navigate to="/" />} />
                        <Route exact path="/companys" element={isUserLogedin ? <CompanyList /> : <Navigate to="/" />} />
                        <Route exact path="/jobs" element={<JobList />} />
                        <Route exact path="/" element={isUserLogedin ? <Navigate to="/addjob" /> : <Signin />} />
                    </Routes>
                </div>
            </UserContext.Provider>
        </BrowserRouter>
    );
}

export default App;