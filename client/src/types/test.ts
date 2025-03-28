
export interface TestCase {
    id: string;
    name: string;
    description: string;
    fileId: string;
    code: string;
    result: TestResult | null;
    createdAt: string;
    updatedAt: string;
}

export interface TestResult {
    status: "passed" | "failed" | "error" | "pending";
    message: string;
    duration: number;
}

export interface TestState {
    tests: TestCase[];
    isGenerating: boolean;
    isRunning: boolean;
    error: string | null;
}
