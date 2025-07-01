import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {Song} from "../models/songs.model.js"
import {v2 as cloudinary} from "cloudinary"



const uploadSong=asyncHandler(async(req,res)=>{
    const {title,genre,artistDisplayName}=req.body

    if(!title || !artistDisplayName){
        throw new ApiError(400,"both title and ArtistDisplay name required")
    }
    const allowedGenres = ["rock","classical","lo-fi","soundtrack","others"]

    if(!allowedGenres.includes(genre.trim().toLowerCase()))
    {
        throw new ApiError(400, `Invalid genre. Choose from: ${allowedGenres.join(", ")}`)
    }

    const coverImagepath=req.files?.coverImage[0].path

    if(!coverImagepath){
        throw new ApiError(400,"Cover image is required")
    }

    const audioFilepath=req.files?.audioFile[0].path

    if(!audioFilepath){
        throw new ApiError(400,"Audio file is required")
    }

    const coverImage=await uploadOnCloudinary(coverImagepath)

    if(!coverImage.url){
        throw new ApiError(500,"error while uploading on cloudinary")
    }

    const audioFile=await uploadOnCloudinary(audioFilepath,"video")

    if(!audioFile.url){
        throw new ApiError(500,"error while uploading on cloudinary")
    }

    const newSong=await Song.create({
        title:title.trim(),
        artistDisplayName:artistDisplayName.trim(),
        genre:genre.trim().toLowerCase(),
        audioFile:{
            url:audioFile.url,public_id:audioFile.public_id
        },
        coverImage:{
            url:coverImage.url,public_id:coverImage.public_id
        },
        duration:audioFile.duration,
        uploadedBy:req.user?._id,
    })

    if(!newSong){
        throw new ApiError(500,"Song document not created successfully")
    }

    return res
    .status(201)
    .json(new ApiResponse(201,newSong,"Song uploaded successfully"))
})

const getAllSongs=asyncHandler(async(req,res)=>{
    const {page=1,limit=10,search="",genre}=req.query

    // const songs=await Song.find({isPublished :true})
    // .sort({createdAt:-1})
    // .skip((page-1)*limit)
    // .limit(parseInt(limit))

    // if(!songs || songs.length === 0){
    //     throw new ApiError(404,"no songs found")
    // }

    const query={
        isPublished:true
    }
    if(search.trim() !== ""){
        query.$or = [
            {title:{$regex:search,$options:"i"}},
            {artistDisplayName:{$regex:search,$options:"i"}}
        ]
    }

    if(genre){
        query.genre=genre.trim().toLowerCase()
    }

    const songs=await Song.find(query)
    .sort({createdAt:-1})
    .skip((page-1)*limit)
    .limit(parseInt(limit))

    const total = await Song.countDocuments(query)

    if(!songs || songs.length===0){
        throw new ApiError(404,"NO songs found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,
        {songs,pagination:{
        total,
        page:parseInt(page),
        limit:parseInt(limit),
        totalPages:Math.ceil(total / limit)}
    },"Fetched songs successfully"))
})

const updateSongDetails=asyncHandler(async(req,res)=>{
    const {title,genre,artistDisplayName}=req.body
    const {songId}=req.params

    const updateSong={}
    const song=await Song.findOne({
        _id:songId,
        uploadedBy:req.user._id
    })

    if(!song) throw new ApiError(404,"song not found or not authorized")

    if(!title && !genre && !artistDisplayName && !req.file){
        throw new ApiError(400,"Nothing is provided")
    }

    if(genre){
        const allowedGenres=["rock","classical","lo-fi","soundtrack","others"]

        if(! allowedGenres.includes(genre.trim().toLowerCase())){
            throw new ApiError(404,`Invalid genre. allowed : ${allowedGenres.join(", ")}`)
        }

        updateSong.genre=genre.trim().toLowerCase()
        // song.genre=genre.trim().toLowerCase()
    }

    if(title){
        updateSong.title=title.trim()
        // song.title=title.trim()
    }

    if(artistDisplayName){
        // song.artistDisplayName=artistDisplayName.trim()
        updateSong.artistDisplayName=artistDisplayName.trim()
    }

    const coverImagePath=req.file?.path

    if(coverImagePath){
        const coverImage=await uploadOnCloudinary(coverImagepath)

        if(!coverImage.url){
        throw new ApiError(500,"error while uplloading on cloudinary")
    }

        updateSong.coverImage={
            url:coverImage.url,
            public_id:coverImage.public_id
        }
    }

   

    // song.coverImage={
    //     url:coverImage.url,
    //     public_id:coverImage.public_id
    // }

    // await song.save()

    const newSong=await Song.findByIdAndUpdate(songId,
        {
            $set:updateSong,
        },
        {new:true}
    )


    return res
    .status(200)
    .json(new ApiResponse(200,newSong,"Song details updated successfully"))

})

const deleteSong=asyncHandler(async(req,res)=>{
    const {songid}=req.params

    const validsong=await Song.findOne({
        _id:songid,
        uploadedBy:req.user._id
    })

    if(!validsong){
        throw new ApiError(404,"No such song found or unauthorized access")
    }

    if(validsong.audioFile?.public_id){
        await cloudinary.uploader.destroy(validsong.audioFile?.public_id,{resource_type:"video"})
    }
     if(validsong.coverImage?.public_id){
        await cloudinary.uploader.destroy(validsong.coverImage?.public_id)
    }

    await Song.findByIdAndDelete(songid)

    return res
    .status(200)
    .json(new ApiResponse(200,{},"song deleted successfully"))
})

const toggleisPublished=asyncHandler(async (req,res)=>{
    const {songid}=req.params

    const validsong=await Song.findOne({
        _id:songid,
        uploadedBy:req.user._id
    })

    if(!validsong){
        throw new ApiError(404,"No such song found or unauthorized access")
    }

    validsong.isPublished=!validsong.isPublished
    await validsong.save()

    return res
    .status(200)
    .json(new ApiResponse(200,validsong,"song status updated successfully"))

})

const getSongById=asyncHandler(async(req,res)=>{
    const {songid} = req.params

    const song=await Song.findById(songid).populate("uploadedBy", "fullname username avatar")

    if(!song || !song.isPublished){
        throw new ApiError(404,"Song not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,song,"Fetched song successfully"))
})

export {
    uploadSong,
    getAllSongs,
    updateSongDetails,
    deleteSong,
    toggleisPublished,
    getSongById

}