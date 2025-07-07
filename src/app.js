import express, { json } from "express";
import cors from "cors"
import cookieParser from "cookie-parser";


const app=express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json(
    {
        limit:"16kb"
    }
))
app.use(express.urlencoded({
    extended:true,limit:"16kb"
}))

app.use(express.static("public"))

app.use(cookieParser())


import userRouter from "./routes/user.routes.js"
import adminRouter from "./routes/admin.routes.js"
import albumRouter from "./routes/album.routes.js"
import songRouter from "./routes/song.router.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"

app.use("/api/v1/users",userRouter)

app.use("/api/v1/security/admin",adminRouter)

app.use("/api/v1/songs",songRouter)

app.use("/api/v1/albums",albumRouter)

app.use("/api/v1/likes",likeRouter)

app.use("/api/v1/playlists",playlistRouter)


export {app} 