import {create} from 'zustand';
import {toast} from "react-hot-toast";
import {axiosInstance} from "../lib/axios.ts";

interface ChatStore {
    messages: any[];
    users: any[];
    selectedUser: any;
    isUserLoading: boolean;
    isMessagesLoading: boolean;
    getUsers: ()=>void;
    getMessages: (userId:string)=>void;
}

export const useChatStore = create<ChatStore>(set => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUserLoading: false,
    isMessagesLoading:false,

    getUsers: async()=>{
        set({isUserLoading:true});
        try{
            const res=await axiosInstance.get("/chat/users");
            set({users:res.data});
        }catch (err: any){
            toast.error(err?.response?.data?.message || "Failed to get users");
        }finally {
            set({isUserLoading:false});
        }
    },

    getMessages: async(userId)=>{
        set({isMessagesLoading:true});
        try{
            const res=await axiosInstance.get(`chat/${userId}`);
            set({messages:res.data});
        }catch (err){
            toast.error(err?.message?.data.message);
        }finally {
            set({isMessagesLoading:false});
        }
    }

}))