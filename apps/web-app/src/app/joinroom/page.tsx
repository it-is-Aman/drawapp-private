"use client"

import axios from "axios";
import { useState } from "react";
import { redirect, useRouter } from "next/navigation";

const BACKEND_URL=process.env.NEXT_PUBLIC_API_URL

const JoinRoom = () => {

    const [roomName, setRoomName] = useState("")
    const [message, setMessage] = useState("")

    const router = useRouter()

    const handleClick = async () => {
        const response = await axios.get(`${BACKEND_URL}/room/${roomName}`)
        if (response.data) {
            setMessage("Redirecting to join room")
            redirect(`canvas/${response.data.id}`)
        }
    }

    const handleCreate = () => {
        router.push("/createroom")
    }

    return (
        <div className=" flex flex-col gap-3 items-center justify-center min-h-screen p-3 rounded-full">
            <label>room name</label>
            <input type="text" onChange={e => setRoomName(e.target.value)} />
            <button onClick={handleClick}>Join room</button>

            <div className=" rounded-2xl border p-2 gap-2 min-w-screen">
                <button onClick={handleCreate}>Create Room</button>
            </div>
            {message && < div className=" rounded-2xl border p-2 w-full h-12">
                {message}
            </div>}
        </div>
    );
}

export default JoinRoom;