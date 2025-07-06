import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { Song } from "../models/songs.model.js";
import { Like } from "../models/likes.model.js";
import { ApiResponse } from "../utils/apiResponse.js";




const toggleSongLike=asyncHandler(async (req,res) => {
    const {songId}=req.params

    if(!isValidObjectId(songId)){
        throw new ApiError(400,"Invalid song id")
    }

    const existSong=await Song.findById(songId)
    if(!existSong){
        throw new ApiError(404,"Song not Exists")
    }

    const existLike=await Like.findOne({
        song:songId,
        likedBy:req.user._id
    })

    if(existLike){
        await Like.findByIdAndDelete(existLike._id)
        return res
        .status(200)
        .json(new ApiResponse(200,{}," SOng Unliked successfully"))
    }

    await Like.create({
        song:songId,
        likedBy:req.user._id
    })

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Song Liked successfully"))
})

const getUserLikeSong=asyncHandler(async (req,res) => {
    const likeSong=await Like.find({
        likedBy:req.user._id
    })
    .populate("song","title coverImage duration")

    return res
    .status(200)
    .json(new ApiResponse(200,likeSong,"Liked songs fetched successfully"))

})


export {
    toggleSongLike,
    getUserLikeSong
}