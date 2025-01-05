import React, { useContext } from "react";

// context
import { UserContext } from "../../Context/userContext";
import { useNavigate } from "react-router-dom";

// import styles
import styles from "./header.module.scss";
import { Button } from "@mui/material";
import Custombutton from "../../Components/Button/Custombutton";
import { getCookie } from "../../Helpers/cookieHelpers";

const Header = () => {
    const navigate = useNavigate();
    const currentUrl = window.location.pathname;

    const context = useContext(UserContext);
    const isUserLogedIn = context.user?.email || getCookie("isLogedIn");

    const handleRedirection = (route) => {
        navigate(route);
    };

    return (
        <div className={styles.adminpanel}>
            <div className={styles.adminpanel_header}>
                <h4>Admin Panel</h4>

                {isUserLogedIn ? (
                    <h4>Welcome : Jnanashish Handique</h4>
                ) : (
                    <Button onClick={() => navigate("/signin")} size="small" style={{ backgroundColor: "#FFF" }}>
                        Sign in
                    </Button>
                )}
            </div>
            {isUserLogedIn && <div className={styles.adminpanel_buttoncontainer}>
                <Custombutton variant={currentUrl === "/addjob" ? "" : "outlined"} onClick={() => handleRedirection("/addjob")} label="Add job" />
                <Custombutton variant={currentUrl === "/jobs" ? "" : "outlined"} onClick={() => handleRedirection("/jobs")} label="Job dashboard" />
                <Custombutton variant={currentUrl === "/addcompany" ? "" : "outlined"} onClick={() => handleRedirection("/addcompany")} label="Add company details" />
                <Custombutton variant={currentUrl === "/companys" ? "" : "outlined"} onClick={() => handleRedirection("/companys")} label="Company list" />
            </div>}
        </div>
    );
};

export default Header;
