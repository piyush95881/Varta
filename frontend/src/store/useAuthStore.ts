import { create } from "zustand/react";
import { axiosInstance } from "../lib/axios.ts";
import type { IUser } from "../types/user.ts";
import toast from "react-hot-toast";
import io from "socket.io-client";

const BASE_URL = "http://localhost:5001";

interface SignupPayload {
    fullName: string;
    email: string;
    password: string;
}
interface LoginPayload {
    email: string;
    password: string;
}
interface AuthState {
    authUser: IUser | null;
    isSigningUp: boolean;
    isLoggingIn: boolean;
    isUpdatingProfile: boolean;
    isCheckingAuth: boolean;
    onlineUsers: IUser[];
    socket: any;
    connectSocket: ()=>Promise<void>;
    disconnectSocket: ()=>Promise<void>;
    checkAuth: () => Promise<void>;
    signup: (data: SignupPayload) => Promise<void>;
    logout: ()=>Promise<void>;
    login: (data: LoginPayload)=>Promise<void>;
    updateProfile: (data: { profilePic: string | ArrayBuffer | null })=>Promise<void>;
}

export const useAuthStore = create<AuthState>((set,get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket:null,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data });
            get().connectSocket()
        } catch (err) {
            console.error("Error in checkAuth", err);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authUser: res.data });
            toast.success("Account Created Successfully");
            get().connectSocket()
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Signup failed");
        } finally {
            set({ isSigningUp: false });
        }
    },

    logout: async ()=>{
        try{
            await axiosInstance.post("/auth/logout");
            set({authUser:null});
            toast.success("Logged out successfully");
            get().disconnectSocket()
        }catch (err: any){
            toast.error(err?.response?.data?.message || "Logout Failed");
        }
    },
    login:async (data)=>{
        set({isLoggingIn:true});
        try{
            await axiosInstance.post("/auth/login",data);
            set({authUser:null});
            toast.success("Logged in successfully");

            get().connectSocket()
        }catch (err: any){
            toast.error(err?.response?.data?.message || "Login Failed");
        }finally {
            set({isLoggingIn:false});
        }
    },
    updateProfile:async (data)=>{
        set({isUpdatingProfile:true});
        try{
            const res=await axiosInstance.put("/auth/update-profile",data);
            set({authUser:res.data});
            toast.success("Profile Updated Successfully");
        }catch (err: any){
            toast.error(err?.response?.data?.message || "Profile Update Failed");
        }finally {
            set({isUpdatingProfile:false});
        }
    },
    connectSocket: async ()=>{
        const {authUser}=get();
        if(!authUser || get().socket?.connected){
            return;
        }
        const socket=io(BASE_URL,{
            query:{
                userId:authUser._id,
            },
        });
        socket.connect();

        set({socket:socket});

        socket.on("getOnlineUsers",(userIds)=>{
            set({onlineUsers:userIds});
        })

    },
    disconnectSocket:async()=>{
        if(get().socket?.connected){
            get().socket.disconnect();
        }
    },
}));
