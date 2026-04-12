import React, { useState, useContext } from "react";
import { Navigate } from "react-router-dom";
import { showErrorToast } from "../../Helpers/toast";

import { UserContext, AUTH_LOGIN_TS_KEY } from "../../Context/userContext";
import { Button } from "Components/ui/button";
import CustomTextField from "../../Components/Input/Textfield";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "Components/ui/card";
import { Eye, EyeOff, LayoutList } from "lucide-react";
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
                localStorage.setItem(AUTH_LOGIN_TS_KEY, String(Date.now()));
                setShowLoader(false);
            })
            .catch((err) => {
                setShowLoader(false);
                const errorMessage =
                    err.code?.includes("wrong-password") || err.code?.includes("user-not-found")
                        ? "Invalid email or password"
                        : "Sign in failed. Please try again.";
                showErrorToast(errorMessage);
            });
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleSignin();
    };

    if (user?.email) {
        return <Navigate to="/addjob" />;
    }

    return (
        <div className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-sm shadow-lg border-0">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                            <LayoutList className="h-6 w-6" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">Sign in</CardTitle>
                    <CardDescription>Admin Panel — CareersAtTech</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Email</label>
                        <CustomTextField
                            value={email}
                            fullWidth
                            onChange={(val) => setEmail(val)}
                            type="email"
                            placeholder="admin@example.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Password</label>
                        <div className="relative">
                            <CustomTextField
                                value={password}
                                fullWidth
                                onChange={(val) => setPassword(val)}
                                type={isPassword ? "password" : "text"}
                                onKeyUp={handleKeyDown}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                onClick={() => setIsPassword(!isPassword)}
                            >
                                {isPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <Button className="w-full capitalize shadow-sm hover:shadow-md transition-all" onClick={handleSignin} variant="default">
                        {showLoader ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                            "Sign in"
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default Signin;
