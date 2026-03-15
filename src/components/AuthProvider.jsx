import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

function AuthProvider ({children}) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch('http://localhost:8080/session-check', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                })
                const data = await response.json();
                if (response.status == 401) {
                    return response.json();
                } else {
                    console.log('authenticated!')
                    setUser(data);
                    setLoading(false);
                }
            } catch {
                alert('Error authenticating user.');
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