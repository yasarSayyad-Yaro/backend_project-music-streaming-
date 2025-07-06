import mongoose from "mongoose";

const likeSchema=new mongoose.Schema(
    {
        song:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Song",
            required:true
        },
        likedBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        }
    },{timestamps:true})

    likeSchema.index(
        {
        song:1,
        likedBy:1
    },
    {unique:true}
)
    export const Like=mongoose.model("Like",likeSchema)