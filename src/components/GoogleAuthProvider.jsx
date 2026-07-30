import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
export const GoogleAuthContext = createContext();

function GoogleAuthProvider ({children}) {
    const [pendingUser, setPendingUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL
                const response  = await axios.get(`${API_URL}/google-session-check`, {
                    withCredentials: true
                })
                const data = await response.data;
                
                setPendingUser(data);
            } catch (err) {
                if (err.response?.status === 401) {
                    setPendingUser(null);
                } else {
                    alert("Error authenticating Google user");
                }
            } finally {
                setLoading(false);
            }
        }
        
        checkSession();
    }, []);

    return (
        <GoogleAuthContext.Provider value={{pendingUser, setPendingUser, loading}}>
            {!loading && children}
        </GoogleAuthContext.Provider>
    );
}

export default GoogleAuthProvider