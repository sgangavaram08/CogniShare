
import { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "react-hot-toast";
import { TestCase, TestResult, TestState } from "@/types/test";
import { useAuth } from "./AuthContext";
import axios from "axios";
import { v4 as uuid } from "uuid";
import { useFileContext } from "./FileContext";

interface TestContextType extends TestState {
    generateTest: (fileId: string) => Promise<TestCase | null>;
    runTest: (testId: string) => Promise<TestResult | null>;
    runAllTests: () => Promise<void>;
    deleteTest: (testId: string) => void;
    clearTests: () => void;
}

const TestContext = createContext<TestContextType | null>(null);

export const useTest = () => {
    const context = useContext(TestContext);
    if (!context) {
        throw new Error("useTest must be used within a TestProvider");
    }
    return context;
};

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const TestProvider = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated } = useAuth();
    const { getFileById } = useFileContext();
    
    const [testState, setTestState] = useState<TestState>({
        tests: [],
        isGenerating: false,
        isRunning: false,
        error: null
    });

    const generateTest = async (fileId: string): Promise<TestCase | null> => {
        if (!isAuthenticated) {
            toast.error("You must be logged in to generate tests");
            return null;
        }
        
        try {
            setTestState(prev => ({ ...prev, isGenerating: true, error: null }));
            
            const file = getFileById(fileId);
            if (!file || file.type !== "file" || !file.content) {
                throw new Error("Invalid file selected for test generation");
            }
            
            // We'll simulate test generation here since we don't have a backend API yet
            // In a real implementation, this would call an API endpoint
            
            // Simulating API call delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const newTest: TestCase = {
                id: uuid(),
                name: `Test for ${file.name}`,
                description: `Automated test for ${file.name}`,
                fileId: file.id,
                code: generateTestCode(file.name, file.content),
                result: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            setTestState(prev => ({
                ...prev,
                tests: [...prev.tests, newTest],
                isGenerating: false
            }));
            
            toast.success(`Test generated for ${file.name}`);
            return newTest;
            
        } catch (error: any) {
            const errorMessage = error.message || "Failed to generate test";
            setTestState(prev => ({
                ...prev,
                isGenerating: false,
                error: errorMessage
            }));
            toast.error(errorMessage);
            return null;
        }
    };

    const runTest = async (testId: string): Promise<TestResult | null> => {
        try {
            setTestState(prev => ({ ...prev, isRunning: true, error: null }));
            
            const test = testState.tests.find(t => t.id === testId);
            if (!test) {
                throw new Error("Test not found");
            }
            
            // Simulate test execution
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const isPassing = Math.random() > 0.3; // 70% chance of passing
            
            const result: TestResult = {
                status: isPassing ? "passed" : "failed",
                message: isPassing ? "All assertions passed" : "Test failed: Expected values don't match",
                duration: Math.floor(Math.random() * 500) + 100 // Random duration between 100-600ms
            };
            
            const updatedTests = testState.tests.map(t => {
                if (t.id === testId) {
                    return { ...t, result, updatedAt: new Date().toISOString() };
                }
                return t;
            });
            
            setTestState(prev => ({
                ...prev,
                tests: updatedTests,
                isRunning: false
            }));
            
            if (isPassing) {
                toast.success(`Test passed in ${result.duration}ms`);
            } else {
                toast.error(`Test failed: ${result.message}`);
            }
            
            return result;
            
        } catch (error: any) {
            const errorMessage = error.message || "Failed to run test";
            setTestState(prev => ({
                ...prev,
                isRunning: false,
                error: errorMessage
            }));
            toast.error(errorMessage);
            return null;
        }
    };

    const runAllTests = async () => {
        if (testState.tests.length === 0) {
            toast.error("No tests to run");
            return;
        }
        
        try {
            setTestState(prev => ({ ...prev, isRunning: true, error: null }));
            
            toast.loading(`Running ${testState.tests.length} tests...`);
            
            // Run tests sequentially for simplicity
            for (const test of testState.tests) {
                await runTest(test.id);
            }
            
            setTestState(prev => ({
                ...prev,
                isRunning: false
            }));
            
            const passedCount = testState.tests.filter(t => t.result?.status === "passed").length;
            toast.success(`Tests completed: ${passedCount}/${testState.tests.length} passed`);
            
        } catch (error: any) {
            const errorMessage = error.message || "Failed to run all tests";
            setTestState(prev => ({
                ...prev,
                isRunning: false,
                error: errorMessage
            }));
            toast.error(errorMessage);
        }
    };

    const deleteTest = (testId: string) => {
        setTestState(prev => ({
            ...prev,
            tests: prev.tests.filter(t => t.id !== testId)
        }));
        toast.success("Test deleted");
    };

    const clearTests = () => {
        setTestState(prev => ({
            ...prev,
            tests: []
        }));
        toast.success("All tests cleared");
    };

    // Helper function to generate test code based on file content
    const generateTestCode = (fileName: string, fileContent: string): string => {
        // This is a simplified test generation that doesn't actually analyze the code
        // In a real implementation, you might use an AI service or more sophisticated parsing
        
        if (fileName.endsWith(".js") || fileName.endsWith(".jsx") || 
            fileName.endsWith(".ts") || fileName.endsWith(".tsx")) {
            // JavaScript/TypeScript test template
            return `
import { describe, it, expect } from 'jest';
${fileName.includes("component") || fileName.includes("Component") ? 
  `import { render, screen } from '@testing-library/react';
import ${fileName.split('.')[0]} from './${fileName.split('.')[0]}';` : ''}

describe('${fileName.split('.')[0]}', () => {
  it('should work as expected', () => {
    // TODO: Write assertions based on the file's functionality
    expect(true).toBe(true);
  });
});`;
        } else {
            // Generic test template
            return `
// Test for ${fileName}
console.log('Testing ${fileName}...');
// TODO: Write appropriate tests for this file type
`;
        }
    };

    return (
        <TestContext.Provider value={{
            ...testState,
            generateTest,
            runTest,
            runAllTests,
            deleteTest,
            clearTests
        }}>
            {children}
        </TestContext.Provider>
    );
};
