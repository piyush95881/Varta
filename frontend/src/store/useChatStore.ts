import { create } from 'zustand';
import { toast } from "react-hot-toast";
import { axiosInstance } from "../lib/axios.ts";
import type { IUser } from "../types/user.ts";
import {useAuthStore} from "./useAuthStore.ts";

interface Message {
    _id: string;
    text?: string;
    picture?: string;
    sender: string;
    receiver: string;
    createdAt: string;
    // Add other message properties as needed
}

interface MessageData {
    text?: string;
    picture?: string | null;
}

interface ChatStore {
    messages: Message[];
    users: IUser[];
    selectedUser: IUser | null | undefined;
    isUsersLoading: boolean;
    isMessagesLoading: boolean;
    getUsers: () => Promise<void>;
    getMessages: (userId: string) => Promise<void>;
    sendMessage: (messageData: MessageData) => Promise<void>;
    subscribeToMessages:()=>void;
    unsubscribeFromMessages:()=>void;
    setSelectedUser: (user: IUser | null) => void;  // Fixed: Allow null
}

export const useChatStore = create<ChatStore>((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get<IUser[]>("/chat/users");
            const fetchedUsers = Array.isArray(res.data) ? res.data : [];
            set({ users: fetchedUsers });
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error?.response?.data?.message || "Failed to get users");
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId: string) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get<Message[]>(`chat/${userId}`);
            set({ messages: res.data });
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error?.response?.data?.message || "Failed to get messages");
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData: MessageData) => {
        const { selectedUser, messages } = get();
        if (!selectedUser) {
            toast.error("No user selected");
            return;
        }

        try {
            const res = await axiosInstance.post<Message>(
                `chat/send/${selectedUser._id}`,
                messageData
            );
            set({ messages: [...messages, res.data] });
            toast.success("Message sent successfully");
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error?.response?.data?.message || "Failed to send message");
            console.error("Error in sendMessage", err);
        }
    },

    subscribeToMessages:()=>{
        const {selectedUser}=get();
        if(!selectedUser) return ;

        const socket=useAuthStore.getState().socket;

        socket.on("newMessage",(newMessage:any)=>{
            set({
                messages:[...get().messages,newMessage],
            })
        })
    },

    unsubscribeFromMessages:()=>{
        const socket=useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    setSelectedUser: (user: IUser | null) => set({ selectedUser: user })  // Fixed: Allow null
}));