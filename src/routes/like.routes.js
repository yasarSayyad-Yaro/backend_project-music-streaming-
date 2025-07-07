import { Router } from "express";
import { 
    toggleSongLike,
    getUserLikeSong} from "../controllers/likes.controller.js"

import { verifyJwt } from "../middlewares/Auth.middleware.js";


const router=Router()

router.route("/").get(verifyJwt,getUserLikeSong)

router.route("/toggle/:songId").post(verifyJwt,toggleSongLike)


export default router