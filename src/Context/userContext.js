import { createContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut, browserSessionPersistence, setPersistence } from "firebase/auth";
import { auth } from "../Config/firebase_config";

export const UserContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Set Firebase to use browser session persistence (clears on browser close)
        setPersistence(auth, browserSessionPersistence)
            .then(() => {
                const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
                    if (firebaseUser) {
                        setUser({ email: firebaseUser.email });
                        setIsAdmin(firebaseUser.email === process.env.REACT_APP_ADMIN_EMAIL);
                    } else {
                        setUser(null);
                        setIsAdmin(false);
                    }
                    setLoading(false);
                });
                return () => unsubscribe();
            })
            .catch((error) => {
                console.error("Failed to set persistence:", error);
                setLoading(false);
            });
    }, []);

    const logout = async () => {
        await signOut(auth);
        setUser(null);
        setIsAdmin(false);
    };

    return (
        <UserContext.Provider value={{ user, setUser, isAdmin, setIsAdmin, loading, logout }}>
            {children}
        </UserContext.Provider>
    );
};
