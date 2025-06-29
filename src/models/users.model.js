import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const userSchema=new mongoose.Schema(
    {
        fullname:{
            type:String,
            required:true,
            trim:true,
            index:true
        },
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            required:true,
            lowercase:true,
            trim:true,
        },
        password:{
            type:String,
            required:[true,'Password is required'],

        },
        avatar:{
            type:String,
            required:true,
        },
        history:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Song"
        }],
        refreshToken:{
            type:String,

        },
        artistRequestStatus:{
            type:String,
            enum:["none","pending","approved","rejected"],
            default:"none"
        }
        ,
        isAdmin:{
            type:Boolean,
            default:false
        }
    }
    ,{timestamps:true})


userSchema.plugin(mongooseAggregatePaginate)


userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next()
        
    this.password=await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password,this.password) 
}

userSchema.methods.generateAccessToken=function(){
   return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken=function(){
   return jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        } 
    )
}


export const User=mongoose.model("User",userSchema)