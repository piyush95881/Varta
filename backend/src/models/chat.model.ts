import mongoose, { Schema, Types} from "mongoose";
import {Document} from "mongoose";

export interface chatModel extends Document{
    SenderId:Types.ObjectId;
    ReceiverId:Types.ObjectId;
    text:string;
    picture:string;
    createdAt?: Date;
    updatedAt?: Date;
}

const messageSchema = new Schema<chatModel>({
    SenderId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    ReceiverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    text:{
        type:String
    },
    picture:{
        type:String
    }
},{
    timestamps:true,
})

const Message=mongoose.model<chatModel>("Message",messageSchema);
export default Message;