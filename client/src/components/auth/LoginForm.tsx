
import { useState, FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

const LoginForm = ({ onToggleForm }: { onToggleForm: () => void }) => {
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        if (!email || !password) {
            toast.error("Please fill in all fields");
            return;
        }
        
        await login({ email, password });
    };

    return (
        <div className="w-full max-w-md p-6 bg-darkHover rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Login to Code-Sync</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-dark border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="your@email.com"
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-1">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-dark border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="••••••••"
                        disabled={isLoading}
                    />
                </div>
                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-primary text-black font-semibold rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50"
                    disabled={isLoading}
                >
                    {isLoading ? "Logging in..." : "Login"}
                </button>
                <div className="text-center mt-4">
                    <button
                        type="button"
                        onClick={onToggleForm}
                        className="text-sm text-primary hover:underline"
                    >
                        Need an account? Register
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LoginForm;
