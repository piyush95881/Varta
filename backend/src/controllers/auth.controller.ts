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

export const signup = async (req: Request<{}, {}, SignupRequestBody>, res: Response):Promise<void> => {
    const { fullName, email, password } = req.body;

    try {
        if (password.length < 6) {
            res.status(400).json({ message: "Password must be at least 6 characters" });
            return;
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


// export const login= (req,res)=>{
//     res.send("signup route");
// }
//
// export const logout= (req,res)=>{
//     res.send("signup route");
// }