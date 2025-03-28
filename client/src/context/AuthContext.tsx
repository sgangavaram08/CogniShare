
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { AuthState, AuthUser, LoginCredentials, RegisterCredentials } from "@/types/auth";

interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => void;
    updateUser: (user: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        error: null
    });

    useEffect(() => {
        const checkAuthStatus = async () => {
            const token = localStorage.getItem("authToken");
            
            if (!token) {
                setAuthState(prev => ({ ...prev, isLoading: false }));
                return;
            }
            
            try {
                const response = await axios.get(`${API_URL}/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                setAuthState({
                    user: response.data,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null
                });
            } catch (error) {
                localStorage.removeItem("authToken");
                setAuthState({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: "Session expired. Please login again."
                });
            }
        };
        
        checkAuthStatus();
    }, []);

    const login = async (credentials: LoginCredentials) => {
        try {
            setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
            
            const response = await axios.post(`${API_URL}/auth/login`, credentials);
            const { token, user } = response.data;
            
            localStorage.setItem("authToken", token);
            
            setAuthState({
                user,
                isAuthenticated: true,
                isLoading: false,
                error: null
            });
            
            toast.success(`Welcome back, ${user.username}!`);
        } catch (error: any) {
            setAuthState(prev => ({
                ...prev,
                isLoading: false,
                error: error.response?.data?.message || "Login failed. Please try again."
            }));
            toast.error(error.response?.data?.message || "Login failed. Please try again.");
        }
    };

    const register = async (credentials: RegisterCredentials) => {
        try {
            setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
            
            const response = await axios.post(`${API_URL}/auth/register`, credentials);
            const { token, user } = response.data;
            
            localStorage.setItem("authToken", token);
            
            setAuthState({
                user,
                isAuthenticated: true,
                isLoading: false,
                error: null
            });
            
            toast.success(`Welcome, ${user.username}!`);
        } catch (error: any) {
            setAuthState(prev => ({
                ...prev,
                isLoading: false,
                error: error.response?.data?.message || "Registration failed. Please try again."
            }));
            toast.error(error.response?.data?.message || "Registration failed. Please try again.");
        }
    };

    const logout = () => {
        localStorage.removeItem("authToken");
        setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
        });
        toast.success("You have been logged out.");
    };

    const updateUser = (updatedData: Partial<AuthUser>) => {
        if (!authState.user) return;
        
        setAuthState(prev => ({
            ...prev,
            user: { ...prev.user!, ...updatedData }
        }));
    };

    return (
        <AuthContext.Provider value={{
            ...authState,
            login,
            register,
            logout,
            updateUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};
