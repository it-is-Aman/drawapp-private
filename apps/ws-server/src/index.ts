import { WebSocket, WebSocketServer } from 'ws';
import jwt from "jsonwebtoken"
import { prismaClient } from '@repo/db/client';

const wss = new WebSocketServer({ port: 8080 });

interface userProps {
    ws: WebSocket,
    room: string[],
    userId: string,
}

const users: userProps[] = []

const JWT_SECRET = process.env.JWT_SECRET as string
const verifyUser = (token: string): string | null => {
    try {
        const decode = jwt.verify(token, JWT_SECRET)
        if (typeof decode == "string") {
            return null
        }

        if (!decode || !decode.userId) {
            return null
        }

        return decode.userId
    } catch (error) {
        return null
    }
}


wss.on('connection', function connection(ws, request) {

    const url = request.url

    // access query params
    const queryUrl = new URLSearchParams(url?.split("?")[1])

    const token = queryUrl.get("token") || ""
    const userId = verifyUser(token)


    if (userId == null) {
        ws.close()
        return null
    }

    users.push({
        ws,
        room: [],
        userId
    })

    ws.on('message', async function message(data) {
        // message come in string format so convert into object
        const parsedData = JSON.parse(data as unknown as string)        // {type:"join",roomId:454}

        if (parsedData.type === "join") {
            const user = users.find(u => u.ws === ws)
            user?.room.push(parsedData.roomId)
        }
        if (parsedData.type === "leave") {
            const user = users.find(u => u.ws === ws)
            if (!user) {
                return
            }

            // it does not actually update user.room unless the result is reassigned back
            user.room = user.room.filter(r => r != parsedData.roomId)
        }
        if (parsedData.type === "chat") {            // {type:"chat",roomId:454,message:"yoooooo"}
            const message = parsedData.message
            const roomId = parsedData.roomId

            await prismaClient.chat.create({
                data: {
                    message: message,
                    roomId: roomId,
                    userId: userId
                }
            })

            users.forEach(user => {
                if (user.room.includes(roomId)) {
                    user.ws.send(
                        // need to be send in string
                        JSON.stringify({ type: "chat", message, roomId })
                    )
                }
            })

        }

    });

});