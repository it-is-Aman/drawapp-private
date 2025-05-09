"use client"

import { useEffect, useState } from 'react'
// import { WS_URL } from '../config'
import CanvasPage from './CanvasPage'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL
function CanvasRoom({ id, token }: { id: number, token: string }) {
    const [websocket, setWebsocket] = useState<WebSocket | null>(null)

    useEffect(() => {

        if (!token) {
            return
        }

        const ws = new WebSocket(`${WS_URL}?token=${token}`)

        ws.onopen = () => {
            setWebsocket(ws)
            ws.send(JSON.stringify(
                { type: "join", roomId: Number(id) }
            ))
        }

        return () => {
            ws.close();
        };
    }, [id, token])

    if (!websocket) {
        return <h1>Connecting Web Socket....</h1>
    }
    return (
        <CanvasPage socket={websocket} id={id} />
    )
}

export default CanvasRoom