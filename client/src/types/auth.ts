
export interface AuthUser {
    id: string;
    email: string;
    username: string;
    avatar?: string;
    isAdmin?: boolean;
}

export interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials extends LoginCredentials {
    username: string;
}
