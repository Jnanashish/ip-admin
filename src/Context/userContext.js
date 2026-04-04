import { createContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../Config/firebase_config";

export const UserContext = createContext();

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                const loginTimestamp = localStorage.getItem("loginTimestamp");
                if (loginTimestamp && Date.now() - parseInt(loginTimestamp) > SESSION_DURATION_MS) {
                    signOut(auth);
                    localStorage.removeItem("loginTimestamp");
                    setUser(null);
                    setIsAdmin(false);
                } else {
                    setUser({ email: firebaseUser.email });
                    setIsAdmin(firebaseUser.email === process.env.REACT_APP_ADMIN_EMAIL);
                    if (!loginTimestamp) {
                        localStorage.setItem("loginTimestamp", Date.now().toString());
                    }
                }
            } else {
                setUser(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await signOut(auth);
        localStorage.removeItem("loginTimestamp");
        setUser(null);
        setIsAdmin(false);
    };

    return (
        <UserContext.Provider value={{ user, setUser, isAdmin, setIsAdmin, loading, logout }}>
            {children}
        </UserContext.Provider>
    );
};
