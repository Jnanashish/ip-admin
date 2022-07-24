import React, {useContext} from 'react'

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import Addjobs from '../../components/Addjobs/Addjobs';
import Joblinks from "../../components/Joblinks/Joblinks"
import Adpoptype from "../../components/Dapoptype/Adpoptype"
import AddBanner from '../../components/AD/Addbanner';

// context
import {UserContext} from "../../Context/userContext"
import {Navigate} from "react-router-dom"

// import styles
import styles from "./adminpanel.module.scss"
import AddLinkImg from '../../components/AD/Addlinkimg';
import AddLink from '../../components/AD/Addlink';


const AdminPanel = () => {
    // const [pass, setPass] = useState("")
    // const [email, setEmail]
    const context = useContext(UserContext);
    if (!context.user?.email) {
        return <Navigate to="/" />;
    }

    return (
        <div className={styles.adminpanel}>
            <div className={styles.adminpanel_header}>
                <h3>Admin Panel</h3>
                <h4>Welcome : Jnanashish Handique</h4>
            </div>
        
            <Tabs className={styles.container}>
                <TabList className={styles.tablist}>
                    <Tab className={styles.tab}>+ Add Job</Tab>
                    <Tab className={styles.tab}>Job Dashboard</Tab>
                    <Tab className={styles.tab}>Analytics</Tab>
                    <Tab className={styles.tab}>+ Ad (Link only)</Tab>
                    <Tab className={styles.tab}>+ Ad (With Image)</Tab>
                    <Tab className={styles.tab}>+ Add banner</Tab>
                    <Tab className={styles.tab}>Ad pop type</Tab>
                </TabList>
                <div className={styles.part2}>
                    <TabPanel>
                        <Addjobs/>
                    </TabPanel>
                    <TabPanel>
                        <Joblinks/>
                    </TabPanel>
                    <TabPanel>
                        <h2>Analytics</h2>
                    </TabPanel>
                    <TabPanel>
                        <AddLink/>
                    </TabPanel>
                    <TabPanel>
                        <AddLinkImg/>
                    </TabPanel>
                    <TabPanel>
                        <AddBanner/>
                    </TabPanel>
                    <TabPanel>
                        <Adpoptype/>
                    </TabPanel>
                </div>
            </Tabs>           
        </div>
    )
}

export default AdminPanel;
