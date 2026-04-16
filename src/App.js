import React, { useContext, lazy, Suspense } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Navigate } from "react-router-dom";

import { UserContext, AuthProvider } from "./Context/userContext";
import { ThemeProvider } from "./Context/themeContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "@fontsource/geist-sans";
import "@fontsource/geist-mono";
import "./App.css";

import Loader from "./Components/Loader";
import AppLayout from "./Components/Layout/AppLayout";

// Route-level code splitting — pages load on demand, shrinking the initial bundle.
const Addjobs = lazy(() => import("./pages/AddJobs"));
const Signin = lazy(() => import("./pages/SignIn"));
const Banners = lazy(() => import("./pages/Banners/index"));
const JobList = lazy(() => import("./pages/JobList"));
const AddCompanyDetails = lazy(() => import("./pages/AddCompanyDetails"));
const CompanyList = lazy(() => import("./pages/CompanyList"));
const ScraperDashboard = lazy(() => import("./pages/Scraper/Dashboard"));
const ScraperStaging = lazy(() => import("./pages/Scraper/Staging"));
const ScraperStagingDetail = lazy(() => import("./pages/Scraper/StagingDetail"));
const ScraperLogs = lazy(() => import("./pages/Scraper/Logs"));
const ScraperHealth = lazy(() => import("./pages/Scraper/Health"));
const Analytics = lazy(() => import("./pages/Analytics"));
const BlogList = lazy(() => import("./pages/Blogs/BlogList"));
const BlogEditor = lazy(() => import("./pages/Blogs/BlogEditor"));
const BlogPreview = lazy(() => import("./pages/Blogs/BlogPreview"));

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
            <Suspense fallback={<Loader />}>
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
            </Suspense>
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
