import { response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/users.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

const generateAccessTokenAndRefreshToken=async(userId)=>{
    try {
        const user=await User.findById(userId)
        const AccesToken=user.generateAccessToken()
        const RefreshToken=user.generateRefreshToken()

        user.refreshtoken=RefreshToken
        await user.save({validateBeforeSave:false})

        return {AccesToken,RefreshToken}

        
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}


const registerUser=asyncHandler(async(req,res)=>{
    const {fullname,username,email,password}=req.body
    if([fullname,username,email,password].some((field)=> field?.trim() === "")){
        throw new ApiError(400,"All fields are required")
    }

    const existsuser=await User.findOne({
        $or:[{username},{email}]
    })
    if(existsuser){
        throw new ApiError(400,"User already exist with username or email")
    }

    const avatarLocalPath=req.files?.avatar[0]?.path
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar image is required")
    }
    const avatar=await uploadOnCloudinary(avatarLocalPath)

    if(!avatar){
        throw new ApiError(400,"Failed to upload avatar")
    }

    const user=await User.create({
        fullname:fullname.trim(),
        username:username.toLowerCase(),
        email:email.trim().toLowerCase(),
        password:password,
        avatar:avatar.url,
    })

    const createduser=await User.findById(user._id).select("-password -refreshToken")

    if(!createduser){
        throw new ApiError(500,"Something went wrong while creating user")
    }

    return res
    .status(201)
    .json(new ApiResponse(201,createduser,"User created successfully"))
})

const loginUser=asyncHandler(async(req,res)=>{
    const {username,email,password}=req.body

    if(!username||!email){
        throw new ApiError(400,"Either username or email is required")
    }

    const user=await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"username or email does not exist")
    }

    const ispasswordValid=await user.ispasswordValid(password)

    if(!ispasswordValid){
        throw new ApiError(400,"Invalid password")
    }

    const {AccesToken,Refreshtoken}=await generateAccessTokenAndRefreshToken(user._id)

    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",AccesToken,options)
    .cookie("refreshToken",Refreshtoken,options)
    .json(new ApiResponse(200,{user:loggedInUser,AccesToken,Refreshtoken},"User logged In  successfully"))

})

const logoutUser=asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshtoken:undefined
            },
        },
        {
            new:true
        }
    )

    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,"User loggedOut successfully"))
    
})

const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {oldpassword,newpassword}=req.body
    const user=await User.findById(req.user?._id)

    if (!oldpassword || !newpassword || newpassword.trim().length < 6) {
        throw new ApiError(400, "Both old and new passwords are required (min 6 characters).");
    }
    const ispasswordvalid=await user.isPasswordCorrect(oldpassword)

    if(!ispasswordvalid){
        throw new ApiError(400,"Invalid oldpassword")
    }

    user.password=newpassword.trim()
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"password change successfully"))
})

const getCurrentUser=asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200,req.user,"current user fetch successfully"))
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
    const {fullname,email}=req.body

    if(!fullname && !email){
        throw new ApiError(400,"either email or fullname is required")
    }

    const updatedata=[]
    if(fullname) updatedata.fullname=fullname
    if(email) updatedata.email=email

    const updatedDetail=await User.findByIdAndUpdate(
    req.user?._id,    
    {
        $set:updatedata
    },
    {
        new :true
    }
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,updatedDetail,"details updated successfully"))
 })

 const updateAvaterImage=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar image is required")
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400,"error while uploading on cloudinary")
    }

    const user=await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}
    ).select("-password")


    return res
    .status(200)
    .json(new ApiResponse(200,user,"avatar updated successfully"))
 })

 const getWatchHIstory=asyncHandler(async(req,res) => {
    const user=await User.aggregate([
        {
            $match:{
                _id:mongoose.Types.ObjectId(req.user._id)}
        },
        {
            $lookup:{
                from:"songs",
                localField:"history",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                        from:"users",
                        localField:"uploadedBy",
                        foreignField:"_id",
                        as:"uploadedby",
                        pipeline:[
                            {
                            $project:{
                                fullname:1,
                                username:1,
                                avatar:1
                            }
                        }
                    ]

                }
            },
            {
                $addFields:{
                    uploadedby:{
                        $first:"$uploadedby"
                    }
                }
            }
                    

                ]
            }
        },
        {
            $project:{
                watchHistory:1,
                _id:0
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200,user[0]?.watchHistory || [],"watch history fetch successfully"))
 })

const requestArtistRole=asyncHandler(async(req,res)=>{
    if (req.user.artistRequestStatus==="approved"){
        throw new ApiError(400,"user is already an artist")
    }

    if(req.user.artistRequestStatus==="pending"){
        throw new ApiError(400,"Artist request already submitted")
    }


    const user=await User.findByIdAndUpdate(req.user._id,
        {
            artistRequestStatus:"pending"
        },
        {
            new:true
        }
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Artist request submitted successfully"))
})


export {
    registerUser,
    loginUser,
    logoutUser,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvaterImage,
    getWatchHIstory,
    requestArtistRole,
}