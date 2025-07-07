import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {Song} from "../models/songs.model.js"
import mongoose, { isValidObjectId } from "mongoose";
import { Album } from "../models/albums.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { isValidObjectId } from "mongoose";
import {v2 as cloudinary} from "cloudinary"

// createAlbum
// addSongToAlbum 
// getAlbumById	
// getAlbumsByArtist	
// deleteAlbum

const createAlbum=asyncHandler(async (req,res) => {
    const {title,artistName}=req.body
    if(!title.trim().length===0){
        throw new ApiError(400,"Title is required")
    }

    const coverImagePath=req.file?.path

    if(!coverImagePath){
        throw new ApiError(400,"CoverImage is required")
    }

    const coverImage=await uploadOnCloudinary(coverImagePath)

    if(!coverImage.url){
        throw new ApiError(500,"error while uploading coverImage")
    }
    const newAlbum=await Album.create({
        title:title.trim(),
        artistDisplayName:artistName.trim(),
        coverImage:{
            url:coverImage.url,
            public_id:coverImage.public_id
        },
        createdBy:req.user._id
    })

    if(!newAlbum){
        throw new ApiError(500,"error while creating album")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,newAlbum,"album created successfully"))
})

const addSongToAlbum=asyncHandler(async (req,res) => {
    const {albumId,songId}=req.body
    if(!isValidObjectId(albumId) || ! isValidObjectId(songId)){
        throw new ApiError(400,"invalid song or album id")
    }

    const songExist=await Song.findById(songId)
    if(!songExist){
        throw new ApiError(404,"Song not exits")
    }

    const albumExits=await Album.findOne({
        _id:albumId,
        createdBy:req.user._id
    })

    if(!albumExits) throw new ApiError(404,"album not exits")

    if(albumExits.songs.map(id=>id.toString()).includes(songId)){
        throw new ApiError(400,"Song already present in album")
    }

    const updateAlbum=await Album.findByIdAndUpdate(albumId,
    {
        $addToSet:{
            songs:songId
        }
    },
    {
        new:true
    }
)
.populate("createdBy","username avatar")
.populate("songs","title coverImage duration")

if(!updateAlbum){
    throw new ApiError(500,"error while updating Album")
}

return res
.status(200)
.json(new ApiResponse(200,updateAlbum,"Song added to album successfully"))

})

const getAlbumById=asyncHandler(async (req,res) => {
    const {albumId}=req.params

    if(!isValidObjectId(albumId)){
        throw new ApiError(400,"Invalid album id")
    }

    const album=await Album.findOne({
        _id:albumId,
        $or:[{visibility:"public"},
            {createdBy:req.user._id}
        ]
    })
    .populate("createdBy","username avatar")
    .populate("songs","title coverImage duration")

    if(!album){
        throw new ApiError(404,"album not exits")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,album,"Album fetched successfully"))
    
})

const getAlbumsByArtist=asyncHandler(async (req,res) => {
    
    const {artisname}=req.params

    if(!artisname || artisname.trim()===0){
        throw new ApiError(400,"artist name is required")
    }

    const albums=await Album.find({
        artistDisplayName:{$regex:`${artisname.trim()}`,$options:"i"},
        visibility:"public"
    })
    .populate("createdBy","username avatar")
    .populate("songs","title coverImage duration")

    if(!albums){
        throw new ApiError(400,"No album found for this artist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,albums,"Album fetched successfully"))
})

const deleteAlbum=asyncHandler(async (req,res) => {
    const {albumId}=req.params

    if(!isValidObjectId(albumId)){
        throw new ApiError(400,"Invalid album Id")
    }

    const album=await Album.findOne({
        _id:albumId,
        createdBy:req.user._id
    })

    if(!album){
        throw new ApiError(404,"Album doest exists or not authorized")
    }
    if(album.coverImage?.public_id){
        await cloudinary.uploader.destroy(al)
    }

   const deletedAlbum= await Album.findByIdAndDelete(album.coverImage?.public_id)

   if(!deletedAlbum){
    throw new ApiError(500,"failed to delete album")
   }
    return res
    .status(200)
    .json(new ApiResponse(200,{},"album deleted successfully"))
})

export {
    createAlbum,
    addSongToAlbum,
    getAlbumById,
    getAlbumsByArtist,
    deleteAlbum
}