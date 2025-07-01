import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const songSchema=new mongoose.Schema(
    {
        title:{
            type:String,
            required:true,
            trim:true,
            lowercase:true,
            index:true
        },
        artistDisplayName:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        genre:{
            type:String,
            enum:["rock","classical","Lo-fi","soundtrack","Other"],
            default:"Other"
        },
        audioFile:{
            url:{
                type:String,
                required:true
            },
            public_id:{
                type:String,
                required:true
            }
        },
        coverImage:{
             url:{
                type:String,
                required:true
            },
            public_id:{
                type:String,
                required:true
            }
        },
        duration:{
            type:Number,
            default:0
        },
        uploadedBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        isPublished:{
            type:Boolean,
            required:true
        }
    }
    ,{timestamps:true})

songSchema.plugin(mongooseAggregatePaginate)


export const Song=mongoose.model("Song",songSchema)