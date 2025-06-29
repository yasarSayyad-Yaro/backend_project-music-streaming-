import { Router } from "express";
import { registerUser,
         loginUser,
         logoutUser,
         changeCurrentPassword,
         getCurrentUser,
         updateAccountDetails,
         updateAvaterImage,
         getWatchHIstory,
         requestArtistRole
 } from "../controllers/users.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJwt } from "../middlewares/Auth.middleware.js";

const router =Router()

router.route("/register").post(upload.single("avatar"),registerUser)

router.route("/login").post(loginUser)


// secured routes
router.route("/logout").post(verifyJwt,logoutUser)

router.route("/change-password").patch(verifyJwt,changeCurrentPassword)

router.route("/current-user").get(verifyJwt,getCurrentUser)

router.route("/update-account").patch(verifyJwt,updateAccountDetails)

router.route("/avatar").patch(verifyJwt,upload.single("avatar"),updateAvaterImage)

router.route("/history").get(verifyJwt,getWatchHIstory)

router.route("/request-artist").post(verifyJwt,requestArtistRole)

export default router