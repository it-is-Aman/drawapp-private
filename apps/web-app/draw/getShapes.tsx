import axios from "axios"

const BACKEND_URL=process.env.NEXT_PUBLIC_API_URL

export async function getShapes(id: number) {
    const response = await axios.get(`${BACKEND_URL}/chats/${id}`)

    // array of chats [{id: 4, roomId: 1, message: '{type: "rectangle", x: 0, y: 0, w: 24, h: 52}', userId: '4d-sd7-asda'}]
    const chats = response.data.chats

    const Shapes = chats.map((x: { message: string }) => {
        const message = JSON.parse(x.message)
        return message
    })
    return Shapes
}