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

            if (!token) {
                setLoading(false);
                return;
            }

            const response = await fetch(`${config.apiUrl}/auth/check`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            } else if (response.status === 401) {
                const refreshed = await performTokenRefresh();
                if (refreshed) {
                    await checkAuth();
                } else {
                    localStorage.removeItem('token');
                    localStorage.removeItem('refresh_token');
                    setUser(null);
                }
            } else {
                console.warn('Auth check returned status:', response.status);
            }
        } catch (error) {
            console.warn('Network error during auth check:', error);
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

    const updateProfile = async (profileData) => {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${config.apiUrl}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || data.message || 'Failed to update profile');
        }

        setUser(prev => ({
            ...prev,
            ...data.user
        }));

        return data.user;
    };

    const value = {
        user,
        loading,
        login,
        logout,
        refreshAuth,
        updateProfile,
        checkAuth,
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

export default AuthContext;
