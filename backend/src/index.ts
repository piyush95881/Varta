import express from "express";
import authRoutes from "./routes/auth.route";
import chatRoutes from "./routes/chat.route";
import {app,server} from "./lib/socket";
import dotenv from "dotenv";
import {connectDB} from "./lib/db";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();


const PORT:number = parseInt(process.env.PORT || "5001",10);
// 10 for base 10

app.use(cookieParser());
app.use(cors(
    {
        origin:["http://localhost:5173","http://localhost:5174","http://localhost:5175"],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token']
    }
));
app.use(express.json());
app.use('/api/v1/auth',authRoutes);
app.use('/api/v1/chat',chatRoutes);


connectDB()
    .then(() => {
        server.listen(PORT, () => {
            console.log("Server running on port "+PORT);
        });
    })
    .catch((err:unknown) => {
        console.error("Failed to connect to DB", err);
    });