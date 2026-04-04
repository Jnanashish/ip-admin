import React, { useState, useContext } from "react";
import { Navigate } from "react-router-dom";
import { showErrorToast } from "../../Helpers/toast";

import { UserContext } from "../../Context/userContext";
import { Button } from "Components/ui/button";
import CustomTextField from "../../Components/Input/Textfield";
import { Eye, EyeOff } from "lucide-react";
import Loader from "../../Components/Loader";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../Config/firebase_config";

const Signin = () => {
    const { user } = useContext(UserContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isPassword, setIsPassword] = useState(true);
    const [showLoader, setShowLoader] = useState(false);

    const handleSignin = () => {
        setShowLoader(true);

        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                setShowLoader(false);
                localStorage.setItem("loginTimestamp", Date.now().toString());
            })
            .catch((err) => {
                setShowLoader(false);
                showErrorToast(err.message);
            });
    };

    if (user?.email) {
        return <Navigate to="/addjob" />;
    }

    return (
        <div className="relative">
            <div className="flex flex-col mt-[100px] mx-auto items-start text-left w-[60%] max-lg:w-[90%] max-lg:mt-[50px] space-y-5">
                <h1>Sign in for Admin</h1>
                <p>Enter your email</p>
                <CustomTextField value={email} fullWidth onChange={(val) => setEmail(val)} type="email" />
                <p>Enter password</p>
                <div className="relative w-full">
                    <CustomTextField
                        value={password}
                        fullWidth
                        onChange={(val) => setPassword(val)}
                        type={isPassword ? "password" : "text"}
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-1/2 translate-y-[-20%] text-gray-500 hover:text-gray-700"
                        onClick={() => setIsPassword(!isPassword)}
                    >
                        {isPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                    </button>
                </div>

                <Button className="w-full mt-8 capitalize" onClick={handleSignin} variant="default">
                    Sign in
                </Button>
            </div>
            {!!showLoader && <Loader />}
        </div>
    );
};

export default Signin;
