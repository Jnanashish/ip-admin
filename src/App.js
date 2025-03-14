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
import { getCookie } from "./Helpers/cookieHelpers";

function App() {
    // set user details in context
    // const [user, setUser] = useState(null);
    const [user, setUser] = useState({ email: "jhandique1999@gmail.com" });
    const [isAdmin, setIsAdmin] = useState(false);

    const isUserLogedin = !!user?.email || getCookie("isLogedIn"); // || "jhandique1999@gmail.com"

    // RouterWrapper is a function that returns a Route component
    const RouterWrapper = (path, component, isSecured = true) => {
        return (
            <Route exact path={path} element={isSecured ? (isUserLogedin ? component : <Navigate to="/signin" />) : component} />
        );
    };

    return (
        <BrowserRouter>
            <UserContext.Provider value={{ user, setUser, isAdmin, setIsAdmin }}>
                <div className="App">
                    <Header />
                    <ToastContainer autoClose={2000} />
                    <Routes>
                        {RouterWrapper("/signin", <Signin />, false)}
                        {RouterWrapper("/addjob", <Addjobs />)}
                        {RouterWrapper("/canvas", <Banners />)}
                        {RouterWrapper("/addcompany", <AddCompanyDetails />)}
                        {RouterWrapper("/companys", <CompanyList />)}
                        {RouterWrapper("/jobs", <JobList />)}
                        {RouterWrapper("/", <Signin />, false)}
                    </Routes>
                </div>
            </UserContext.Provider>
        </BrowserRouter>
    );
}

export default App;
