
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "./AuthContext";
import { CodeFreeze, CodeFreezeStatus, CodeVersion, VersionControl } from "@/types/version";
import { useFileContext } from "./FileContext";
import { useSocket } from "./SocketContext";
import { SocketEvent } from "@/types/socket";

interface VersionContextType {
    versions: CodeVersion[];
    currentVersion: CodeVersion | null;
    isLoading: boolean;
    error: string | null;
    codeFreeze: CodeFreeze;
    createVersion: (name: string, description: string) => Promise<void>;
    switchVersion: (versionId: string) => Promise<void>;
    deleteVersion: (versionId: string) => Promise<void>;
    toggleCodeFreeze: (reason?: string) => Promise<void>;
}

const VersionContext = createContext<VersionContextType | null>(null);

export const useVersionControl = () => {
    const context = useContext(VersionContext);
    if (!context) {
        throw new Error("useVersionControl must be used within a VersionProvider");
    }
    return context;
};

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const VersionProvider = ({ children }: { children: ReactNode }) => {
    const { user, isAuthenticated } = useAuth();
    const { fileStructure, setFileStructure } = useFileContext();
    const { socket } = useSocket();
    
    const [versionState, setVersionState] = useState<VersionControl>({
        versions: [],
        currentVersion: null,
        isLoading: false,
        error: null
    });

    const [codeFreeze, setCodeFreeze] = useState<CodeFreeze>({
        status: CodeFreezeStatus.INACTIVE,
        frozenBy: null,
        frozenAt: null,
        reason: null
    });

    useEffect(() => {
        if (isAuthenticated) {
            fetchVersions();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (!socket) return;

        // Listen for code freeze updates from other users
        socket.on(SocketEvent.CODE_FREEZE_UPDATE, (freezeData: CodeFreeze) => {
            setCodeFreeze(freezeData);
            if (freezeData.status === CodeFreezeStatus.ACTIVE) {
                toast.error(`Code has been frozen by ${freezeData.frozenBy}: ${freezeData.reason}`);
            } else {
                toast.success("Code freeze has been lifted");
            }
        });

        return () => {
            socket.off(SocketEvent.CODE_FREEZE_UPDATE);
        };
    }, [socket]);

    const fetchVersions = async () => {
        if (!isAuthenticated) return;
        
        try {
            setVersionState(prev => ({ ...prev, isLoading: true }));
            const token = localStorage.getItem("authToken");
            
            const response = await axios.get(`${API_URL}/versions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setVersionState({
                versions: response.data.versions,
                currentVersion: response.data.currentVersion,
                isLoading: false,
                error: null
            });
            
        } catch (error: any) {
            setVersionState(prev => ({
                ...prev,
                isLoading: false,
                error: error.response?.data?.message || "Failed to fetch versions"
            }));
        }
    };

    const createVersion = async (name: string, description: string) => {
        if (!isAuthenticated || !user) {
            toast.error("You must be logged in to create a version");
            return;
        }
        
        try {
            setVersionState(prev => ({ ...prev, isLoading: true }));
            const token = localStorage.getItem("authToken");
            
            const versionData = {
                name,
                description,
                fileStructure
            };
            
            const response = await axios.post(`${API_URL}/versions`, versionData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setVersionState(prev => ({
                ...prev,
                versions: [...prev.versions, response.data],
                currentVersion: response.data,
                isLoading: false
            }));
            
            toast.success(`Version "${name}" created successfully`);
            
        } catch (error: any) {
            setVersionState(prev => ({
                ...prev,
                isLoading: false,
                error: error.response?.data?.message || "Failed to create version"
            }));
            toast.error(error.response?.data?.message || "Failed to create version");
        }
    };

    const switchVersion = async (versionId: string) => {
        if (!isAuthenticated) {
            toast.error("You must be logged in to switch versions");
            return;
        }
        
        try {
            setVersionState(prev => ({ ...prev, isLoading: true }));
            const token = localStorage.getItem("authToken");
            
            const response = await axios.get(`${API_URL}/versions/${versionId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const selectedVersion = response.data;
            
            // Update the file structure with the version's structure
            setFileStructure(selectedVersion.fileStructure);
            
            setVersionState(prev => ({
                ...prev,
                currentVersion: selectedVersion,
                isLoading: false
            }));
            
            toast.success(`Switched to version "${selectedVersion.name}"`);
            
        } catch (error: any) {
            setVersionState(prev => ({
                ...prev,
                isLoading: false,
                error: error.response?.data?.message || "Failed to switch version"
            }));
            toast.error(error.response?.data?.message || "Failed to switch version");
        }
    };

    const deleteVersion = async (versionId: string) => {
        if (!isAuthenticated) {
            toast.error("You must be logged in to delete a version");
            return;
        }
        
        try {
            setVersionState(prev => ({ ...prev, isLoading: true }));
            const token = localStorage.getItem("authToken");
            
            await axios.delete(`${API_URL}/versions/${versionId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setVersionState(prev => ({
                ...prev,
                versions: prev.versions.filter(v => v.id !== versionId),
                currentVersion: prev.currentVersion?.id === versionId ? null : prev.currentVersion,
                isLoading: false
            }));
            
            toast.success("Version deleted successfully");
            
        } catch (error: any) {
            setVersionState(prev => ({
                ...prev,
                isLoading: false,
                error: error.response?.data?.message || "Failed to delete version"
            }));
            toast.error(error.response?.data?.message || "Failed to delete version");
        }
    };

    const toggleCodeFreeze = async (reason?: string) => {
        if (!isAuthenticated || !user) {
            toast.error("You must be logged in to toggle code freeze");
            return;
        }
        
        const newStatus = codeFreeze.status === CodeFreezeStatus.ACTIVE 
            ? CodeFreezeStatus.INACTIVE 
            : CodeFreezeStatus.ACTIVE;
            
        const newFreezeState: CodeFreeze = {
            status: newStatus,
            frozenBy: newStatus === CodeFreezeStatus.ACTIVE ? user.username : null,
            frozenAt: newStatus === CodeFreezeStatus.ACTIVE ? new Date().toISOString() : null,
            reason: newStatus === CodeFreezeStatus.ACTIVE ? reason || null : null
        };
        
        try {
            // Update local state
            setCodeFreeze(newFreezeState);
            
            // Broadcast to room
            if (socket) {
                socket.emit(SocketEvent.CODE_FREEZE_UPDATE, newFreezeState);
            }
            
            if (newStatus === CodeFreezeStatus.ACTIVE) {
                toast.success("Code freeze activated");
            } else {
                toast.success("Code freeze deactivated");
            }
            
        } catch (error: any) {
            toast.error("Failed to toggle code freeze");
        }
    };

    return (
        <VersionContext.Provider value={{
            ...versionState,
            codeFreeze,
            createVersion,
            switchVersion,
            deleteVersion,
            toggleCodeFreeze
        }}>
            {children}
        </VersionContext.Provider>
    );
};
