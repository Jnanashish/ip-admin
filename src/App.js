import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { UserContext } from "./Context/userContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";
import Addjobs from "./pages/AddJobpage";
import Adminpanel from "./pages/Adminpanel/Adminpanel";
import Signin from "./pages/Signinpage/Signin";


function App() {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(null);
    return (
        <BrowserRouter>
            <UserContext.Provider value={{ user, setUser, isAdmin, setIsAdmin }}>
                <div className="App">
                    <ToastContainer autoClose={2000}/>
                    <Routes>
                        <Route exact path="/signin" element={<Signin />} />
                        <Route exact path="/admin" element={<Adminpanel />} />
                        <Route exact path="/addjob" element={<Addjobs />} />
                        <Route exact path="/" element={<Signin />} />
                    </Routes>
                </div>
            </UserContext.Provider>
        </BrowserRouter>
    );
}

export default App;
