import React, { useState, useContext } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";

import Joblinks from "../../widgets/Joblinks/Joblinks";
import Adpoptype from "../../widgets/Dapoptype/Adpoptype";
import AddBanner from "../../widgets/AD/Addbanner";
import CompanyDetails from "../../widgets/CompanyDetails/CompanyDetails";
// context
import { UserContext } from "../../Context/userContext";
import { useNavigate } from "react-router-dom";

// import styles
import styles from "./adminpanel.module.scss";
import AddLinkImg from "../../widgets/AD/Addlinkimg";
import AddLink from "../../widgets/AD/Addlink";
import { Button } from "@mui/material";

const AdminPanel = () => {
    const [currState, setCurrState] = useState("companylogo");
    const navigate = useNavigate();

    const context = useContext(UserContext);
    const isUserLogedIn = context.user?.email || true;

    // when Add job button is clicked
    const addJobspage = () => {
        navigate("/addjob");
    };

    // button css
    const activeButtonCss = { backgroundColor: "#0069ff", color: "#FFFFFF" };
    const inactiveButtonCss = {};

    return (
        <div className={styles.adminpanel}>
            <div className={styles.adminpanel_header}>
                <h4>Admin Panel</h4>

                {isUserLogedIn ? (
                    <h4>Welcome : Jnanashish Handique</h4>
                ) : (
                    <Button onClick={() => navigate("/signin")} size="medium" style={{ backgroundColor: "#FFF" }}>
                        Sign in
                    </Button>
                )}
            </div>

            <Tabs orientation="horizontal" className={styles.container}>
                <TabList className={styles.tablist}>
                    {isUserLogedIn && (
                        <div onClick={addJobspage} className={styles.tab}>
                            <h4>+ Add job</h4>
                        </div>
                    )}
                    <Tab style={currState === "dashboard" ? activeButtonCss : inactiveButtonCss} onClick={() => setCurrState("dashboard")} className={styles.tab}>
                        Job dashboard
                    </Tab>
                    {isUserLogedIn && (
                        <>
                            <Tab style={currState === "companylogo" ? activeButtonCss : inactiveButtonCss} onClick={() => setCurrState("companylogo")} className={styles.tab}>
                                Add company details
                            </Tab>
                            <Tab style={currState === "ad_link" ? activeButtonCss : inactiveButtonCss} onClick={() => setCurrState("ad_link")} className={styles.tab}>
                                + Ad (Link only)
                            </Tab>
                            <Tab style={currState === "ad_img" ? activeButtonCss : inactiveButtonCss} onClick={() => setCurrState("ad_img")} className={styles.tab}>
                                + Ad (With image)
                            </Tab>
                            <Tab style={currState === "ad_banner" ? activeButtonCss : inactiveButtonCss} onClick={() => setCurrState("ad_banner")} className={styles.tab}>
                                + Add banner
                            </Tab>
                            <Tab style={currState === "ad_pop" ? activeButtonCss : inactiveButtonCss} onClick={() => setCurrState("ad_pop")} className={styles.tab}>
                                Ad pop type
                            </Tab>
                        </>
                    )}
                </TabList>

                
                <div className={styles.part2}>
                    <TabPanel>
                        <Joblinks /> 
                    </TabPanel>
                    <TabPanel>
                        <CompanyDetails />
                    </TabPanel>
                    <TabPanel>
                        <AddLink />
                    </TabPanel>
                    <TabPanel>
                        <AddLinkImg />
                    </TabPanel>
                    <TabPanel>
                        <AddBanner />
                    </TabPanel>
                    <TabPanel>
                        <Adpoptype />
                    </TabPanel>
                </div>
            </Tabs>
            <br />
        </div>
    );
};

export default AdminPanel;
