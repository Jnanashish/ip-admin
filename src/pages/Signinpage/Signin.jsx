import React, { useState, useContext } from "react";
import styles from "./signin.module.scss";
// router
import { Navigate } from "react-router-dom";

// context
import { UserContext } from "../../Context/userContext";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Button } from "@mui/material";

// firebase stuff
import { initializeApp } from "firebase/app";
import firebaseConfig from "../../Config/firebase_config";
initializeApp(firebaseConfig);

const Signin = () => {
    const context = useContext(UserContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSignin = () => {
        const auth = getAuth();
        signInWithEmailAndPassword(auth, email, password)
            .then((res) => {
                context.setUser({ email: res.user.email });
                if(res.user.email === "jhandique1999@gmail.com"){
                    context.setIsAdmin(true)
                }
            })
            .catch((err) => {
                alert(err.message);
            });
    };

    if (context.user?.email) {
        return <Navigate to="/addjob" />;
    }

    return (
        <div className={styles.container}>
            <h1>Sign in for Admin</h1>
            <br />
            <input
                className={styles.input_field}
                type="email"
                value={email}
                placeholder="Enter you email"
                onChange={(e) => setEmail(e.target.value)}
            />
            <br />
            <input
                className={styles.input_field}
                type="password"
                value={password}
                placeholder="Enter password"
                onChange={(e) => setPassword(e.target.value)}
            />
            <br />
            <Button
                className={styles.button}
                onClick={handleSignin}
                variant="contained">
                Sign in
            </Button>
        </div>
    );
};

export default Signin;
