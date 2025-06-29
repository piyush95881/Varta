import {Response} from "express";
import jwt from 'jsonwebtoken';
import { Types } from "mongoose";

export const generateToken = async (userId: Types.ObjectId,res:Response)=>{

    if(!process.env.JWT_SECRET || !process.env.NODE_ENV){
        console.error("❌ JWT_SECRET or NODE_ENV is not defined in environment variables.");
        process.exit(1);
    }
    const token = jwt.sign({userId:userId.toString()},process.env.JWT_SECRET,{
        expiresIn: '7d'
    });

    res.cookie("jwt",token,{
        httpOnly:true,
        maxAge:1000*60*60*24*7,
        sameSite:"strict",
        secure:process.env.NODE_ENV !== 'development'
    });

    return token;
}