import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/users.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const pendingIsArtistRequest=asyncHandler(async(req,res)=>{
    const {page=1,limit=10}=req.query

    const aggregation=User.aggregate([
        {
            $match:{
                artistRequestStatus:"pending"
            }
        },
        {
            $sort:{
                createdAt:-1
            }
        },
        {
            $project:{
                password:0,
                refreshtoken:0
            }
        }
    ])

    const result=await User.aggregatePaginate(aggregation,{
        page:parseInt(page),
        limit:parseInt(limit)
    })

    return res
    .status(200)
    .json(new ApiResponse(200,result,"Pending artist request fetched successfully"))
})


const approveRequest=asyncHandler(async(req,res)=>{
    const {userid,action}=req.body

    if(!["approve","reject"].includes(action)){
        throw new ApiError(400,"Invalid action. use 'approve' or 'reject' ")
    }

    const user=await User.findById(userid)

    if(!user){
        throw new ApiError(400,"User not found")
    }

    if(user.artistRequestStatus !== "pending"){
        throw new ApiError(400,"No pending artist request for this user")
    }
    user.artistRequestStatus = action === "approve"?"approved":"rejected"

    await user.save()

    return res
    .status(200)
    .json(new ApiResponse(200,user, `Artist request ${action}ed successfully`))

})


export {
    pendingIsArtistRequest,
    approveRequest
}