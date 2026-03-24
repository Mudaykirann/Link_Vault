import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { config } from "../config";
import { refreshToken as performTokenRefresh } from "../lib/apiClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');

            // If no token exists, don't make the request
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await fetch(`${config.apiUrl}/auth/check`, {
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            } else if (response.status === 401) {
                // Token expired, try to refresh
                const refreshed = await performTokenRefresh();
                if (refreshed) {
                    // Retry auth check with new token
                    await checkAuth();
                } else {
                    // Refresh failed, clear tokens and user
                    localStorage.removeItem('token');
                    localStorage.removeItem('refresh_token');
                    setUser(null);
                }
            } else {
                // If token is invalid, clear it and user data
                localStorage.removeItem('token');
                localStorage.removeItem('refresh_token');
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check error:', error);
            // On error, clear token and user data
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = (userData, token, refreshToken) => {
        setUser(userData);
        if (token) {
            localStorage.setItem('token', token);
        }
        if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    const refreshAuth = async () => {
        return await performTokenRefresh();
    };

    const value = {
        user,
        loading,
        login,
        logout,
        refreshAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
