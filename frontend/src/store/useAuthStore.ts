import { create } from "zustand/react";
import { axiosInstance } from "../lib/axios.ts";
import type { IUser } from "../types/user.ts";
import toast from "react-hot-toast";

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
    checkAuth: () => Promise<void>;
    signup: (data: SignupPayload) => Promise<void>;
    logout: ()=>Promise<void>;
    login: (data: LoginPayload)=>Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data });
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
        }catch (err: any){
            toast.error(err?.response?.data?.message || "Login Failed");
        }finally {
            set({isLoggingIn:false});
        }
    }
}));
