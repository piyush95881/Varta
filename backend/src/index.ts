import express, { Request, Response } from "express";
import authRoutes from "./routes/auth.route.ts";
import chatRoutes from "./routes/chat.route.ts";
import { app, server } from "./lib/socket.ts";
import dotenv from "dotenv";
import path from "node:path";
import cookieParser from "cookie-parser";
import cors from "cors";
import { fileURLToPath } from "node:url";
import { connectDB } from "./lib/db.ts";

dotenv.config();

const PORT: number = parseInt(process.env.PORT || "5001", 10);

// Fix __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
  })
);

app.use(express.json());
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/chat", chatRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "public")));

  app.get("*", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });
}

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log("Server running on port " + PORT);
    });
  })
  .catch((err: unknown) => {
    console.error("Failed to connect to DB", err);
  });