import { createContext, useState, useEffect, useRef } from "react";
import { onAuthStateChanged, signOut, browserSessionPersistence, setPersistence } from "firebase/auth";
import { auth } from "../Config/firebase_config";

export const UserContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const unsubscribeRef = useRef(null);

    useEffect(() => {
        setPersistence(auth, browserSessionPersistence)
            .then(() => {
                unsubscribeRef.current = onAuthStateChanged(auth, (firebaseUser) => {
                    if (firebaseUser) {
                        setUser({ email: firebaseUser.email });
                        // NOTE: Client-side admin check — backend should verify via Firebase Custom Claims
                        setIsAdmin(firebaseUser.email === process.env.REACT_APP_ADMIN_EMAIL);
                    } else {
                        setUser(null);
                        setIsAdmin(false);
                    }
                    setLoading(false);
                });
            })
            .catch(() => {
                setLoading(false);
            });

        return () => {
            if (unsubscribeRef.current) unsubscribeRef.current();
        };
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
