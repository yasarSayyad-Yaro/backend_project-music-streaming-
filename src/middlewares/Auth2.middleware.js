import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler.js";

export const isAdminVerify=asyncHandler(async(req,res,next)=>{
    if(!req.user?.isAdmin){
        throw new ApiError(403,"Admin access only")
    }

    next()
})