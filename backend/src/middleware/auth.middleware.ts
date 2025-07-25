import jwt_lib from "jsonwebtoken"
import User, { IUser } from "../models/user.model.ts"
import { NextFunction, Request, Response } from "express";

interface JwtPayload {
    userId: string;
}

interface AuthenticatedRequest extends Request {
    user?: IUser;
}

export const protectedRoute = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            res.status(401).json({ error: "Unauthorised - No token provided" });
            return;
        }
        if (!process.env.JWT_SECRET) {
            res.status(401).json({ error: "JWT secret not provided" });
            return;
        }
        const decoded = jwt_lib.verify(token, process.env.JWT_SECRET) as JwtPayload;
        if (!decoded) {
            res.status(401).json({ error: "Unauthorised - No token provided" });
            return;
        }

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        req.user = user;
        next();

    } catch (err) {
        console.log("Error in protectedRoute middleware: ", err);
        res.status(401).json({ error: "Internal Server Error" });
    }
}