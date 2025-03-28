
export interface CodeVersion {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    createdBy: string;
    fileStructure: any;
}

export interface VersionControl {
    versions: CodeVersion[];
    currentVersion: CodeVersion | null;
    isLoading: boolean;
    error: string | null;
}

export enum CodeFreezeStatus {
    ACTIVE = "active",
    INACTIVE = "inactive"
}

export interface CodeFreeze {
    status: CodeFreezeStatus;
    frozenBy: string | null;
    frozenAt: string | null;
    reason: string | null;
}
