import mongoose from "mongoose";

const albumSchema=new mongoose.Schema(
    {
        title:{
            type:String,
            required:true,
            trim:true
        },
        createdBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        songs:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Song"
        }],
        coverImage:{
            type:{
                url:{
                    type:String,
                    required:true
                },
                public_id:{
                     type:String,
                    required:true
                }
            }
        },
        artistDisplayName:{
            type:String,
            trim:true
        },
        visibility:{
            type:String,
            enum:["private","public"],
            default:"public"
        }
    },{timestamps:true})


export const Album=mongoose.model("Album",albumSchema)