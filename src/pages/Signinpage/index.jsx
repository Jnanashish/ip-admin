import React, { useState, useContext } from "react";
import { Navigate } from "react-router-dom";

import styles from "./signin.module.scss";
import { UserContext } from "../../Context/userContext";
import { Button, InputAdornment } from "@mui/material";
import CustomTextField from "../../Components/Input/Textfield";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import Loader from "../../Components/Loader";
import { setCookie, getCookie } from "../../Helpers/cookieHelpers";

// firebase stuff
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import firebaseConfig from "../../Config/firebase_config";
initializeApp(firebaseConfig);

const Signin = () => {
    const context = useContext(UserContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isPassword, setIsPassword] = useState(true);
    const [showLoader, setShowLoader] = useState(false);

    // when sign in button is clicked login with firebase
    const handleSignin = () => {
        setShowLoader(true);

        const auth = getAuth();
        signInWithEmailAndPassword(auth, email, password)
            .then((res) => {
                setShowLoader(false);
                context.setUser({ email: res.user?.email });
                if (res?.user?.email === process.env.REACT_APP_ADMIN_EMAIL) {
                    context.setIsAdmin(true);
                    setCookie("isLogedIn", "TRUE");
                }
            })
            .catch((err) => {
                setShowLoader(false);
                alert(err.message);
            });
    };

    // if user is loged in redirect to addjob page
    if (!!context.user?.email || getCookie("isLogedIn")) {
        return <Navigate to="/addjob" />;
    }

    return (
        <div style={{ position: "relative" }}>
            <div className={styles.container}>
                <h1>Sign in for Admin</h1>
                <p>Enter your email</p>
                <CustomTextField value={email} fullWidth className={styles.input_field} onChange={(val) => setEmail(val)} type="email" />
                <p>Enter password</p>
                <CustomTextField
                    value={password}
                    fullWidth
                    className={styles.input_field}
                    onChange={(val) => setPassword(val)}
                    type={isPassword ? "password" : "text"}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment style={{ cursor: "pointer" }} onClick={() => setIsPassword(!isPassword)} position="start">
                                <RemoveRedEyeIcon />
                            </InputAdornment>
                        ),
                    }}
                />

                <Button className={styles.button} onClick={handleSignin} variant="contained">
                    Sign in
                </Button>
            </div>
            {!!showLoader && <Loader />}
        </div>
    );
};

export default Signin;
