import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
const AuthContext = createContext();

function AuthProvider ({children}) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL
                const response  = await axios.get(`${API_URL}/session-check`, {
                    withCredentials: true
                })
                const data = response.data;
                setUser(data);
            } catch (err) {
                if (err.response?.status === 401) {
                    setUser(null);
                } else {
                    alert("Error authenticating user");
                }
            } finally {
                setLoading(false);
            }
        }
        
        checkSession();
    }, []);

    return (
        <AuthContext.Provider value={{user, setUser, loading}}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export default AuthProvider

export const useAuth = () => useContext(AuthContext)