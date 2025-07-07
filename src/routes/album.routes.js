import { Router } from "express";
import { verifyJwt } from "../middlewares/Auth.middleware.js";
import {isArtist} from "../middlewares/isArtist.middleware.js"
import {
    createAlbum,
    addSongToAlbum,
    getAlbumById,
    getAlbumsByArtist,
    deleteAlbum} from "../controllers/album.controller.js"
import { upload } from "../middlewares/multer.middleware.js";


const router=Router()

//user routes
router.route("/").get(verifyJwt,getAlbumById)
router.route("/artist/:artistName").get(verifyJwt,getAlbumsByArtist)



//Artist routes
router.route("/create").post(verifyJwt,isArtist,upload.single("coverImage"),createAlbum)

router.route("/:albumId/add-song").post(verifyJwt,isArtist,addSongToAlbum)

router.route("/:albumId").delete(verifyJwt,isArtist,deleteAlbum)



export default router