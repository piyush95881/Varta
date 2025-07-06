import {Request,Response} from "express";
import User, {IUser} from "../models/user.model";
import Message from "../models/chat.model";
import cloudinary from "../config/cloudinary";
import mongoose from "mongoose";
import {getReceiverSocketid, io} from "../lib/socket";

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

        const normalizedChats = chats.map((msg) => ({
            ...msg.toObject(),
            SenderId: msg.SenderId._id?.toString?.() || msg.SenderId.toString?.(),
            ReceiverId: msg.ReceiverId._id?.toString?.() || msg.ReceiverId.toString?.(),
        }));



        res.status(200).json(normalizedChats);
    } catch (err) {
        console.error("Error in getChatMessages controller:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const sendMessages = async (
    req: Request<{ id: string }, {}, MessageModel> & { user?: IUser },
    res: Response
): Promise<void> => {
    try {
        const { text, picture } = req.body;
        const receiverId = new mongoose.Types.ObjectId(req.params.id);

        if (!req.user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const senderId = req.user._id;

        let imgUrl = "";

        // Handle image upload if picture is present
        if (picture) {
            try {
                const uploadImage = await cloudinary.uploader.upload(picture, {
                    public_id: `chat_${senderId}_${receiverId}_${Date.now()}`,
                });
                imgUrl = uploadImage.secure_url;
            } catch (error) {
                console.error("Cloudinary upload failed:", error);
                res.status(500).json({ message: "Image upload failed" });
                return;
            }
        }

        // Validate that at least one of text or image is present
        if (!text?.trim() && !imgUrl) {
            res.status(400).json({ message: "Cannot send empty message" });
            return;
        }

        // Create message object conditionally
        const newMessage = new Message({
            SenderId: senderId,
            ReceiverId: receiverId,
            ...(text?.trim() && { text: text.trim() }),
            ...(imgUrl && { picture: imgUrl }),
        });

        await newMessage.save();

        // Emit socket event if receiver is online
        const receiverSocketId = getReceiverSocketid(receiverId.toString());
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(200).json(newMessage);
    } catch (err) {
        console.error("Error in sendMessages controller:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
