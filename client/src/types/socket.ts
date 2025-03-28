
import { Socket } from "socket.io-client"

type SocketId = string

export enum SocketEvent {
    JOIN_REQUEST = "join-request",
    JOIN_ACCEPTED = "join-accepted",
    USERNAME_EXISTS = "username-exists", 
    USER_JOINED = "user-joined",
    USER_DISCONNECTED = "user-disconnected",
    USER_OFFLINE = "user-offline",
    USER_ONLINE = "user-online",
    SYNC_FILE_STRUCTURE = "sync-file-structure",
    DIRECTORY_CREATED = "directory-created",
    DIRECTORY_UPDATED = "directory-updated",
    DIRECTORY_RENAMED = "directory-renamed",
    DIRECTORY_DELETED = "directory-deleted",
    FILE_CREATED = "file-created",
    FILE_UPDATED = "file-updated",
    FILE_RENAMED = "file-renamed",
    FILE_DELETED = "file-deleted",
    TYPING_START = "typing-start",
    TYPING_PAUSE = "typing-pause",
    SEND_MESSAGE = "send-message",
    RECEIVE_MESSAGE = "receive-message",
    REQUEST_DRAWING = "request-drawing",
    SYNC_DRAWING = "sync-drawing",
    DRAWING_UPDATE = "drawing-update",
    
    CODE_FREEZE_UPDATE = "code-freeze-update",
    VERSION_CREATED = "version-created",
    VERSION_SWITCHED = "version-switched",
    VERSION_DELETED = "version-deleted",
    TEST_GENERATED = "test-generated",
    TEST_RUN = "test-run",
    TEST_RESULT = "test-result",
    AUTH_STATUS = "auth-status"
}

interface SocketContext {
    socket: Socket
}

export type { SocketContext, SocketId }
