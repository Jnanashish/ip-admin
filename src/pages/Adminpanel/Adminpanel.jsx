import React, { useState, useContext } from "react";

import { Tab, Tabs, TabList, TabPanel } from "react-tabs";

import Addjobs from "../../components/Addjobs/Addjobs";
import Joblinks from "../../components/Joblinks/Joblinks";
import Adpoptype from "../../components/Dapoptype/Adpoptype";
import AddBanner from "../../components/AD/Addbanner";

// context
import { UserContext } from "../../Context/userContext";
import { Navigate } from "react-router-dom";

// import styles
import styles from "./adminpanel.module.scss";
import AddLinkImg from "../../components/AD/Addlinkimg";
import AddLink from "../../components/AD/Addlink";

const AdminPanel = () => {
    const [currState, setCurrState] = useState("add_job");

    const active = { backgroundColor: "#0069ff", color: "#FFFFFF" };
    const inactive = {};
    // if (!context.user?.email) {
    //     return <Navigate to="/" />;
    // }

    return (
        <div className={styles.adminpanel}>
            <div className={styles.adminpanel_header}>
                <h3>Admin Panel</h3>
                <h3>Welcome : Jnanashish Handique</h3>
            </div>

            <Tabs orientation="horizontal" className={styles.container}>
                <TabList className={styles.tablist}>
                    <Tab
                        style={currState === "add_job" ? active : inactive}
                        onClick={() => setCurrState("add_job")}
                        className={styles.tab}>
                        + Add Job
                    </Tab>
                    <Tab
                        style={currState === "dashboard" ? active : inactive}
                        onClick={() => setCurrState("dashboard")}
                        className={styles.tab}>
                        Job Dashboard
                    </Tab>
                    {/* <Tab
                        style={currState === "analytics" ? active : inactive}
                        onClick={() => setCurrState("analytics")}
                        className={styles.tab}>
                        Analytics
                    </Tab> */}
                    <Tab
                        style={currState === "ad_link" ? active : inactive}
                        onClick={() => setCurrState("ad_link")}
                        className={styles.tab}>
                        + Ad (Link only)
                    </Tab>
                    <Tab
                        style={currState === "ad_img" ? active : inactive}
                        onClick={() => setCurrState("ad_img")}
                        className={styles.tab}>
                        + Ad (With Image)
                    </Tab>
                    <Tab
                        style={currState === "ad_banner" ? active : inactive}
                        onClick={() => setCurrState("ad_banner")}
                        className={styles.tab}>
                        + Add banner
                    </Tab>
                    <Tab
                        style={currState === "ad_pop" ? active : inactive}
                        onClick={() => setCurrState("ad_pop")}
                        className={styles.tab}>
                        Ad pop type
                    </Tab>
                </TabList>
                <div className={styles.part2}>
                    <TabPanel>
                        <Addjobs />
                    </TabPanel>
                    <TabPanel>
                        <Joblinks />
                    </TabPanel>
                    {/* <TabPanel>
                        <h2>Analytics</h2>
                    </TabPanel> */}
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
        </div>
    );
};

export default AdminPanel;
