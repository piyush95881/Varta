import {Request,Response} from "express";
import User, {IUser} from "../models/user.model";
import Message from "../models/chat.model";
import cloudinary from "../lib/cloudinary";
import mongoose from "mongoose";

interface MessageModel{
    text:string;
    picture:string;
}
export const getUsersForSidebar = async (req: Request & { user?: IUser }
    , res: Response):Promise<void> => {
    try {
        const loggedUserId = req.user?._id;
        console.log("User:", req.user);
        if (!loggedUserId){
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const allUsers = await User.find({ _id: { $ne: loggedUserId } }).select("-password");
        res.status(200).json(allUsers);
        return;
    } catch (err) {
        console.error("Error in getUsersForSidebar controller:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// GET chat messages between two users
export const getChatMessages = async (req: Request & { user?: IUser }
    , res: Response):Promise<void> => {
    try {
        const senderId = req.user?._id;
        const receiverParam = req.params.id;

        if (!senderId || !mongoose.Types.ObjectId.isValid(receiverParam)) {
            res.status(400).json({ message: "Invalid sender or receiver ID" });
            return;
        }

        const receiverId = new mongoose.Types.ObjectId(receiverParam);

        const chats = await Message.find({
            $or: [
                { SenderId: senderId, ReceiverId: receiverId },
                { SenderId: receiverId, ReceiverId: senderId },
            ],
        }).sort({ createdAt: 1 })
            .populate("SenderId ReceiverId");


        res.status(200).json(chats);
    } catch (err) {
        console.error("Error in getChatMessages controller:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const sendMessages = async (
    req: Request<{ id: string }, {}, MessageModel> & { user?: IUser }
    ,
    res: Response
): Promise<void> => {
    try {
        const { text, picture } = req.body;
        const receiverId = new mongoose.Types.ObjectId(req.params.id);
        if (!req.user) {
            res.status(401).json({ message: "Unauthorized user problem" });
            return;
        }
        const senderId = req.user._id;

        let imgUrl = '';
        if (picture) {
            const uploadImage = await cloudinary.uploader.upload(picture, {
                public_id: `chat_${senderId}_${receiverId}`,
            });
            imgUrl = uploadImage.secure_url;
        }

        let newMessage;
        if (!text && !imgUrl) {
            res.status(400).json({ message: "Put something to chat" });
            return;
        }
        newMessage = new Message({
            SenderId: senderId,
            ReceiverId: receiverId,
            ...(text && { text }),
            ...(imgUrl && { picture: imgUrl }),
        });

        await newMessage.save();

        res.status(200).json(newMessage);
        return;
    } catch (err) {
        console.error("Error in sendMessages controller: ", err);
        res.status(500).json({ error: "Internal Server Error" });
        return;
    }
};
