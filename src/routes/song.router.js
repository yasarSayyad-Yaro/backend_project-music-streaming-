import { Router } from "express";
import { verifyJwt } from "../middlewares/Auth.middleware.js";
import {isArtist} from "../middlewares/isArtist.middleware.js"
import {
   uploadSong,
    getAllSongs,
    updateSongDetails,
    deleteSong,
    toggleisPublished,
    getSongById} from "../controllers/songs.controller.js"
import { upload } from "../middlewares/multer.middleware.js";

const router=Router()

// artist route
router.route("/:upload")
.post(
    verifyJwt,isArtist,upload.fields([
    {
        name:"audioFile",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }
]),
uploadSong
)

router.route("/:songId")
.patch(verifyJwt,isArtist,upload.single("coverImage"),updateSongDetails)
.delete(verifyJwt,isArtist,deleteSong)
.get(verifyJwt,getSongById)


router.route("/toggle/publish/:songId")
.patch(verifyJwt,isArtist,toggleisPublished)

// user routes
router.route("/").get(verifyJwt,getAllSongs)


export default router