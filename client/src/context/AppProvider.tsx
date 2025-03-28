
import { ReactNode } from "react"
import { AppContextProvider } from "./AppContext.js"
import { AuthProvider } from "./AuthContext.tsx"
import { ChatContextProvider } from "./ChatContext.jsx"
import { FileContextProvider } from "./FileContext.jsx"
import { RunCodeContextProvider } from "./RunCodeContext.jsx"
import { SettingContextProvider } from "./SettingContext.jsx"
import { SocketProvider } from "./SocketContext.jsx"
import { ViewContextProvider } from "./ViewContext.js"
import { CopilotContextProvider } from "./CopilotContext.js"
import { VersionProvider } from "./VersionContext.tsx"
import { TestProvider } from "./TestContext.tsx"

function AppProvider({ children }: { children: ReactNode }) {
    return (
        <AppContextProvider>
            <SocketProvider>
                <AuthProvider>
                    <SettingContextProvider>
                        <ViewContextProvider>
                            <FileContextProvider>
                                <VersionProvider>
                                    <CopilotContextProvider>
                                        <TestProvider>
                                            <RunCodeContextProvider>
                                                <ChatContextProvider>
                                                    {children}
                                                </ChatContextProvider>
                                            </RunCodeContextProvider>
                                        </TestProvider>
                                    </CopilotContextProvider>
                                </VersionProvider>
                            </FileContextProvider>
                        </ViewContextProvider>
                    </SettingContextProvider>
                </AuthProvider>
            </SocketProvider>
        </AppContextProvider>
    )
}

export default AppProvider
