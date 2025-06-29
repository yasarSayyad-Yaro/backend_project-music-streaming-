import { Router } from "express";
import {isAdminVerify} from "../middlewares/Auth2.middleware.js"
import {pendingIsArtistRequest,
    approveRequest} from "../controllers/admin.controller.js"
import { verifyJwt } from "../middlewares/Auth.middleware.js";


const router = Router()

router.route("/pending-request").get(verifyJwt,isAdminVerify,pendingIsArtistRequest)
// @route   GET /api/v1/security/admin/pending-request
// @desc    Get all pending artist requests
// @access  Admin only

router.route("/request-action").post(verifyJwt,isAdminVerify,approveRequest)

// @route   POST /api/v1/security/admin/request-action
// @desc    Approve or reject artist request
// @access  Admin only


export default router
