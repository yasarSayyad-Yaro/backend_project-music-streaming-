import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

export const isArtist=asyncHandler(async(req,res,next)=>{
    if(!req.user?.artistRequestStatus !== "approved"){
        throw new ApiError(403,"Only Artist can access this page")
    }

    next()
})