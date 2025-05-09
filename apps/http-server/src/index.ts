import express from "express";
import jwt from "jsonwebtoken"
import { authMiddleware } from "./middleware";
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from "@repo/common/types"
import { prismaClient } from "@repo/db/client"
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express()

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL
const JWT_SECRET = process.env.JWT_SECRET as string

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: WEB_URL,    // your Next.js frontend
    credentials: true
}));

app.post("/signup", async (req, res) => {
    const parsedData = CreateUserSchema.safeParse(req.body)

    if (parsedData.error) {
        res.json({
            message: "Incorrect inputs"
        })
        return
    }

    try {
        const user = await prismaClient.user.create({
            data: {
                email: parsedData.data.username,
                // hash password later
                password: parsedData.data.password,
                name: parsedData.data.name,
            }
        })
        // res.send({ userId: user.id })
        res.json({ success: "User has been created" })
    } catch (error) {
        res.status(411).json({ message: "already exist user" })
    }

})


app.post("/signin", async (req, res) => {
    const parsedData = SigninSchema.safeParse(req.body);
    if (parsedData.error) {
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }

    const user = await prismaClient.user.findFirst({
        where: {
            email: parsedData.data.username,
            // hash password later
            password: parsedData.data.password
        }
    })
    if (!user) {
        res.json({ message: "Not authorized" })
        return
    }
    const userId = user.id
    const token = jwt.sign({ userId }, JWT_SECRET)
    res.cookie("token", token, {
        httpOnly: true,      // can't be accessed from JavaScript
        secure: false,        // use only in HTTPS
        sameSite: "lax",     // helps with CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    });
    // res.json({ "token": token })
    res.json({ success: "User is signed" })


})

// @ts-ignore
app.post("/logout", (req, res) => {
    res.clearCookie("token");
    return res.send({ message: "Logged out" });
});

// @ts-ignore: TODO: Fix this
app.post("/room", authMiddleware, async (req, res) => {
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if (parsedData.error) {
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }

    // @ts-ignore: TODO: Fix this
    const userId = req.userId

    try {
        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data.name,
                adminId: userId
            }
        })

        // console.log(room.id);
        res.json({ success: `${room.slug} Room Created` })

    } catch (error) {
        res.status(411).json({
            message: "Room already exists with this name"
        })
    }
})


app.get("/chats/:roomId", async (req, res) => {

    const roomId = Number(req.params.roomId)

    try {
        const chats = await prismaClient.chat.findMany({
            where: {
                roomId: roomId
            },
            // take: 50,
            // orderBy: {
            //     id: "desc"
            // }
        })

        res.json({ chats })
    } catch (error) {
        console.log(error);

    }
})


app.get("/room/:slug", async (req, res) => {
    const slug = req.params.slug;
    const room = await prismaClient.room.findFirst({
        where: {
            slug
        }
    });

    if (!room) {
        res.status(411).json({ message: "Unable to find room" })
        return
    }
    res.json({ id: room.id })
})

app.listen(3001)