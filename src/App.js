import React, { useContext } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Navigate } from "react-router-dom";

import { UserContext, AuthProvider } from "./Context/userContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";

import Addjobs from "./pages/AddJobs";
import Signin from "./pages/Signinpage";
import Banners from "./pages/Banners/index";
import JobList from "./pages/JobList";
import Header from "./Components/Header";
import AddCompanyDetails from "./pages/AddCompanyDetails";
import CompanyList from "./pages/CompanyList";
import Loader from "./Components/Loader";

function AppRoutes() {
    const { user, loading } = useContext(UserContext);

    if (loading) {
        return <Loader />;
    }

    const isAuthenticated = !!user?.email;

    const ProtectedRoute = ({ children }) => {
        return isAuthenticated ? children : <Navigate to="/signin" />;
    };

    return (
        <div className="App">
            <Header />
            <ToastContainer autoClose={2000} />
            <Routes>
                <Route path="/signin" element={isAuthenticated ? <Navigate to="/addjob" /> : <Signin />} />
                <Route path="/addjob" element={<ProtectedRoute><Addjobs /></ProtectedRoute>} />
                <Route path="/canvas" element={<ProtectedRoute><Banners /></ProtectedRoute>} />
                <Route path="/addcompany" element={<ProtectedRoute><AddCompanyDetails /></ProtectedRoute>} />
                <Route path="/companys" element={<ProtectedRoute><CompanyList /></ProtectedRoute>} />
                <Route path="/jobs" element={<ProtectedRoute><JobList /></ProtectedRoute>} />
                <Route path="/" element={isAuthenticated ? <Navigate to="/addjob" /> : <Navigate to="/signin" />} />
                <Route path="*" element={<Navigate to="/signin" />} />
            </Routes>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
