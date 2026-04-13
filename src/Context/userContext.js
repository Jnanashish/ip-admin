import { createContext, useState, useEffect, useRef } from "react";
import { onAuthStateChanged, signOut, browserLocalPersistence, setPersistence } from "firebase/auth";
import { auth } from "../Config/firebase_config";

export const AUTH_LOGIN_TS_KEY = "auth_login_ts";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const isSessionExpired = () => {
    const loginTs = localStorage.getItem(AUTH_LOGIN_TS_KEY);
    if (!loginTs) return true;
    return Date.now() - Number(loginTs) > THIRTY_DAYS_MS;
};

export const UserContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const unsubscribeRef = useRef(null);

    useEffect(() => {
        setPersistence(auth, browserLocalPersistence)
            .then(() => {
                unsubscribeRef.current = onAuthStateChanged(auth, (firebaseUser) => {
                    if (firebaseUser) {
                        if (isSessionExpired()) {
                            localStorage.removeItem(AUTH_LOGIN_TS_KEY);
                            signOut(auth);
                            return;
                        }
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
        localStorage.removeItem(AUTH_LOGIN_TS_KEY);
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
