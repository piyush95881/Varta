import jwt from "jsonwebtoken"
import User from "../models/user.model"
import {NextFunction,Request,Response} from "express";

export const protectedRoute = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const token=req.cookies.jwt;

        if(!token){
            res.status(401).json({error:"Unauthorised - No token provided"});
        }
        if(!process.env.JWT_SECRET){
            res.status(401).json({error:"JWT secret not provided"});
            return;
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded){
             res.status(401).json({error:"Unauthorised - No token provided"});
             return;
        }

        // @ts-ignore
        const user=await User.findById(decoded.userId).select("-password");
        if(!user){
            res.status(404).json({message:"User not found"});
        }
        // @ts-ignore
        req.user=user;
        next();

    }catch(err){
        console.log("Error in protectedRoute middleware: ",err);
        res.status(401).json({error:"Internal Server Error"});
    }
}