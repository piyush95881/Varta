import { Request, Response } from "express";
import User from "../models/user.model";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils";
import {Types} from "mongoose";

interface SignupRequestBody {
    fullName: string;
    email: string;
    password: string;
    // checkpoint for something missing
}
interface LoginRequestBody {
    email: string;
    password: string;
}
interface UpdateProfileRequestBody {
    fullName: string;
    profilePic: string;
}

export const signup = async (req: Request<{}, {}, SignupRequestBody>, res: Response):Promise<void> => {
    const { fullName, email, password } = req.body;

    try {
        if (password.length < 6) {
            res.status(400).json({ message: "Password must be at least 6 characters" });
            return;
            // because promise void can't let you return anything
        }

        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            res.status(400).json({ message: "Email already exists" });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email: email.toLowerCase().trim(),
            password: hashedPassword,
        });

        await newUser.save();
        await generateToken(newUser._id as Types.ObjectId, res);

        res.status(201).json({
            _id: newUser._id,
            fullName,
            email,
            message: "Successfully registered"
        });

    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


export const login= async (req: Request<{},{},LoginRequestBody>,res:Response):Promise<void> => {
    const {email, password} = req.body;
    try{
        if(!email || !password){
            res.status(400).json({ message: "Both Email and Password are required" });
            return;
        }
        const existingUser=await User.findOne({email:email});
        if (!existingUser) {
            res.status(400).json({ message: "Invalid Credentials" });
            return;
        }
        const success=await bcrypt.compare(password,existingUser.password);
        if(!success){
            res.status(400).json({ message: "Invalid Credentials" });
        }
        await generateToken(existingUser._id as Types.ObjectId,res);
        res.status(201).json({
            _id:existingUser._id,
            fullName:existingUser.fullName,
            email:existingUser.email,
            message:"Logged in Successfully"
        })

    }catch(err){
        console.error("Signup error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const logout= async (_req:Request ,res:Response):Promise<void> => {
    try{
        res.cookie("jwt","",{
            maxAge:0,
            sameSite:"strict",
            secure:process.env.NODE_ENV !== 'development',
            httpOnly:true
        });
        res.status(200).json({message:"Logged out Successfully"});
    }catch(err){
        console.error("Error in Logout controller", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const updateProfile=async (req:Request<{},{},UpdateProfileRequestBody>,res:Response):Promise<void> => {
    const {fullName,profilePic}=req.body;
    try{

    }catch(err){
        console.error("Profile updation error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}