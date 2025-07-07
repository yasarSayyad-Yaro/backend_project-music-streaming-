import { Router } from "express";
import { verifyJwt } from "../middlewares/Auth.middleware.js";
import {
   createPlaylist,
    addSongToPlaylist,
    getUserPlaylist,
    removeSongFromPlaylist,
    deletePlaylist,
    getPlaylistById} from "../controllers/playlists.controller.js"

const router=Router()

router.route("/user/").get(verifyJwt,getUserPlaylist)

router.route("/:playlistId")
.get(verifyJwt,getPlaylistById)
.delete(verifyJwt,deletePlaylist)

router.route("/add/:songId")
.patch(verifyJwt,addSongToPlaylist)

router.route("/remove-song/:songId").patch(verifyJwt,removeSongFromPlaylist)


router.route("/").post(verifyJwt,createPlaylist)


export default router