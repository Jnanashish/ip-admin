import React, { useState, useContext } from "react";
import { Navigate } from "react-router-dom";

import styles from "./signin.module.scss";
import { UserContext } from "../../Context/userContext";
import { Button } from "@mui/material";

// firebase stuff
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import firebaseConfig from "../../Config/firebase_config";
initializeApp(firebaseConfig);

const Signin = () => {
    const context = useContext(UserContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // when sign in button is clicked
    const handleSignin = () => {
        const auth = getAuth();
        signInWithEmailAndPassword(auth, email, password)
            .then((res) => {
                context.setUser({ email: res.user?.email });
                if (res?.user?.email === "jhandique1999@gmail.com") {
                    context.setIsAdmin(true);
                }
            })
            .catch((err) => {
                alert(err.message);
            });
    };

    // if user is loged in redirect to addjob page
    if (!!context.user?.email) {
        return <Navigate to="/addjob" />;
    }

    return (
        <div className={styles.container}>
            <h1>Sign in for Admin</h1>
            <input className={styles.input_field} type="email" value={email} placeholder="Enter you email" onChange={(e) => setEmail(e.target.value)} />
            <input className={styles.input_field} type="password" value={password} placeholder="Enter password" onChange={(e) => setPassword(e.target.value)} />
            <Button className={styles.button} onClick={handleSignin} variant="contained">
                Sign in
            </Button>
        </div>
    );
};

export default Signin;
