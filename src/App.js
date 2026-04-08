import React, { useContext } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Navigate } from "react-router-dom";

import { UserContext, AuthProvider } from "./Context/userContext";
import { ThemeProvider } from "./Context/themeContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "@fontsource/geist-sans";
import "@fontsource/geist-mono";
import "./App.css";

import Addjobs from "./pages/AddJobs";
import Signin from "./pages/Signinpage";
import Banners from "./pages/Banners/index";
import JobList from "./pages/JobList";
import AddCompanyDetails from "./pages/AddCompanyDetails";
import CompanyList from "./pages/CompanyList";
import ScraperDashboard from "./pages/Scraper/Dashboard";
import ScraperStaging from "./pages/Scraper/Staging";
import ScraperStagingDetail from "./pages/Scraper/StagingDetail";
import ScraperLogs from "./pages/Scraper/Logs";
import ScraperHealth from "./pages/Scraper/Health";
import Analytics from "./pages/Analytics";
import BlogList from "./pages/Blogs/BlogList";
import BlogEditor from "./pages/Blogs/BlogEditor";
import BlogPreview from "./pages/Blogs/BlogPreview";
import Loader from "./Components/Loader";
import AppLayout from "./Components/Layout/AppLayout";

function ProtectedRoute({ children }) {
    const { user, loading } = useContext(UserContext);
    if (loading) return <Loader />;
    return user?.email ? children : <Navigate to="/signin" />;
}

function AppRoutes() {
    const { user, loading } = useContext(UserContext);

    if (loading) {
        return <Loader />;
    }

    const isAuthenticated = !!user?.email;

    return (
        <>
            <ToastContainer autoClose={2000} />
            <Routes>
                <Route path="/signin" element={isAuthenticated ? <Navigate to="/addjob" /> : <Signin />} />
                <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                    <Route path="/addjob" element={<Addjobs />} />
                    <Route path="/canvas" element={<Banners />} />
                    <Route path="/addcompany" element={<AddCompanyDetails />} />
                    <Route path="/companys" element={<CompanyList />} />
                    <Route path="/jobs" element={<JobList />} />
                    <Route path="/admin/scraper" element={<ScraperDashboard />} />
                    <Route path="/admin/scraper/staging" element={<ScraperStaging />} />
                    <Route path="/admin/scraper/staging/:id" element={<ScraperStagingDetail />} />
                    <Route path="/admin/scraper/logs" element={<ScraperLogs />} />
                    <Route path="/admin/scraper/health" element={<ScraperHealth />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/blogs" element={<BlogList />} />
                    <Route path="/blogs/new" element={<BlogEditor />} />
                    <Route path="/blogs/:id/edit" element={<BlogEditor />} />
                    <Route path="/blogs/:id/preview" element={<BlogPreview />} />
                </Route>
                <Route path="/" element={isAuthenticated ? <Navigate to="/addjob" /> : <Navigate to="/signin" />} />
                <Route path="*" element={<Navigate to="/signin" />} />
            </Routes>
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ThemeProvider>
                    <AppRoutes />
                </ThemeProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
