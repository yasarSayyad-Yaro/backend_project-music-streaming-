import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {Song} from "../models/songs.model.js"
import { Playlist } from "../models/playlists.model.js";
import mongoose, { isValidObjectId } from "mongoose";

const createPlaylist=asyncHandler(async(req,res)=>{
    const {name}=req.body

    if(!name || name.trim().length===0){
        throw new ApiError(400,"Name is required ")
    }

    const playlist = await Playlist.create(
        {
            name:name.trim(),
            owner: mongoose.Types.ObjectId(req.user._id)
        }
    )

    if(!playlist){
        throw new ApiError(500,"error while creating playlist")
    }

    return res
    .status(201)
    .json(new ApiResponse(201,playlist,"playlist created successfully"))
})

const addSongToPlaylist=asyncHandler(async(req,res)=>{
    const {songid,playlistId}=req.body

    if(!songid || !playlistId){
        throw new ApiError(400,"both song and playlist ID required")
    }

    if(!isValidObjectId(songid) || !isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist or song id")
    }


    const playlist=await Playlist.findOne({
        _id:playlistId,
        owner:req.user._id
    })

    if(!playlist){
        throw new ApiError(404,"No playlist found or unauthorized")
    }

    const song=await Song.findById(songid)

    if(!song) throw new ApiError(404,"No song found")

    if(playlist.songs.map(id=>id.toString()).includes(songid)){
        throw new ApiError(400,"Song already present in playlist")
    }

    const updatePlaylist=await Playlist.findByIdAndUpdate(playlistId,
        {
            $addToSet:{
                songs:songid
            }
        },
        {
            new:true
        }
    ).populate("owner","username avatar")

    if(!updatePlaylist){
        throw new ApiError(500,"error while updating playlist")
    }

    
    return res
    .status(200)
    .json(new ApiResponse(200,updatePlaylist,"Song added to playlist"))


})

const getUserPlaylist=asyncHandler(async (req,res) => {
    const playlist=await Playlist.aggregate([
        {
            $match:{
                owner:req.user._id
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"playlistOwner"
            }
        },
        {
            $unwind:"$playlistOwner"
        },
        {
            $lookup:{
                from:"songs",
                localField:"songs",
                foreignField:"_id",
                as:"songDetails"
            }
        },
        {
            $project:{
                name:1,
                createdAt:1,
                updatedAt:1,
                "playlistOwner.username":1,
                "playlistOwner.avatar":1,
                songDetails:{
                    title:1,
                    artistDisplayName:1,
                    coverImage:1
                }
            }
        }
    ]) 
    
    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"user playlist fetched successfully"))
})

const removeSongFromPlaylist=asyncHandler(async (req,res) => {
     const {songid,playlistId}=req.body

    if(!songid || !playlistId){
        throw new ApiError(400,"both song and playlist ID required")
    }

    if(!isValidObjectId(songid) || !isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist or song id")
    }


    const playlist=await Playlist.findOne({
        _id:playlistId,
        owner:req.user._id
    })

    if(!playlist){
        throw new ApiError(404,"No playlist found or unauthorized")
    }

    if(!playlist.songs.map(id=>id.toString()).includes(songid)){
        throw new ApiError(400,"Song not present in playlist")
    }

    const updatePlaylist=await Playlist.findByIdAndUpdate(playlistId,
        {
            $pull:{
                songs:songid
            }
        },
        {
            new:true
        }
    ).populate("songs","title coverImage duration")
     .populate("owner","username avatar")

     return res
     .status(200)
     .json(new ApiResponse(200,updatePlaylist,"Song removed from playlist successfully"))
    
})

const getPlaylistById=asyncHandler(async (req,res) => {
    const {playlistId}=req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlistId")
    }

    const playlist=await Playlist.findOne({
        _id:playlistId,
        owner:req.user._id
    })
    .populate("songs","_id title coverImage duration ")
    .populate("owner","username avatar")

    if(!playlist){
        throw new ApiError(404,"No playlist found or you do not have access.")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Playlist fetched successfully"))
})

const deletePlaylist=asyncHandler(async (req,res) => {
     const {playlistId}=req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlistId")
    }

    const playlist=await Playlist.findOne({
        _id:playlistId,
        owner:req.user._id
    })

    if(!playlist){
        throw new ApiError(404,"No playlist found or you do not have access.")
    }

    await playlist.deleteOne()

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Playlist deleted successfully"))
    
})


export {
    createPlaylist,
    addSongToPlaylist,
    getUserPlaylist,
    removeSongFromPlaylist,
    deletePlaylist,
    getPlaylistById
}