import {Server} from "socket.io";
import * as http from "node:http";
import express,{Application} from "express"

interface UserSocketMap {
    [userId: string]: string;
}

const app:Application=express()
const server=http.createServer(app);

const io=new Server(server,{
    cors:{
        origin:["http://localhost:5173","http://localhost:5174","http://localhost:5175","http://localhost:5176"],
        credentials:true
    }
});
const userSocketMap:UserSocketMap={};

export function getReceiverSocketid(userId:string):string|undefined{
    return userSocketMap[userId]
}


io.on("connection",(socket)=>{
    console.log("New connection",socket.id);

    const userId=socket.handshake.query.userId as string;
    if(userId){
        userSocketMap[userId]=socket.id;
    }
    io.emit("getOnlineUsers",Object.keys(userSocketMap));
    socket.on("disconnect",()=>{
        console.log("A User Disconnected",socket.id);
        if(userId){
            delete userSocketMap[userId];
        }
        io.emit("getOnlineUsers",Object.keys(userSocketMap));
    })
})

export {io,app,server};