import React, { useContext } from "react";
import { UserContext } from "../../Context/userContext";
import { useNavigate } from "react-router-dom";
import { Button } from "Components/ui/button";
import Custombutton from "../../Components/Button/Custombutton";

const Header = () => {
    const navigate = useNavigate();
    const currentUrl = window.location.pathname;

    const { user, logout } = useContext(UserContext);
    const isAuthenticated = !!user?.email;

    const handleRedirection = (route) => {
        navigate(route);
    };

    const handleLogout = async () => {
        await logout();
        navigate("/signin");
    };

    return (
        <div className="w-full bg-background">
            <div className="bg-header-blue px-6 py-[18px] flex flex-row justify-between items-center text-white lg:px-6 max-lg:px-3 max-lg:py-3">
                <h4 className="text-base font-medium max-lg:text-sm">Admin Panel</h4>

                {isAuthenticated ? (
                    <div className="flex items-center gap-4">
                        <h4 className="text-base font-medium max-lg:text-sm max-lg:hidden">Welcome : {user?.email}</h4>
                        <Button onClick={handleLogout} size="sm" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 capitalize">
                            Logout
                        </Button>
                    </div>
                ) : (
                    <Button onClick={() => navigate("/signin")} size="sm" className="bg-white text-black hover:bg-gray-100 capitalize">
                        Sign in
                    </Button>
                )}
            </div>
            {isAuthenticated && (
                <div className="flex flex-wrap gap-5 px-10 py-[30px] border-b border-foreground max-lg:px-5 max-lg:gap-3 max-lg:py-4">
                    <Custombutton variant={currentUrl === "/addjob" ? "" : "outlined"} onClick={() => handleRedirection("/addjob")} label="Add job" fullWidth={false} />
                    <Custombutton variant={currentUrl === "/jobs" ? "" : "outlined"} onClick={() => handleRedirection("/jobs")} label="Job dashboard" fullWidth={false} />
                    <Custombutton variant={currentUrl === "/addcompany" ? "" : "outlined"} onClick={() => handleRedirection("/addcompany")} label="Add company details" fullWidth={false} />
                    <Custombutton variant={currentUrl === "/companys" ? "" : "outlined"} onClick={() => handleRedirection("/companys")} label="Company list" fullWidth={false} />
                </div>
            )}
        </div>
    );
};

export default Header;
