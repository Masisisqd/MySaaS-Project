"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";

export interface UserData {
    name: string;
    role: "CEO" | "BOARD";
    familyId: string;
    [key: string]: any;
}

interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userData: null,
    loading: true,
    logout: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // We only attach the listener if we have an auth object
        if (!auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    setUser(firebaseUser);

                    // Fetch additional user data, including role and familyId
                    const userDocRef = doc(db, "users", firebaseUser.uid);
                    const userDocSnap = await getDoc(userDocRef);

                    if (userDocSnap.exists()) {
                        setUserData(userDocSnap.data() as UserData);
                    } else {
                        console.warn("User document not found in Firestore.");
                        setUserData(null);
                    }
                } else {
                    setUser(null);
                    setUserData(null);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        try {
            if (auth) {
                await signOut(auth);
            }
            setUser(null);
            setUserData(null);
        } catch (error) {
            console.error("Failed to sign out", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, userData, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
